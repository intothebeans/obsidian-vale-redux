## 0.1.0 (2026-02-13)

### Feat

- **core**: add inline decorations
- **ui**: gray out non-functional panel actions
- **ui**: add panel action ui components
- **ui**: update issue management and UI
- **ui**: add issues view pane
- **core**: update process handling and include timeout setting
- **settings**: implement opening of styles dir
- add configurable process timeout wait
- **core**: add issue manager for caching and running the linter
- **core**: add file linting functionality
- **setting**: implement settings and basic utility functions

### Fix

- **ui**: EditorView updates firing over each other illegally
- **core**: failed functionality checks stop linting from running
- **settings**: plugin fails to load if no existing plugin data
- **runner**: runner options being decoupled from plugin settings
- update import for Buffer type
- misnamed css variable
- minor typing issue
- process timeout handling
- **linter**: process failing when linter finds errors

### Refactor

- add helper for creating divs
- **core**: move command registry to its own file
- **core**: change how vale functionality is checked and stored
- **settings**: simplfy settings data loading
- remove excessive tooling
- prep for release
- granularize codebase
- remove debug statements
- update docstrings and refactor types
- split settings into different functions
- openExternalFilesystemObject to improve file handling
- clean up typing issues
- severity handling
- clean up redundant and unused variables
- better handling of defaults when loading settings
- cleanup debug msgs, imports, and types
- consistent valeConfigPath type
- clean up plugin initialization
- restore utils.ts
- start from scratch
