#!/usr/bin/env python3
"""
Main entry point for the projects scraper.
Script to extract project data from a Google Docs link and output as JSON.
Usage: python -m projectsScraper <google_docs_url> <key> [--raw] [--screenshots]
"""

import sys
import json
import os
from pathlib import Path

from .google_docs import get_google_docs_text
from .parser import parse_projects
from .screenshot import capture_project_screenshots, extract_main_title, sanitize_filename


def format_key_for_folder(key):
    """Convert key to folder name format (remove spaces, uppercase)."""
    return key.replace(" ", "").upper()


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 3:
        print("Usage: python -m projectsScraper <google_docs_url> <key> [--raw] [--screenshots]")
        print("\nExample:")
        print(
            '  python -m projectsScraper https://docs.google.com/document/d/1abc123/edit "Fall 2025"'
        )
        print("\nArguments:")
        print("  <key>         Key name for the projects (e.g., 'Fall 2025')")
        print("\nOptions:")
        print("  --raw         Output raw text instead of parsed JSON")
        print("  --screenshots Capture screenshots of project websites")
        sys.exit(1)

    url = sys.argv[1]
    key = sys.argv[2]
    raw_output = "--raw" in sys.argv
    capture_screenshots = "--screenshots" in sys.argv

    try:
        text_content = get_google_docs_text(url, include_links=True)

        if raw_output:
            print(text_content)
        else:
            # Parse projects and output as JSON
            projects = parse_projects(text_content)
            # Convert empty strings to null for cleaner JSON
            # Also extract main title (remove collaboration part)
            for project in projects:
                for field_key, value in project.items():
                    if value == "":
                        project[field_key] = None
                # Extract main title (before parentheses)
                if "title" in project and project["title"]:
                    project["title"] = extract_main_title(project["title"])

            # Capture screenshots if requested
            folder_key = format_key_for_folder(key)
            if capture_screenshots:
                image_paths = capture_project_screenshots(projects, folder_key=folder_key)
                # Add image paths to projects (use captured paths if available)
                for project in projects:
                    title = project.get("title")
                    if title in image_paths:
                        project["image"] = image_paths[title]
                    else:
                        # Fallback: generate path from title
                        filename = sanitize_filename(title) + ".webp"
                        project["image"] = f"/Projects/{folder_key}/{filename}"
            else:
                # Add image paths based on title even without screenshots
                for project in projects:
                    title = project.get("title")
                    if title:
                        filename = sanitize_filename(title) + ".webp"
                        project["image"] = f"/Projects/{folder_key}/{filename}"

            # Print to console
            print(json.dumps(projects, indent=2))

            # Write to projects.json
            # Path from Scripts directory: go up one level to src, then Assets/Data/projects.json
            # __file__ is in projectsScraper/main.py, so we go: projectsScraper -> Scripts -> src -> Assets/Data
            projects_json_path = (
                Path(__file__).parent.parent.parent / "Sites" / "Main" / "Pages" / "Projects" / "Data" / "projects.json"
            )
            try:
                # Read existing file if it exists
                if projects_json_path.exists():
                    with open(projects_json_path, "r", encoding="utf-8") as f:
                        existing_data = json.load(f)
                else:
                    existing_data = {"about": {}, "images": [], "projects": {}, "archive": {}}

                # Update the projects section with the new key
                if "projects" not in existing_data:
                    existing_data["projects"] = {}

                existing_data["projects"][key] = projects

                # Write back to file
                with open(projects_json_path, "w", encoding="utf-8") as f:
                    json.dump(existing_data, f, indent=2, ensure_ascii=False)

                print(
                    f"\n✓ Data written to {projects_json_path} under key '{key}'", file=sys.stderr
                )
            except Exception as e:
                print(f"\nWarning: Failed to write to projects.json: {e}", file=sys.stderr)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
