# Changelog

All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

---
## [0.4.0](https://github.com/intothebeans/obsidian-vale-redux/compare/0.3.0..0.4.0) - 2026-02-20

### :rocket: Features

- **(settings)** add settings to toggle status bar items - ([8fcae1b](https://github.com/intothebeans/obsidian-vale-redux/commit/8fcae1b49a745139a62741f1c6b5f845d8e06dd9)) - intothebeans
- **(ui)** add ribbon icon to open issue panel - ([c66d9c2](https://github.com/intothebeans/obsidian-vale-redux/commit/c66d9c21737fb23a532f2d2b79f51bcc6bfd9b6a)) - intothebeans
- **(ui)** add status bar elements for vale status and grouped issues - ([0914b59](https://github.com/intothebeans/obsidian-vale-redux/commit/0914b590093a29cc2a0a628a5fb8b25afc503b16)) - intothebeans

### :bug: Bug Fixes

- **(ui)** status bar updates automatically even if auto checking is disabled - ([826a295](https://github.com/intothebeans/obsidian-vale-redux/commit/826a29507cb47e8c09409abdeaa39ef0db26eaca)) - intothebeans
- **(ui)** update vale status status bar item whenever the active leaf changes - ([c386436](https://github.com/intothebeans/obsidian-vale-redux/commit/c386436a69ca66e58722c572e33dfbd1ce6af4cc)) - intothebeans
- **(ui)** issues only refresh on obsidian events if automatic checking disabled - ([7a67658](https://github.com/intothebeans/obsidian-vale-redux/commit/7a67658db84e3851bb3437a55eb17f215f3aa72d)) - intothebeans
- remove redundant ternary operator - ([3f76e7e](https://github.com/intothebeans/obsidian-vale-redux/commit/3f76e7e16162cb6a3257b9eaa0c2915ca9bbc2c9)) - intothebeans

### :memo: Documentation

- readme formatting - ([fa00359](https://github.com/intothebeans/obsidian-vale-redux/commit/fa00359ad806f88e8a926116accb05726e400070)) - Aiden

---
## [0.3.0](https://github.com/intothebeans/obsidian-vale-redux/compare/0.2.1..0.3.0) - 2026-02-20

### :rocket: Features

- **(config)** add custom parser for .vale.ini file - ([9b99432](https://github.com/intothebeans/obsidian-vale-redux/commit/9b99432f68159e47246157492f15129e0f15d89f)) - intothebeans
- **(config)** implement backup functionality for Vale configuration - ([6fe7df3](https://github.com/intothebeans/obsidian-vale-redux/commit/6fe7df32cb7a5bc22fa747b2aa4ff313189561ad)) - intothebeans
- **(config)** add serializer for writing config to ini file - ([854fb93](https://github.com/intothebeans/obsidian-vale-redux/commit/854fb93cd55cecb7d99e7cbd12c5cbabdac79607)) - intothebeans
- **(config)** add saving and backup functionality - ([1a1087c](https://github.com/intothebeans/obsidian-vale-redux/commit/1a1087c7bf7caef75b1c3733b50f4f09dad68418)) - intothebeans
- **(config)** add function to rotate backups - ([c1164ff](https://github.com/intothebeans/obsidian-vale-redux/commit/c1164ffa05be6c86f339d2e934fd957a78f22e5a)) - intothebeans
- **(settings)** display Vale core settings in Obsidian settings - ([790f630](https://github.com/intothebeans/obsidian-vale-redux/commit/790f630d605010064ed0db5651049f675f5b1a80)) - intothebeans
- **(settings)** display global block settings - ([469ca84](https://github.com/intothebeans/obsidian-vale-redux/commit/469ca840809d2a7381ff4142b9e917f815b8d247)) - intothebeans
- **(settings)** display syntax specific config settings - ([4024b6f](https://github.com/intothebeans/obsidian-vale-redux/commit/4024b6f53c552fc2fc30009c3c97e0ab4ea956f1)) - intothebeans
- **(settings)** add tabs for settings - ([c9de508](https://github.com/intothebeans/obsidian-vale-redux/commit/c9de5082de551c558c79ae912b923d63eab14ff0)) - intothebeans
- **(settings)** add display for packages config option - ([971fb0a](https://github.com/intothebeans/obsidian-vale-redux/commit/971fb0aae1e8720217f87521ae83f00b94d242fd)) - intothebeans
- **(settings)** update backup configuration settings and ui elements - ([cf2bf91](https://github.com/intothebeans/obsidian-vale-redux/commit/cf2bf91b0e10cc94f7d1a250622ca0524c7e1cd0)) - intothebeans
- **(settings)** add save, load, and sync options to config tab - ([c8ea008](https://github.com/intothebeans/obsidian-vale-redux/commit/c8ea008e5de49aff4f94cff1a7f819713afbcc3a)) - intothebeans
- **(settings)** add saving functionality to vale config settings - ([97ce40d](https://github.com/intothebeans/obsidian-vale-redux/commit/97ce40d30aa8553370afa4b0a7f79c8c8a36ff3f)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- **(npm)** remove git cliff from version script - ([87eeef5](https://github.com/intothebeans/obsidian-vale-redux/commit/87eeef57d6a97400b9a59d1212deb6486ea39f3c)) - intothebeans
- update release notes template - ([d834138](https://github.com/intothebeans/obsidian-vale-redux/commit/d834138fc7be0607c734fdd3c903da4e664f693e)) - intothebeans
- switch to git-cliff for changelog generation - ([0210590](https://github.com/intothebeans/obsidian-vale-redux/commit/02105903395b8f09a19d76b36d4264656fd9ba51)) - intothebeans

### :bug: Bug Fixes

- **(config)** use regex string values for correct parsing in default config - ([659c486](https://github.com/intothebeans/obsidian-vale-redux/commit/659c486c2121c2f205072bc537cbbfb45b3bf78d)) - intothebeans
- **(config)** backups invalidating erroneously - ([679c7db](https://github.com/intothebeans/obsidian-vale-redux/commit/679c7db21268729271e73cd52847a7d962b6ed75)) - intothebeans
- **(config)** remove leading dot from backups which prevented deletion - ([9018e77](https://github.com/intothebeans/obsidian-vale-redux/commit/9018e77ce5e61e4bc769cea2e660b60207f23ff3)) - intothebeans
- **(config)** check override serializer defaulted to NO when check not enabled or has no level - ([045bd73](https://github.com/intothebeans/obsidian-vale-redux/commit/045bd73477510a60eccb4788be94eb2b64756255)) - intothebeans
- **(config)** import ValePlugin as type - ([8f6e3e7](https://github.com/intothebeans/obsidian-vale-redux/commit/8f6e3e702d47d9ce8b4c342592e9711971dc9a71)) - intothebeans
- **(core)** plugin not checking whether automatic checking should be enabled - ([598c56b](https://github.com/intothebeans/obsidian-vale-redux/commit/598c56bf898d350eeb375caa3a75eb5010b4c064)) - intothebeans
- **(settings)** handle null options for valeConfig and it's options when displaying settings - ([9c724b3](https://github.com/intothebeans/obsidian-vale-redux/commit/9c724b3254e090876947d3bc2bac0f87afefadc9)) - intothebeans
- **(settings)** ensure styles path defaults to empty string if not found - ([ef75cfa](https://github.com/intothebeans/obsidian-vale-redux/commit/ef75cfa33606b96fc09b6fecdeee1aab50ed1ab0)) - intothebeans
- **(settings)** simplify minimum alert level display logic - ([2eca921](https://github.com/intothebeans/obsidian-vale-redux/commit/2eca9212e13f0de5ba18f3187036f9c7716d1390)) - intothebeans
- **(settings)** properly manage event listeners for tab navigation - ([6bd025f](https://github.com/intothebeans/obsidian-vale-redux/commit/6bd025f587cdb35e6269f395e1dcb5b5331d0ccd)) - intothebeans
- **(settings)** clicking tabs always runs their display function - ([412e538](https://github.com/intothebeans/obsidian-vale-redux/commit/412e5384fbf301252a3834b1cb22e297d604dda4)) - intothebeans
- **(settings)** add name and description to backup dir setting - ([61dc78a](https://github.com/intothebeans/obsidian-vale-redux/commit/61dc78a3f68037e96e0781b54cbe37309daf6530)) - intothebeans
- **(settings)** leaving the backup dir setting empty no longer fails - ([f545397](https://github.com/intothebeans/obsidian-vale-redux/commit/f545397071e62af668ce1e5bc1277fdbdb7c3e86)) - intothebeans
- **(settings)** call rotateBackups after clicking save - ([93203a1](https://github.com/intothebeans/obsidian-vale-redux/commit/93203a1d4e445104c4aded3061ff198b5da89caa)) - intothebeans
- **(settings)** move rotateBackups call to backupAndWriteConfig - ([c740470](https://github.com/intothebeans/obsidian-vale-redux/commit/c740470792d9889b4c52b7f7fdad5b59fe6a90e1)) - intothebeans
- **(settings)** handle getValeStylesPath errors - ([46359b5](https://github.com/intothebeans/obsidian-vale-redux/commit/46359b58cea4dadd56d0c1ae74fbbfa971d49ecf)) - intothebeans
- **(settings)** typo in comment delimeter placeholder text - ([5e66e0e](https://github.com/intothebeans/obsidian-vale-redux/commit/5e66e0eada9d9d04aa00a09eea3b0fc2ada7d336)) - intothebeans

### :memo: Documentation

- add docs for settings - ([1d70486](https://github.com/intothebeans/obsidian-vale-redux/commit/1d704864634e885f7a4b5ada02d4278421f66f12)) - intothebeans
- update readme - ([7bd6503](https://github.com/intothebeans/obsidian-vale-redux/commit/7bd65035cbe26ed20ca9b55287ca4b61d33e074e)) - intothebeans

### :zap: Performance

- **(settings)** clean up settings on hide - ([54a99e7](https://github.com/intothebeans/obsidian-vale-redux/commit/54a99e7c83febb6a39172d7bce1899d66bab5969)) - intothebeans
- defer plugin setup that spawn processes to after Obsidian loads - ([4977597](https://github.com/intothebeans/obsidian-vale-redux/commit/497759777a73a5d37c4ab67e98bee9c894e04ad0)) - intothebeans

### :recycle: Refactoring

- **(config)** update config loading to use new parser - ([6078bba](https://github.com/intothebeans/obsidian-vale-redux/commit/6078bba85ce043ebb0cfd9ae3dfc3776e0bfd911)) - intothebeans
- **(config)** update how alert levels are handled - ([ed88599](https://github.com/intothebeans/obsidian-vale-redux/commit/ed885993cab77a3023a0660f857c3a8cba796457)) - intothebeans
- **(config)** model default config to ValeConfig object - ([851f6bc](https://github.com/intothebeans/obsidian-vale-redux/commit/851f6bcaeb46f8db3829f1a9718f2490b2b5ae54)) - intothebeans
- **(config)** move parser to dedicated folder - ([fc30e03](https://github.com/intothebeans/obsidian-vale-redux/commit/fc30e035e6af95a148f238112955f9586aa6bb78)) - intothebeans
- **(config)** move backupAndWriteConfig to vale-config-tab - ([312ce05](https://github.com/intothebeans/obsidian-vale-redux/commit/312ce05129b73d17f2320e289296dbc8510c3473)) - intothebeans
- **(config)** [**breaking**] backup dir must be in the vault - ([2535526](https://github.com/intothebeans/obsidian-vale-redux/commit/253552630f92e37a6fdb02049da4326e4b53021f)) - intothebeans
- **(config)** [**breaking**] backup paths now stored as an object with a path and a timestamp - ([64ef7ea](https://github.com/intothebeans/obsidian-vale-redux/commit/64ef7eacd0b76e694541ed810152d8c32a4c73a1)) - intothebeans
- **(settings)** polish settings tab styling - ([4a1fe00](https://github.com/intothebeans/obsidian-vale-redux/commit/4a1fe0000ed694a71d7e6cd25f5b73b1f1d79c3c)) - intothebeans
- **(settings)** text value set to empty when no config option found - ([2c14f36](https://github.com/intothebeans/obsidian-vale-redux/commit/2c14f36a12cc2dca736f63caaea1985bd4d00844)) - intothebeans
- **(settings)** modularize open config button - ([63974ca](https://github.com/intothebeans/obsidian-vale-redux/commit/63974ca56dccd48ec7383cc0a3fe02cb11b7eff6)) - intothebeans
- **(settings)** remove quick actions from plugin settings tab - ([54193dd](https://github.com/intothebeans/obsidian-vale-redux/commit/54193dd06585717a5432a928935b4731cb991b99)) - intothebeans
- **(settings)** remove createOpenConfigButton function - ([84439d7](https://github.com/intothebeans/obsidian-vale-redux/commit/84439d70e10d44c27ac5dfd4f1e4b5a162a7ede2)) - intothebeans
- **(settings)** remove notices for loading config from file - ([5a4fe80](https://github.com/intothebeans/obsidian-vale-redux/commit/5a4fe80a0d6559b23ca13a0dd8201070dda34ede)) - intothebeans
- **(settings)** changed order of plugin settings - ([ea730d1](https://github.com/intothebeans/obsidian-vale-redux/commit/ea730d1be5307537aff924a7bae7939d17e21292)) - intothebeans
- **(settings)** change default process timeout to 5 seconds - ([4fb0e32](https://github.com/intothebeans/obsidian-vale-redux/commit/4fb0e329b712dcc0c26a3b1d02f01ea41b84c467)) - intothebeans
- add npm scripts for tests - ([85bc6d0](https://github.com/intothebeans/obsidian-vale-redux/commit/85bc6d09c7d81938287304168538bdf2b5cc593c)) - intothebeans
- change alertlevel handling to allow for bidirectional conversion - ([ed435c5](https://github.com/intothebeans/obsidian-vale-redux/commit/ed435c5a0b99af18405013eaddc58012ec64edc8)) - intothebeans
- add vitest.config.ts to eslint default project - ([60f22a5](https://github.com/intothebeans/obsidian-vale-redux/commit/60f22a57c75c4f851963e775952886d46cf83cfb)) - intothebeans
-  [**breaking**]Alert Levels combined with severity and only ever strings - ([4ad6015](https://github.com/intothebeans/obsidian-vale-redux/commit/4ad601503fa64bb9bacdd8bc69db117e69958b8d)) - intothebeans

### :white_check_mark: Tests

- **(config)** add tests for ini parser - ([763a903](https://github.com/intothebeans/obsidian-vale-redux/commit/763a9034e899a15d071818c344262ad1d36265a2)) - intothebeans
- **(config)** add vitest configuration and mock for testing backup functionality - ([97f219c](https://github.com/intothebeans/obsidian-vale-redux/commit/97f219cbcfae6e3a2460005f303083be30aec872)) - intothebeans
- **(config)** write tests for rotateBackups - ([205a6a9](https://github.com/intothebeans/obsidian-vale-redux/commit/205a6a95d91dc7248d99483a32da1a7eea8b8ff6)) - intothebeans
- **(config)** pass tests - ([2f9e43e](https://github.com/intothebeans/obsidian-vale-redux/commit/2f9e43e267215b29c79d2820bd7c26fdffafb832)) - intothebeans
- **(config)** convert tests to new backup dir object type - ([52430dd](https://github.com/intothebeans/obsidian-vale-redux/commit/52430ddab3ea11284802f5962cbaeefbff3902c8)) - intothebeans
- **(config)** add additional tests for coverage - ([3db726d](https://github.com/intothebeans/obsidian-vale-redux/commit/3db726d50b6594e43298d63451b5e80f1b4f4eee)) - intothebeans
- **(config)** update to match new backup path - ([b483d90](https://github.com/intothebeans/obsidian-vale-redux/commit/b483d901251c9dad0826432001a3abceb5d89cfa)) - intothebeans

---
## [0.2.1](https://github.com/intothebeans/obsidian-vale-redux/compare/0.2.0..0.2.1) - 2026-02-15

### :rocket: Features

- **(settings)** add toggle for inline highlights - ([034cb16](https://github.com/intothebeans/obsidian-vale-redux/commit/034cb16eb2b96cf94a89bb5414f8ea1ca06aca71)) - intothebeans
- **(settings)** add notice for any settings requiring a reload - ([968ce12](https://github.com/intothebeans/obsidian-vale-redux/commit/968ce124d661e27a15b4a3f1211365cabb3efbca)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- update release notes template - ([552b9dd](https://github.com/intothebeans/obsidian-vale-redux/commit/552b9dd20aed7428ab26a75c1cbecbd1ab6e9979)) - intothebeans
- version 0.2.0 → 0.2.1 - ([2ef011f](https://github.com/intothebeans/obsidian-vale-redux/commit/2ef011f55b56c7561c65e4e8e5a2dfa1080db5ef)) - intothebeans

### :bug: Bug Fixes

- **(core)** add strictor typing to editorExtensions array - ([f5528ff](https://github.com/intothebeans/obsidian-vale-redux/commit/f5528ffe3f82c6f499a85100bbf1017641c5ae7b)) - intothebeans
- config failing to open from settings on windows - ([33ef4fb](https://github.com/intothebeans/obsidian-vale-redux/commit/33ef4fbecd5aeeeeb2f0df70ff874edf2ae2dfa9)) - intothebeans

---
## [0.2.0](https://github.com/intothebeans/obsidian-vale-redux/compare/0.1.0..0.2.0) - 2026-02-15

### :rocket: Features

- **(core)** add file linting functionality - ([d53f233](https://github.com/intothebeans/obsidian-vale-redux/commit/d53f2332ce2bb17ff14b16def969d61f3d93515d)) - intothebeans
- **(core)** add issue manager for caching and running the linter - ([8ef9d3c](https://github.com/intothebeans/obsidian-vale-redux/commit/8ef9d3c197a0bf3cbce15dee1fd82e4d857ad58b)) - intothebeans
- **(core)** update process handling and include timeout setting - ([3c38815](https://github.com/intothebeans/obsidian-vale-redux/commit/3c3881559133d91301367726e612307bb04bfd10)) - intothebeans
- **(core)** add inline decorations - ([63e6ed3](https://github.com/intothebeans/obsidian-vale-redux/commit/63e6ed35186cffb6d03734b19281bb92022bbeeb)) - intothebeans
- **(setting)** implement settings and basic utility functions - ([b9eb2e6](https://github.com/intothebeans/obsidian-vale-redux/commit/b9eb2e6a905a141a4b2d29107f99e2a2a1022268)) - intothebeans
- **(settings)** implement opening of styles dir - ([f95f887](https://github.com/intothebeans/obsidian-vale-redux/commit/f95f8872e82d38bdb9443b619320a005229039c0)) - intothebeans
- **(ui)** add issues view pane - ([cf414d4](https://github.com/intothebeans/obsidian-vale-redux/commit/cf414d47145cba61430843ca5a792e07545d634a)) - intothebeans
- **(ui)** update issue management and UI - ([f49491a](https://github.com/intothebeans/obsidian-vale-redux/commit/f49491a461705aa15324823cecd965382d729c41)) - intothebeans
- **(ui)** add panel action ui components - ([6c2f31d](https://github.com/intothebeans/obsidian-vale-redux/commit/6c2f31d503ef5d7a4548c77974d577dd8982b4cd)) - intothebeans
- **(ui)** gray out non-functional panel actions - ([1ae1062](https://github.com/intothebeans/obsidian-vale-redux/commit/1ae1062f5cb5f2548f85a98e619e24d63167dc66)) - intothebeans
- **(ui)** clicking on issues in the pane also highlights them - ([e9dfdea](https://github.com/intothebeans/obsidian-vale-redux/commit/e9dfdea906118c1990f97b6f8ab832823813bd6f)) - intothebeans
- add configurable process timeout wait - ([d608a46](https://github.com/intothebeans/obsidian-vale-redux/commit/d608a467bd0a49e9b9d7172b08dc6eee4fb0a0eb)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- **(actions)** streamline release action and note template - ([24a59f9](https://github.com/intothebeans/obsidian-vale-redux/commit/24a59f915ea8fe96fe7fd96d380929802b61fd7d)) - intothebeans
- **(npm)** add additional scripts - ([251744d](https://github.com/intothebeans/obsidian-vale-redux/commit/251744def66ed2b8dcacb943be2e5cb01ceb40fa)) - intothebeans
- copy current obsidian example plugin template over - ([2a98d63](https://github.com/intothebeans/obsidian-vale-redux/commit/2a98d63ea0cc1a481167f9a5daf67189669a6987)) - intothebeans
- add devcontainer - ([f5a272f](https://github.com/intothebeans/obsidian-vale-redux/commit/f5a272f4de0c5f7c1a9d493edc8a5945b301fff5)) - intothebeans
- update eslint to flat file config - ([dc4afd6](https://github.com/intothebeans/obsidian-vale-redux/commit/dc4afd6b3aad62174507cdf4f1a3f3a96f2436f9)) - intothebeans
- update actions workflows - ([62f4c6f](https://github.com/intothebeans/obsidian-vale-redux/commit/62f4c6fead2989728ddf406ef47a31e8402773b3)) - intothebeans
- add permissions to actions workflows - ([3cc01ed](https://github.com/intothebeans/obsidian-vale-redux/commit/3cc01eddad5b0ca1a5b004dde6a60f6cbc34ea94)) - intothebeans
- add commit tooling - ([2f0d0c0](https://github.com/intothebeans/obsidian-vale-redux/commit/2f0d0c02bd1883cf16cf60a6165d5f042d5c0fd8)) - intothebeans
- delete to-do issue workflow - ([a1b44d7](https://github.com/intothebeans/obsidian-vale-redux/commit/a1b44d734366274b737746a126aa7a95154bcda4)) - intothebeans
- update release workflow - ([3187a32](https://github.com/intothebeans/obsidian-vale-redux/commit/3187a32079da72662dbcddcae74eaef0953df34e)) - intothebeans
- remove prettier check from lint script - ([392d6d4](https://github.com/intothebeans/obsidian-vale-redux/commit/392d6d4d6731011c5b6e68f616c6873ccc846c78)) - intothebeans

### :bug: Bug Fixes

- **(core)** failed functionality checks stop linting from running - ([317292f](https://github.com/intothebeans/obsidian-vale-redux/commit/317292f73cca2d54678313b887fa6dec8c185627)) - intothebeans
- **(linter)** process failing when linter finds errors - ([7c77aa9](https://github.com/intothebeans/obsidian-vale-redux/commit/7c77aa95e6237054e8de35ed5ccb022ad20c9293)) - intothebeans
- **(runner)** runner options being decoupled from plugin settings - ([4d36794](https://github.com/intothebeans/obsidian-vale-redux/commit/4d36794be55c09b0d6b780ba5bc574fca82e6169)) - intothebeans
- **(settings)** plugin fails to load if no existing plugin data - ([1cd8080](https://github.com/intothebeans/obsidian-vale-redux/commit/1cd8080276d86c775bd7760ba934fdfdd99006cf)) - intothebeans
- **(ui)** EditorView updates firing over each other illegally - ([5776b76](https://github.com/intothebeans/obsidian-vale-redux/commit/5776b76e6778ce2d09a88f108d1b4a131586b27f)) - intothebeans
- process timeout handling - ([cb43997](https://github.com/intothebeans/obsidian-vale-redux/commit/cb439972e0513c1187afe99aa1d4bffd34a06b33)) - intothebeans
- minor typing issue - ([638d26a](https://github.com/intothebeans/obsidian-vale-redux/commit/638d26ade0c1e75a3b4d5fd20ed9d42ee6ffaa78)) - intothebeans
- misnamed css variable - ([fb2303c](https://github.com/intothebeans/obsidian-vale-redux/commit/fb2303c6206859f19bd62b3e35853e1cd40a0d3a)) - intothebeans
- update import for Buffer type - ([62c8bf3](https://github.com/intothebeans/obsidian-vale-redux/commit/62c8bf325070ef7fa716f540d06ab072a68b9ebc)) - intothebeans

### :memo: Documentation

- update metadata - ([fdc3367](https://github.com/intothebeans/obsidian-vale-redux/commit/fdc3367268d52f88320fd5b91a40302dab108725)) - intothebeans
- update readme - ([a10edf3](https://github.com/intothebeans/obsidian-vale-redux/commit/a10edf39e48dc8f36b51d887977f892db539fe6b)) - intothebeans
- update README - ([2d08e5c](https://github.com/intothebeans/obsidian-vale-redux/commit/2d08e5c6403409663813182c81708c842dd85975)) - intothebeans
- add a process diagram to readme - ([19b28a6](https://github.com/intothebeans/obsidian-vale-redux/commit/19b28a6cb692d5f009955f5936923c24744b50b3)) - intothebeans
- add changelog - ([01e2bed](https://github.com/intothebeans/obsidian-vale-redux/commit/01e2bed8fdf1ad5d61f4ab1c79fe10a6025d7516)) - intothebeans
- update readme - ([ac62259](https://github.com/intothebeans/obsidian-vale-redux/commit/ac62259a897f7b7ca0298ffbfb8896a7792ddfb7)) - intothebeans
- bump versions - ([0939189](https://github.com/intothebeans/obsidian-vale-redux/commit/0939189078b211a832b51de6846ae358c0ca351e)) - intothebeans

### :recycle: Refactoring

- **(core)** change how vale functionality is checked and stored - ([5143252](https://github.com/intothebeans/obsidian-vale-redux/commit/5143252637da18e77aba20416c6b881ca4f8442b)) - intothebeans
- **(core)** move command registry to its own file - ([7546ff6](https://github.com/intothebeans/obsidian-vale-redux/commit/7546ff6425e2cb6c7d0a37d96f9b4c3826b5564f)) - intothebeans
- **(settings)** simplfy settings data loading - ([de88eff](https://github.com/intothebeans/obsidian-vale-redux/commit/de88eff956201a18a671ce3dfb1f50be6b239feb)) - intothebeans
- start from scratch - ([6643971](https://github.com/intothebeans/obsidian-vale-redux/commit/6643971dc872575797d247bd4c994457989d4e23)) - intothebeans
- restore utils.ts - ([4eb52cc](https://github.com/intothebeans/obsidian-vale-redux/commit/4eb52cc604aa016d78ff6b16b6d665c0e80611d1)) - intothebeans
- clean up plugin initialization - ([eff4299](https://github.com/intothebeans/obsidian-vale-redux/commit/eff429963316aea4b9e770398042ec83a6136e17)) - intothebeans
- consistent valeConfigPath type - ([fb8ccab](https://github.com/intothebeans/obsidian-vale-redux/commit/fb8ccab1a8150205bfdde8209256cc3698607394)) - intothebeans
- cleanup debug msgs, imports, and types - ([946c2f1](https://github.com/intothebeans/obsidian-vale-redux/commit/946c2f19656947e08902e36d2df59025f14beba2)) - intothebeans
- better handling of defaults when loading settings - ([8d6cedc](https://github.com/intothebeans/obsidian-vale-redux/commit/8d6cedc903f4ccbc2040bbffa47840b7e74ffc6a)) - intothebeans
- clean up redundant and unused variables - ([1d9249a](https://github.com/intothebeans/obsidian-vale-redux/commit/1d9249a50466e7171df339a76378019a13cdf373)) - intothebeans
- severity handling - ([826f5da](https://github.com/intothebeans/obsidian-vale-redux/commit/826f5da4f7341edfb2f593bdd41c4022bb827c14)) - intothebeans
- clean up typing issues - ([4c3481f](https://github.com/intothebeans/obsidian-vale-redux/commit/4c3481fd53199fe8fbef64095aab832420aa6862)) - intothebeans
- openExternalFilesystemObject to improve file handling - ([0d59f96](https://github.com/intothebeans/obsidian-vale-redux/commit/0d59f9694e21fa82678cecd83ff2f9de0c51f413)) - intothebeans
- split settings into different functions - ([c6d441b](https://github.com/intothebeans/obsidian-vale-redux/commit/c6d441bca4fa6337494ed0a4b6f95fdfc6c132d2)) - intothebeans
- update docstrings and refactor types - ([1a7e136](https://github.com/intothebeans/obsidian-vale-redux/commit/1a7e1364219a6fb88d6a8a6176ebad7a8a80bc47)) - intothebeans
- remove debug statements - ([591893a](https://github.com/intothebeans/obsidian-vale-redux/commit/591893afbba62762deb2f8e33b7ff9d5874a17c0)) - intothebeans
- granularize codebase - ([e9412aa](https://github.com/intothebeans/obsidian-vale-redux/commit/e9412aa2ddbff12cea4a937048456649833c93b5)) - intothebeans
- prep for release - ([a1f98d4](https://github.com/intothebeans/obsidian-vale-redux/commit/a1f98d492585e7bf2878d07abad0aec34a3b79a8)) - intothebeans
- remove excessive tooling - ([2d47368](https://github.com/intothebeans/obsidian-vale-redux/commit/2d4736891c8f6f8d0f555d6feda4964725d6cfec)) - intothebeans
- add helper for creating divs - ([9bccb19](https://github.com/intothebeans/obsidian-vale-redux/commit/9bccb194c83673cb6c6bd8ffa3f314b414a0759b)) - intothebeans
- move code mirror extension logic to dedicated folder - ([12ab4ee](https://github.com/intothebeans/obsidian-vale-redux/commit/12ab4ee76565b8a6944169c7bc2e25167000d9ff)) - intothebeans

### :art: Style

- prettier formatting - ([17d4379](https://github.com/intothebeans/obsidian-vale-redux/commit/17d4379ec8e5212f6872b629b7b73ccc7755aeb2)) - intothebeans

### :wrench: Miscellaneous Chores

- **(deps)** bump package versions - ([2dacae1](https://github.com/intothebeans/obsidian-vale-redux/commit/2dacae12d911c7bee8c225247a6a6bd873fd3104)) - intothebeans
- **(deps)** bump versions - ([0afab0b](https://github.com/intothebeans/obsidian-vale-redux/commit/0afab0b80c4279fa94c50f1bf95d87fc63dbe42d)) - intothebeans

<!-- generated by git-cliff -->
