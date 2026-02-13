
# Obsidian Vale Redux

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/intothebeans/obsidian-vale-redux)](https://github.com/intothebeans/obsidian-vale-redux/releases)
[![GitHub All Releases](https://img.shields.io/github/downloads/intothebeans/obsidian-vale-redux/total)](https://github.com/intothebeans/obsidian-vale-redux/releases)
[![License](https://img.shields.io/github/license/intothebeans/obsidian-vale-redux)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/intothebeans/obsidian-vale-redux/lint.yml)](https://github.com/intothebeans/obsidian-vale-redux/actions)

A plugin that integrates the [Vale](https://vale.sh/) prose linter with Obsidian, providing configurable, offline-first inline style and grammar checking directly in your editor.

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
	- [Manual installation](#manual-installation)
	- [Using BRAT](#using-brat)
- [Configuration](#configuration)
	- [Settings](#settings)
- [Usage](#usage)
	- [Commands](#commands)
	- [Visual indicators](#visual-indicators)
- [Troubleshooting](#troubleshooting)
	- [Vale not found](#vale-not-found)
	- [No issues detected](#no-issues-detected)
	- [Performance issues](#performance-issues)
- [Development](#development)
	- [Prerequisites](#prerequisites-1)
	- [Setup](#setup)
	- [Development workflow](#development-workflow)
	- [Testing locally](#testing-locally)
- [Bug reports](#bug-reports)
- [Credits](#credits)


## Features

- **Inline Issue Display**: See Vale issues highlighted directly in your Obsidian editor with inline decorations
- **Issues Panel**: Dedicated sidebar view showing all issues grouped by severity with click-to-navigate functionality
- **Real-time Checking**: Automatically checks your document as you type (configurable)
- **Severity Indicators**: Different visual styles for errors, warnings, and suggestions
- **Hover Tooltips**: Hover over highlighted text to see detailed issue descriptions

## Prerequisites

Before using this plugin, [you need to have Vale installed on your system](https://vale.sh/docs/install) and [configured](https://vale.sh/docs/vale-ini).

## Installation

Install the Vale plugin manually using the latest release or use [BRAT](https://github.com/TfTHacker/obsidian42-brat) for easier updates.

### Manual installation

1. Download the latest release from the [releases page](https://github.com/intothebeans/obsidian-vale-redux/releases)
2. Extract the files to your vault's `.obsidian/plugins/obsidian-vale-redux/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

### Using BRAT

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tester) allows you to install plugins directly from GitHub and receive automatic updates.

1. Install the BRAT plugin from Obsidian's Community Plugins
2. Enable BRAT in Settings → Community plugins
3. Open BRAT settings and click "Add Beta plugin"
4. Enter this repository URL: `https://github.com/intothebeans/obsidian-vale-redux`
5. Click "Add Plugin" and wait for installation
6. Enable the Vale plugin in Settings → Community plugins

BRAT automatically checks for and installs updates to the plugin.

## Configuration

Access the plugin settings through Settings → Plugin Options → Vale Linter:

### Settings

- **Vale Executable Path**: Path to the Vale executable (default: `vale`)
    - If Vale is in your PATH, leave as `vale`
    - Otherwise, provide the full path (e.g., `/usr/local/bin/vale`)

- **Vale Config File Path**: Path to your `.vale.ini` file
    - Leave empty to use Vale's default config discovery
    - Or specify a custom path (e.g., `/home/user/.vale.ini`)
        - Can be relative to the vault root

- **Auto-check Enabled**: Toggle automatic checking as you type

- **Inline Alerts**: Whether or not to render the alerts in the editor- 

- **Debounce Delay**: Time to wait (in milliseconds) after you stop typing before checking

## Usage

### Commands

The plugin provides the following commands (accessible via Command Palette - Cmd/Ctrl+P):

- **Check current file with Vale**: Manually run Vale on the current file
- **Open Vale Issues Panel**: Open the sidebar panel to view all issues grouped by severity

### Visual indicators

Issues are displayed with different underline styles based on severity:

- **Errors**: Red wavy underline (e.g., spelling mistakes, grammar errors)
- **Warnings**: Orange wavy underline (e.g., style suggestions)
- **Suggestions**: Blue dotted underline (e.g., optional improvements)

## Troubleshooting

### Vale not found

If you see "Vale not found" errors:

1. Ensure Vale is installed: Run `vale --version` in your terminal
2. If Vale is not in your PATH, specify the full path in plugin settings
3. On Windows, you might need to include the `.exe` extension

### No issues detected

If Vale runs but finds no issues:

1. Check your `.vale.ini` configuration
2. Ensure you have styles installed (`vale sync`)
3. Verify Vale works from command line: `vale your-file.md`

### Performance issues

If the plugin causes lag:

1. Increase the debounce delay in settings
2. Disable auto-check and use manual checking

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)
- [Vale](https://vale.sh/) installed for testing

### Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/intothebeans/obsidian-vale-redux.git
    cd obsidian-vale-redux
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Build the plugin:
    ```bash
    npm run build
    ```

### Development workflow

- **Watch mode**: `npm run dev` - Automatically rebuilds on file changes
- **Build**: `npm run build` - Production build with TypeScript compilation
- **Lint**: `npm run lint` - Run ESLint and Stylelint
- **CSS development**: `npm run css:watch` - Watch SCSS files for changes

### Testing locally

1. Build the plugin using `npm run build` or `npm run dev`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your test vault:
    ```bash
    cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/obsidian-vale-redux/
    ```
3. Reload Obsidian or toggle the plugin in Settings → Community plugins

## Bug reports

When reporting bugs, please include:

- Obsidian version
- Plugin version
- Vale version and configuration
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs or screenshots

## Credits

This plugin was inspired by/forked from [obsidian-vale](https://github.com/ChrisChinchilla/obsidian-vale)
by [Chris Chinchilla](https://github.com/ChrisChinchilla). The current version is a complete rewrite with different features and implementation.
