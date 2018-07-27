# eslint-plugin-importcontrol

ESLint plugin to forbid and allow importing certain modules.
Works with 'import' and 'require'.

## Installation

Put the contents of this rep to your project's node_modules/eslint-plugin-importcontrol

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-importcontrol` globally.

## Usage

Add `importcontrol` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "importcontrol"
    ]
}
```

Then configure the rules you want to use under the rules section.
You can use regexp both for files and imported modules.
Use arrays to search for exact module/place names matches.

```json
{
    "rules": {
        "importcontrol/import-rule": 2,
         {
        "restrict": [
          {
            "moduleName": "^./config$",
            "importPlace": ["config.js"]
          }     
        ],
        "permit": [
          {
            "moduleName": "^axi.*",
            "importPlace": ["exact-allowed-file1.js", "exact-allowed-file2.js"]
          }
        ]
      }
    }
}
```

