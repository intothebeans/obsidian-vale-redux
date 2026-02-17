# Changelog

All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

---
## [0.2.1](https://github.com/intothebeans/obsidian-vale-redux/compare/0.2.0..0.2.1) - 2026-02-15

### :rocket: Features

- **(settings)** add toggle for inline highlights - ([034cb16](https://github.com/intothebeans/obsidian-vale-redux/commit/034cb16eb2b96cf94a89bb5414f8ea1ca06aca71)) - intothebeans
- **(settings)** add notice for any settings requiring a reload - ([968ce12](https://github.com/intothebeans/obsidian-vale-redux/commit/968ce124d661e27a15b4a3f1211365cabb3efbca)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- Merge pull request #21 from intothebeans/feat/highlight-settings

Feat/highlight settings - ([17124f2](https://github.com/intothebeans/obsidian-vale-redux/commit/17124f281bfbc29158fca375c78324b60ef85b47)) - Aiden
- version 0.2.0 → 0.2.1 - ([2ef011f](https://github.com/intothebeans/obsidian-vale-redux/commit/2ef011f55b56c7561c65e4e8e5a2dfa1080db5ef)) - intothebeans
- Merge pull request #35 from intothebeans/bug/file-opening-win

Bug/file opening win - ([e1ef5f5](https://github.com/intothebeans/obsidian-vale-redux/commit/e1ef5f5f6bad60f2309cac87779aa53f9d7a6d9a)) - Aiden

### :bug: Bug Fixes

- **(core)** add strictor typing to editorExtensions array - ([f5528ff](https://github.com/intothebeans/obsidian-vale-redux/commit/f5528ffe3f82c6f499a85100bbf1017641c5ae7b)) - intothebeans
- config failing to open from settings on windows - ([33ef4fb](https://github.com/intothebeans/obsidian-vale-redux/commit/33ef4fbecd5aeeeeb2f0df70ff874edf2ae2dfa9)) - intothebeans

---
## [0.2.0](https://github.com/intothebeans/obsidian-vale-redux/compare/0.1.0..0.2.0) - 2026-02-15

### :rocket: Features

- **(ui)** clicking on issues in the pane also highlights them - ([e9dfdea](https://github.com/intothebeans/obsidian-vale-redux/commit/e9dfdea906118c1990f97b6f8ab832823813bd6f)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- update release workflow - ([3187a32](https://github.com/intothebeans/obsidian-vale-redux/commit/3187a32079da72662dbcddcae74eaef0953df34e)) - intothebeans
- remove prettier check from lint script - ([392d6d4](https://github.com/intothebeans/obsidian-vale-redux/commit/392d6d4d6731011c5b6e68f616c6873ccc846c78)) - intothebeans

### :bug: Bug Fixes

- **(core)** failed functionality checks stop linting from running - ([317292f](https://github.com/intothebeans/obsidian-vale-redux/commit/317292f73cca2d54678313b887fa6dec8c185627)) - intothebeans
- **(runner)** runner options being decoupled from plugin settings - ([4d36794](https://github.com/intothebeans/obsidian-vale-redux/commit/4d36794be55c09b0d6b780ba5bc574fca82e6169)) - intothebeans
- **(settings)** plugin fails to load if no existing plugin data - ([1cd8080](https://github.com/intothebeans/obsidian-vale-redux/commit/1cd8080276d86c775bd7760ba934fdfdd99006cf)) - intothebeans
- **(ui)** EditorView updates firing over each other illegally - ([5776b76](https://github.com/intothebeans/obsidian-vale-redux/commit/5776b76e6778ce2d09a88f108d1b4a131586b27f)) - intothebeans

### :memo: Documentation

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
- remove excessive tooling - ([2d47368](https://github.com/intothebeans/obsidian-vale-redux/commit/2d4736891c8f6f8d0f555d6feda4964725d6cfec)) - intothebeans
- add helper for creating divs - ([9bccb19](https://github.com/intothebeans/obsidian-vale-redux/commit/9bccb194c83673cb6c6bd8ffa3f314b414a0759b)) - intothebeans
- move code mirror extension logic to dedicated folder - ([12ab4ee](https://github.com/intothebeans/obsidian-vale-redux/commit/12ab4ee76565b8a6944169c7bc2e25167000d9ff)) - intothebeans

---
## [0.1.0](https://github.com/intothebeans/obsidian-vale-redux/releases/tag/0.1.0) - 2026-02-13

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
- add configurable process timeout wait - ([d608a46](https://github.com/intothebeans/obsidian-vale-redux/commit/d608a467bd0a49e9b9d7172b08dc6eee4fb0a0eb)) - intothebeans

### :twisted_rightwards_arrows: Other Changes

- **(actions)** streamline release action and note template - ([24a59f9](https://github.com/intothebeans/obsidian-vale-redux/commit/24a59f915ea8fe96fe7fd96d380929802b61fd7d)) - intothebeans
- **(npm)** add additional scripts - ([251744d](https://github.com/intothebeans/obsidian-vale-redux/commit/251744def66ed2b8dcacb943be2e5cb01ceb40fa)) - intothebeans
- add devcontainer - ([f5a272f](https://github.com/intothebeans/obsidian-vale-redux/commit/f5a272f4de0c5f7c1a9d493edc8a5945b301fff5)) - intothebeans
- update eslint to flat file config - ([dc4afd6](https://github.com/intothebeans/obsidian-vale-redux/commit/dc4afd6b3aad62174507cdf4f1a3f3a96f2436f9)) - intothebeans
- update actions workflows - ([62f4c6f](https://github.com/intothebeans/obsidian-vale-redux/commit/62f4c6fead2989728ddf406ef47a31e8402773b3)) - intothebeans
- add permissions to actions workflows - ([3cc01ed](https://github.com/intothebeans/obsidian-vale-redux/commit/3cc01eddad5b0ca1a5b004dde6a60f6cbc34ea94)) - intothebeans
- add commit tooling - ([2f0d0c0](https://github.com/intothebeans/obsidian-vale-redux/commit/2f0d0c02bd1883cf16cf60a6165d5f042d5c0fd8)) - intothebeans
- delete to-do issue workflow - ([56301d3](https://github.com/intothebeans/obsidian-vale-redux/commit/56301d3e65fd463bf3f50d0c98429d6e115e2472)) - Aiden Benton
- update release workflow - ([71d60f1](https://github.com/intothebeans/obsidian-vale-redux/commit/71d60f17fc39ab2b4f21c933388ef9733067dc45)) - Aiden Benton
- remove prettier check from lint script - ([6c24936](https://github.com/intothebeans/obsidian-vale-redux/commit/6c249364945824395b847ec717b762236fc52e19)) - Aiden Benton

### :bug: Bug Fixes

- **(core)** failed functionality checks stop linting from running - ([ab9ec71](https://github.com/intothebeans/obsidian-vale-redux/commit/ab9ec71373f37a96210b0088600a58232591c8fe)) - intothebeans
- **(linter)** process failing when linter finds errors - ([7c77aa9](https://github.com/intothebeans/obsidian-vale-redux/commit/7c77aa95e6237054e8de35ed5ccb022ad20c9293)) - intothebeans
- **(runner)** runner options being decoupled from plugin settings - ([5a86cc2](https://github.com/intothebeans/obsidian-vale-redux/commit/5a86cc2ee23e18ec0366d1e8cf985c878810e355)) - intothebeans
- **(settings)** plugin fails to load if no existing plugin data - ([e59aa34](https://github.com/intothebeans/obsidian-vale-redux/commit/e59aa340b5d4b42a3e8f6aaac157ee7826059ab2)) - intothebeans
- **(ui)** EditorView updates firing over each other illegally - ([00c70f6](https://github.com/intothebeans/obsidian-vale-redux/commit/00c70f6904739edb887b68ab6d1b7a5512c36182)) - intothebeans
- process timeout handling - ([cb43997](https://github.com/intothebeans/obsidian-vale-redux/commit/cb439972e0513c1187afe99aa1d4bffd34a06b33)) - intothebeans
- minor typing issue - ([638d26a](https://github.com/intothebeans/obsidian-vale-redux/commit/638d26ade0c1e75a3b4d5fd20ed9d42ee6ffaa78)) - intothebeans
- misnamed css variable - ([fb2303c](https://github.com/intothebeans/obsidian-vale-redux/commit/fb2303c6206859f19bd62b3e35853e1cd40a0d3a)) - intothebeans
- update import for Buffer type - ([62c8bf3](https://github.com/intothebeans/obsidian-vale-redux/commit/62c8bf325070ef7fa716f540d06ab072a68b9ebc)) - intothebeans

### :memo: Documentation

- update metadata - ([fdc3367](https://github.com/intothebeans/obsidian-vale-redux/commit/fdc3367268d52f88320fd5b91a40302dab108725)) - intothebeans
- update readme - ([8b544d5](https://github.com/intothebeans/obsidian-vale-redux/commit/8b544d55fd21e2c09010fec36a5882aea9215165)) - intothebeans
- update README - ([9db5ab1](https://github.com/intothebeans/obsidian-vale-redux/commit/9db5ab1d9341c8d1ed53b51b9b56185ded987f18)) - intothebeans
- add a process diagram to readme - ([c114af7](https://github.com/intothebeans/obsidian-vale-redux/commit/c114af794c889292e5cd0b6d327a16701cd3ca2c)) - intothebeans

### :recycle: Refactoring

- **(core)** change how vale functionality is checked and stored - ([3e3da9a](https://github.com/intothebeans/obsidian-vale-redux/commit/3e3da9ae52b278b54eae826a295c49d2960d3535)) - intothebeans
- **(core)** move command registry to its own file - ([d981588](https://github.com/intothebeans/obsidian-vale-redux/commit/d981588a931a62c8ff075d5c722f9c0576d5941c)) - intothebeans
- **(settings)** simplfy settings data loading - ([512239f](https://github.com/intothebeans/obsidian-vale-redux/commit/512239ffd95ba9426ef42c673d9d743d982eebd5)) - intothebeans
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
- remove excessive tooling - ([aa34630](https://github.com/intothebeans/obsidian-vale-redux/commit/aa346303153be890831b2db7fe907346d3867bcf)) - intothebeans
- add helper for creating divs - ([bab8cb6](https://github.com/intothebeans/obsidian-vale-redux/commit/bab8cb6096a576446c93b8982520ddac68958cd0)) - intothebeans

### :art: Style

- prettier formatting - ([17d4379](https://github.com/intothebeans/obsidian-vale-redux/commit/17d4379ec8e5212f6872b629b7b73ccc7755aeb2)) - intothebeans

### :wrench: Miscellaneous Chores

- **(deps)** bump package versions - ([2dacae1](https://github.com/intothebeans/obsidian-vale-redux/commit/2dacae12d911c7bee8c225247a6a6bd873fd3104)) - intothebeans
- **(deps)** bump versions - ([0afab0b](https://github.com/intothebeans/obsidian-vale-redux/commit/0afab0b80c4279fa94c50f1bf95d87fc63dbe42d)) - intothebeans

<!-- generated by git-cliff -->
