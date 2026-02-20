# Plugin Settings 
*Updated 2026-02-20*

## General

- Inline alerts toggle
  - Whether to render highlights in the editor or not 
  - Requires a reload to take affect 
- Automatic checking 
  - Whether to check the document when changes are made
  - Configured by debounce time in [advanced settings](#advanced)
  - Requires a reload to take affect
- Inline highlights
  - Whether to highlight the problem text in the editor when using the Issues Panel to navigate
  - Requires a reload to take affect
- Vale binary path
  - Absolute path to the vale executable on your system
  - Defaults to vale on the system PATH
  - Includes button to test the specified program
- Vale config path
  - Path to your `.vale.ini` 
  - Uses a relative path from the vault root, or an absolute path


## Backups

- Number of backups to keep
  - Number of configuration backup files to keep in the vault before rotating
  - Uses Obsidian API to trash files using your settings
- Backup directory
  - Where in your vault to store backup files
  - Defaults to your attachment directory

## Advanced 

- Excluded files
  - Currently non-functional 
- Debounce time
  - Delay in milliseconds between linting updates when automatic checking is enabled
  - Increasing this value can increase performance at the cost of speed 
- Process timeout 
  - Maximum time allowed for vale to take when linting
  - Increase this value if large files are timing out
