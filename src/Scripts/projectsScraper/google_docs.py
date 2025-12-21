"""
Google Docs fetching and parsing functionality.
"""

import re
import requests
from html.parser import HTMLParser


def extract_doc_id(url):
    """
    Extract the document ID from various Google Docs URL formats.

    Supports:
    - https://docs.google.com/document/d/DOC_ID/edit
    - https://docs.google.com/document/d/DOC_ID/view
    - https://docs.google.com/document/d/DOC_ID
    - https://docs.google.com/document/d/DOC_ID/edit?usp=sharing
    """
    # Pattern to match document ID in the URL
    patterns = [
        r"/document/d/([a-zA-Z0-9-_]+)",
        r"id=([a-zA-Z0-9-_]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)

    return None


class GoogleDocsHTMLParser(HTMLParser):
    """Parser to extract text and links from Google Docs HTML export."""

    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.current_link = None
        self.current_text = []
        self.in_paragraph = False

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            # Extract href attribute
            href = None
            for attr_name, attr_value in attrs:
                if attr_name == "href":
                    href = attr_value
                    break
            if href:
                self.current_link = href
        elif tag in ["p", "div"]:
            self.in_paragraph = True
        elif tag == "br":
            # Add newline for line breaks
            if not self.current_link:
                self.text_parts.append("\n")

    def handle_endtag(self, tag):
        if tag == "a" and self.current_link:
            # Combine accumulated text for this link
            link_text = "".join(self.current_text).strip()
            if link_text:
                self.text_parts.append(f"{link_text}: {self.current_link}")
            else:
                self.text_parts.append(self.current_link)
            self.current_text = []
            self.current_link = None
        elif tag in ["p", "div"]:
            self.in_paragraph = False
            # Add newline after paragraph/div
            if not self.current_link:
                if self.text_parts and not self.text_parts[-1].endswith("\n"):
                    self.text_parts.append("\n")

    def handle_data(self, data):
        if self.current_link:
            # Accumulate text for the current link
            self.current_text.append(data)
        else:
            # Regular text - preserve whitespace but clean up excessive newlines
            if data.strip():
                self.text_parts.append(data)
            elif data and self.in_paragraph:
                # Preserve single spaces/newlines within paragraphs
                if "\n" in data and self.text_parts and not self.text_parts[-1].endswith("\n"):
                    # Only add one newline
                    pass

    def get_text(self):
        """Return the extracted text with links."""
        result = "".join(self.text_parts)
        # Clean up excessive newlines (more than 2 consecutive)
        result = re.sub(r"\n{3,}", "\n\n", result)
        return result.strip()


def get_google_docs_text(url, include_links=True):
    """
    Fetch text content from a Google Docs URL, optionally including hyperlinks.

    Args:
        url: Google Docs URL
        include_links: If True, extract and include hyperlinks (default: True)

    Returns:
        str: Text content of the document with links
    """
    doc_id = extract_doc_id(url)

    if not doc_id:
        raise ValueError(f"Could not extract document ID from URL: {url}")

    try:
        if include_links:
            # Use HTML export to get links
            export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=html"
            response = requests.get(export_url, timeout=30)
            response.raise_for_status()

            # Parse HTML to extract text and links
            parser = GoogleDocsHTMLParser()
            parser.feed(response.text)
            return parser.get_text()
        else:
            # Use plain text export
            export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
            response = requests.get(export_url, timeout=30)
            response.raise_for_status()
            return response.text
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to fetch document: {e}")

