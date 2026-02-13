# Changelog 
## 0.1.0

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

- update import for Buffer type
- misnamed css variable
- minor typing issue
- process timeout handling
- **linter**: process failing when linter finds errors

### Refactor

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
