"""
Project data parsing functionality.
"""

import re
from urllib.parse import unquote


def parse_projects(text_content):
    """
    Parse project data from Google Docs text content.

    Expected format:
    - Project title and mentor on one line (e.g., "CityPulse; Mentored by Aryan")
    - Followed by fields like:
      - Design Document (Overleaf/Docs link): [link]
      - GitHub Repository: [link]
      - Code Documentation (README.md/Docs): [link]
      - Meeting Logs (Notion/Docs link): [link]
      - Presentation Slides (Canva/Slides link): [link]
      - Deployed Website/Report Link: [link]

    Args:
        text_content: Text content with links in format "text: url"

    Returns:
        list: List of project dictionaries
    """
    projects = []
    lines = text_content.split("\n")

    current_project = None
    field_patterns = {
        "design_document": re.compile(r"design\s+document", re.IGNORECASE),
        "github_repository": re.compile(r"github\s+repository", re.IGNORECASE),
        "code_documentation": re.compile(r"code\s+documentation", re.IGNORECASE),
        "meeting_logs": re.compile(r"meeting\s+logs", re.IGNORECASE),
        "presentation_slides": re.compile(r"presentation\s+slides", re.IGNORECASE),
        "website": re.compile(r"(?:deployed\s+)?website|report\s+link", re.IGNORECASE),
    }

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        # Check if this is a project title line (contains "Mentored by" or similar)
        mentor_match = re.search(r"mentored\s+by\s+([^;:]+)", line, re.IGNORECASE)
        if mentor_match:
            # Start a new project
            if current_project:
                projects.append(current_project)

            # Extract title and mentor
            mentor = mentor_match.group(1).strip()
            title = re.sub(r"[;:].*mentored\s+by.*", "", line, flags=re.IGNORECASE).strip()

            current_project = {
                "title": title,
                "mentor": mentor,
                "design_document": "",
                "github_repository": "",
                "code_documentation": "",
                "meeting_logs": "",
                "presentation_slides": "",
                "website": "",
            }
            i += 1
            continue

        # Check if this line contains a field label and link
        if current_project:
            # Process all fields that might be on this line
            # The line might have multiple fields concatenated like:
            # "Design Document: https://...GitHub Repository: https://..."

            # Find all field patterns and their positions in the line
            field_matches = []
            line_lower = line.lower()
            for field_key, pattern in field_patterns.items():
                for match in pattern.finditer(line_lower):
                    field_matches.append((match.start(), field_key))

            # Sort by position
            field_matches.sort(key=lambda x: x[0])

            if field_matches:
                # Extract each field's link
                for idx, (pos, field_key) in enumerate(field_matches):
                    # Find the section from this field to the next field (or end of line)
                    start_pos = pos
                    end_pos = (
                        field_matches[idx + 1][0] if idx + 1 < len(field_matches) else len(line)
                    )
                    field_section = line[start_pos:end_pos]

                    # Look for URL pattern - could be "Field: url" or "Field: text: url"
                    # Try to find the actual URL (starts with http:// or https://)
                    url_pattern = r"(https?://[^\s\"'<>]+)"
                    url_matches = list(re.finditer(url_pattern, field_section))

                    if url_matches:
                        # Take the first URL found in this section
                        link = url_matches[0].group(1)
                        # Clean up - remove any Google redirect wrapper if present
                        if "google.com/url?" in link:
                            # Try to extract the actual URL from Google redirect
                            q_match = re.search(r"[?&]q=([^&]+)", link)
                            if q_match:
                                link = unquote(q_match.group(1))

                        # Stop at the start of the next field name if it appears in the URL
                        for other_field_key, other_pattern in field_patterns.items():
                            if other_field_key != field_key:
                                match = other_pattern.search(link.lower())
                                if match:
                                    link = link[: match.start()].rstrip()

                        current_project[field_key] = link
            else:
                # No field pattern found, check if line is just a field label
                field_text = line.lower()
                matched_field = None
                for field_key, pattern in field_patterns.items():
                    if pattern.search(field_text):
                        matched_field = field_key
                        break

                # Check next line for link
                if matched_field and i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line.startswith("http"):
                        current_project[matched_field] = next_line
                        i += 1  # Skip the next line since we processed it
                    elif ": http" in next_line or ": https" in next_line:
                        # Extract URL from next line
                        url_match = re.search(r"(https?://[^\s\"'<>]+)", next_line)
                        if url_match:
                            link = url_match.group(1)
                            if "google.com/url?" in link:
                                q_match = re.search(r"[?&]q=([^&]+)", link)
                                if q_match:
                                    link = unquote(q_match.group(1))
                            current_project[matched_field] = link
                            i += 1

        i += 1

    # Add the last project
    if current_project:
        projects.append(current_project)

    return projects

