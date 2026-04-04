# DelimitIt

DelimitIt is a lightweight browser-based utility for turning messy text into a clean delimited list. It is designed for cases where you have values separated by spaces, punctuation, line breaks, or mixed formatting and need to convert them into a consistent output such as comma-separated, tab-separated, or quoted values.

## What It Does

The application accepts pasted or imported text, extracts tokens from that input, and joins them into a single delimited string.

It supports:

- Custom output delimiters, including tab
- Optional single or double quotes around each value
- Two parsing modes:
- Non-numeric mode for general text values
- Numeric mode for extracting numbers from mixed content
- Optional ignore characters in non-numeric mode so selected characters remain part of tokens
- Importing input from `.txt`, `.csv`, and `.tsv` files
- Copying converted output to the clipboard
- Exporting converted output to a text file
- Light and dark theme support

## How It Works

In non-numeric mode, DelimitIt treats non-alphanumeric characters as separators unless you explicitly mark them as characters to keep.

In numeric mode, DelimitIt extracts numeric values from mixed text by treating non-numeric characters as separators.

After parsing the input, the app rebuilds the results as a single string using your selected delimiter and quote style.

## Running The App

This project is a simple static web app with no build step and no external dependencies.

To use it:

1. Open `index.html` in a web browser.
2. Paste text into the input area or import a supported file.
3. Choose the delimiter, quote style, and input mode.
4. Click **Convert**.
5. Copy or export the output.

## Project Structure

- `index.html` contains the application layout and controls
- `styles.css` contains the visual styling and theme support
- `app.js` contains the conversion logic and UI behavior

## Typical Use Cases

- Converting copied lists into comma-separated values
- Preparing IDs or names for SQL `IN` clauses
- Cleaning pasted spreadsheet or report output
- Extracting numbers from mixed text for reuse elsewhere