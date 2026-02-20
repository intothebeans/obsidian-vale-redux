# Configuration Management

## Implementation and Implications

The Vale Config settings tab is meant to serve as an interface to the `.vale.ini` filed specified in the plugin settings. The configuration file is treated as the source of truth. This avoids the headaches of syncing configuration settings stored in the plugin with those in the configuration file. As such, these options are only available when it can find and read them from the specified configuration file. Changing the settings updates the values in memory, but won't persist unless you commit them to the file. 

Saving your settings from Obsidian to the configuration file will overwrite it. However, backups are automatically made and rotated whenever this occurs, and can be configured in the [plugin settings](plugin-settings.md#Backups). 

Changes made outside of Obsidian to the `.vale.ini` can be loaded using the `Load from file` button. 

## File Management

- Save to file 
  - Creates a backup of the existing configuration, rotates existing backups, and overwrites the file with the new settings
  - Changes made to the configuration in the settings UI only affect the Vale runtime when saved 
- Load from file
  - Load the existing configuration from the `.vale.ini` specified in the settings
- Open styles folder
  - Opens the styles folder specified in your `.vale.ini` or from the default path on your system file explorer
- Sync styles
  - Run `vale sync`

## Other Settings

All other available settings are directly parsed from the configuration file. See the [vale documentation](https://vale.sh/docs/vale-ini) for more details about each option. 

Some things to keep in mind:
- Settings which are arrays of values should be defined with one value per line in the UI
- Comment delimeters are defined on one line separated by a space 
- Regular expressions are written directly to the configuration file as-is, and should be written in a format Vale accepts
