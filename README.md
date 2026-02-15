
# Obsidian Vale Redux
[![License](https://img.shields.io/github/license/intothebeans/obsidian-vale-redux)](LICENSE)


A plugin that integrates the [Vale](https://vale.sh/) prose linter with Obsidian, providing configurable, offline-first inline style and grammar checking directly in your editor.

## Install

This plugin is in very early development, so expect some weird behaviors and issues. The recommended way to install this plugin is using [BRAT](https://github.com/TfTHacker/obsidian42-brat). You can also download the files from the [latest release](https://github.com/intothebeans/obsidian-vale-redux/releases/latest) and place them in your vault's `.obsidian/plugins/obsidian-vale-redux` folder.

## Architecture

### Plugin Lifecycle

The following sequence diagram illustrates the plugin initialization and operation flow:

```mermaid
sequenceDiagram
    participant O as Obsidian
    participant VP as ValePlugin
    participant VR as ValeRunner
    participant IM as IssueManager
    participant PM as Process Manager
    participant UI as User Interface

    Note over O,UI: Plugin Initialization
    O->>VP: onload()
    VP->>VP: loadSettings()
    
    Note over VP,UI: Register and Initialize Phase
    VP->>VR: new ValeRunner(plugin)
    VP->>IM: new IssueManager(plugin)
    VP->>O: registerView(IssuesPanel)
    VP->>O: addSettingTab()
    VP->>O: registerEventListeners()
    
    opt showInlineAlerts enabled
        VP->>O: registerEditorExtension(Decorations)
    end
    
    VP->>O: registerCommands(plugin)
    
    
    Note over VP,UI: Run Phase
    VP->>PM: testValeConnection()
    PM-->>VP: connection status
    
    opt Vale Available
        VP->>PM: getExistingConfigOptions()
        PM-->>VP: vale config
        VP->>VP: store valeConfig
    opt Active File Exists
        VP->>IM: refreshFile(activeFile)
        IM->>VR: runVale(file)
        VR->>PM: execute vale
        PM-->>VR: linting results
        VR-->>IM: parsed issues
        IM->>UI: update decorations
    end
    end
    
    
    Note over O,UI: Runtime Operations
    loop File Operations
        O->>VP: file-open event
        VP->>IM: refreshFileDebounced(file)
        
        opt Automatic Checking Enabled
            O->>VP: editor-change event
            VP->>IM: refreshFileDebounced(file)
            
            O->>VP: active-leaf-change event
            VP->>IM: refreshFileDebounced(file)
        end
        
        IM->>VR: runVale(file)
        VR->>PM: execute vale
        PM-->>VR: linting results
        VR-->>IM: parsed issues
        IM->>UI: update decorations
        IM->>UI: update issues panel
    end
    
    Note over O,UI: User Commands
    UI->>O: lint-file command
    O->>VP: execute command
    VP->>IM: refreshFile(activeFile)
    IM->>VR: runVale(file)
    VR->>PM: execute vale
    PM-->>VR: linting results
    VR-->>IM: parsed issues
    IM->>UI: update decorations
    
    UI->>O: open-issues-panel command
    O->>VP: execute command
    VP->>UI: openIssuesPanel(plugin)
    UI->>O: setViewState(IssuesPanel)
    UI->>O: revealLeaf(panel)
```

## Credits

This plugin was inspired by/forked from [obsidian-vale](https://github.com/ChrisChinchilla/obsidian-vale)
by [Chris Chinchilla](https://github.com/ChrisChinchilla). 
