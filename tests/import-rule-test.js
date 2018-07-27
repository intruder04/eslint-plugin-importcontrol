
const { RuleTester } = require("eslint");
const rule = require("../lib/rules/import-rule");

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  }
});

const ruleTester = new RuleTester();
console.log(ruleTester);

ruleTester.run("importcontrol/import-rule", rule, {
  valid: [
    {
      code: "import axios from 'axios';", options: [{
      "restrict": [
        {
          "moduleName": ".*",
          "importPlace": ".*"
        }
      ]
    }]
   },
  ],

  invalid: [
    {
      code: "import axios from 'axios';",
      errors: [{
        message: 'Requirement of \'axios\' is not allowed in \'axios.js\' file',
        type: 'ImportDeclaration'
      }]
    }
  ]
});


