# DelimitIt

DelimitIt is a lightweight browser-based utility for converting messy text into a clean, reusable delimited list. It is useful when your input contains inconsistent spacing, punctuation, line breaks, copied report output, or mixed formatting and you want a predictable result for spreadsheets, SQL, imports, or general cleanup.

Live app: https://simplepotential.github.io/DelimitIt/

## Features

- Browser-based and dependency-free
- Custom delimiters, including tab
- Optional single or double quotes around each output value
- Numeric mode for extracting numbers from mixed text
- Non-numeric mode for extracting general text tokens
- Optional ignore characters in non-numeric mode so specific characters stay inside tokens
- Output spacing toggle to include or omit a space after each delimiter
- Import support for `.txt`, `.csv`, and `.tsv`
- Copy output to the clipboard
- Export output to a text file
- Light and dark theme toggle
- Save and reset preferences from the Preferences menu

## How DelimitIt Works

DelimitIt reads the input text, extracts tokens based on the selected input mode, and joins those tokens back together using your chosen delimiter and quote settings.

### Numeric Mode

Numeric mode is designed for pulling numbers out of mixed content.

- Digits and decimal points are treated as part of a value
- A leading dash is preserved when it represents a negative number
- Values wrapped in parentheses, such as `(123.45)`, are converted to dash-prefixed negatives such as `-123.45`
- Other characters are treated as separators
- Useful for invoice numbers, IDs, values from copied reports, and mixed strings containing numbers

Example input:

```text
Order: 1001 | 1002 | 1003
```

Example output with comma delimiter:

```text
1001, 1002, 1003
```

Negative values are also supported.

Example input:

```text
Credits: -12.5 | (45) | 88
```

Example output with comma delimiter:

```text
-12.5, -45, 88
```

### Non-numeric Mode

Non-numeric mode is designed for general text cleanup.

- Letters, numbers, and underscore characters are kept as part of tokens
- Punctuation and other non-alphanumeric characters are treated as separators by default
- Characters entered in Ignore Characters are preserved inside tokens instead of acting as separators

This mode is useful for names, codes, labels, slugs, and mixed text where selected punctuation should remain attached.

## How To Use

1. Open https://simplepotential.github.io/DelimitIt/ in your browser.
2. Paste text into the Input Text area, or click Import to load a `.txt`, `.csv`, or `.tsv` file.
3. Configure the options in the top options bar.
4. Click Convert.
5. Copy the result or export it as a text file.

## Options

### Delimiter

Choose the character used to join the extracted values.

- Default: comma
- You can type a custom character
- Press the Tab key in the delimiter field to insert a literal tab character

Examples:

- `,` for CSV-style output
- `;` for semicolon-separated output
- `|` for pipe-separated output
- tab for TSV-style output

### Quote Values

Controls whether each output token is wrapped in quotes.

- None
- Single quote
- Double quote

Examples:

- None: `apple, banana, cherry`
- Single: `'apple', 'banana', 'cherry'`
- Double: `"apple", "banana", "cherry"`

### Input Mode

Controls how DelimitIt detects token boundaries.

- Numeric: extract numbers from mixed text, including dash-prefixed negatives and parenthesized negatives
- Non-numeric: extract general text values

### Output Spacing

Controls whether DelimitIt inserts a space after each delimiter.

- Enabled: `value1, value2, value3`
- Disabled: `value1,value2,value3`

This is useful when you want either human-readable output or a tighter machine-oriented format.

### Ignore Characters

Available in Non-numeric mode only.

Enter characters that should remain inside tokens instead of being treated as delimiters.

Examples:

- Keep spaces inside names or phrases
- Keep `$` in monetary values
- Keep `-` or other chosen characters inside identifiers

## Import, Copy, and Export

### Import

Use Import to load text from supported files:

- `.txt`
- `.csv`
- `.tsv`

The file contents are loaded directly into the input area for conversion.

### Copy

Use Copy to send the generated output to the clipboard.

### Export

Use Export to download the converted result as `delimited-output.txt`.

## Theme and Preferences

DelimitIt includes a theme toggle for light and dark display modes.

The Preferences menu lets you:

- Save your current delimiter, spacing, quote style, input mode, and ignore character settings
- Reset all saved preferences back to the defaults

Saved preferences are stored locally in your browser.

## Typical Use Cases

- Convert copied text into comma-separated or tab-separated output
- Prepare values for SQL `IN` clauses
- Clean spreadsheet, report, or log output
- Extract numbers from mixed content
- Normalize names, codes, or IDs into a consistent list

## Running Locally

This project is a static web app with no build step and no external dependencies.

You can:

1. Open `index.html` directly in a browser, or
2. Use the hosted version at https://simplepotential.github.io/DelimitIt/

## Project Structure

- `index.html` contains the application markup, metadata, and UI controls
- `styles.css` contains the responsive styling and theme presentation
- `app.js` contains the conversion logic, preferences, theme handling, and file actions

## License

This project is licensed under the MIT License. See `LICENSE` for details.