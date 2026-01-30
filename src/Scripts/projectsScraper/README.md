# Projects Scraper

A Python script to extract project data from Google Docs and optionally capture screenshots of project websites.

## Setup

### 1. Create Virtual Environment

Navigate to the `projectsScraper` directory:

```bash
cd src/Scripts/projectsScraper
```

Create a virtual environment:

**Windows:**

```powershell
python -m venv .venv
```

**Mac/Linux:**

```bash
python3 -m venv .venv
```

### 2. Activate Virtual Environment

**Windows (PowerShell):**

```powershell
.\.venv\Scripts\activate
```

**Windows (Command Prompt):**

```cmd
.venv\Scripts\activate.bat
```

**Mac/Linux:**

```bash
source .venv/bin/activate
```

You should see `(.venv)` in your prompt when activated.

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install playwright requests Pillow
playwright install chromium
```

## Usage

**Important:** Always run the scraper from the `Scripts` directory (one level up from `projectsScraper`).

### Basic Usage

From the `Scripts` directory:

```bash
python -m projectsScraper <google_docs_url> <key>
```

The `<key>` argument is used to:

- Store projects in `src/Assets/Data/projects.json` under `projects.<key>`
- Create screenshot folder as `public/projects/{KEY}` (spaces removed, uppercase)

### With Screenshots

To capture screenshots of project websites:

```bash
python -m projectsScraper <google_docs_url> <key> --screenshots
```

Screenshots will be saved to `public/projects/{KEY}/` where `{KEY}` is the key with spaces removed and uppercased (e.g., "Fall 2025" → "FALL2025").

### Raw Text Output

To get raw text instead of parsed JSON:

```bash
python -m projectsScraper <google_docs_url> <key> --raw
```

### Example

```bash
# Navigate to Scripts directory
cd src/Scripts

# Activate venv (if not already activated)
.\projectsScraper\.venv\Scripts\activate  # Windows PowerShell
# or
.venv\Scripts\activate.bat  # Windows Command Prompt
# or
source projectsScraper/.venv/bin/activate  # Mac/Linux

# Run the scraper (make sure you're in Scripts directory)
python -m projectsScraper "https://docs.google.com/document/d/1abc123/edit" "Fall 2025" --screenshots
```

This will:

- Parse projects from the Google Doc
- Save them to `src/Assets/Data/projects.json` under `projects["Fall 2025"]`
- Capture screenshots to `public/projects/FALL2025/`

### PowerShell URL Quoting

**Windows PowerShell:** URLs with special characters (like `&`) must be quoted. Use double quotes around the entire URL:

```powershell
# Correct - URL is quoted
python -m projectsScraper "https://docs.google.com/document/d/1abc123/edit?pli=1&tab=t.0"

# Incorrect - will cause parsing error
python -m projectsScraper https://docs.google.com/document/d/1abc123/edit?pli=1&tab=t.0
```

**Mac/Linux:** URLs can be used without quotes unless they contain spaces or other shell-special characters.

## Output

The script:

1. **Prints JSON to console** - Outputs the parsed projects array
2. **Writes to `src/Assets/Data/projects.json`** - Updates the file under `projects.<key>`

Each project contains:

- `title`: Project title
- `mentor`: Mentor name(s)
- `design_document`: Link to design document
- `github_repository`: Link to GitHub repository
- `code_documentation`: Link to code documentation
- `meeting_logs`: Link to meeting logs
- `presentation_slides`: Link to presentation slides
- `website`: Link to deployed website
- `image`: Path to screenshot (if `--screenshots` flag is used)

## Notes

- **Always run from `Scripts` directory:** The command `python -m projectsScraper` must be run from the `src/Scripts` directory, not from within the `projectsScraper` folder
- **Key argument:** The key is required and determines both the JSON key and screenshot folder name (spaces removed, uppercase)
- **Screenshots:** Screenshots are saved to `public/projects/{KEY}/` directory as WebP files, where `{KEY}` is the formatted key
- **JSON file:** The script reads and updates `src/Assets/Data/projects.json`, preserving existing data and only updating the specified key
- **Streamlit apps:** The script automatically handles Streamlit apps by clicking the "Yes, get this app back up!" button and waiting for the app to load
- **URL quoting:** In PowerShell, always quote URLs that contain special characters (like `&`, `?`, `=`)
- **Virtual environment:** Make sure your venv is activated (you should see `(.venv)` in your prompt)
