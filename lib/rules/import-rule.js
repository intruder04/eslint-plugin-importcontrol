
const paramSchema = require('../schema/schema');

module.exports = (context) => {
  // console.log('NEW RUN');
  
  function noResult() {
    return { "VariableDeclaration": () => {} }
  }

  const checkArray = (array) => {
    if (typeof array !== 'undefined') {
      if (array.length >= 0) {
        return true
      }
    }
    return false;
  }
  
  // check if there are rule params
  if (context.options.length === 0) {
    return noResult();
  } 

  const currentFileExt = context.getFilename().split('\\').pop().split('/').pop();
  const params = context.options[0];
  const restrictArray = params.restrict;
  const permitArray = params.permit;

  // main logic function
  const compareParams = (type, action, node, param, variableDeclarator, forbiddenModuleRegexp, forbiddenPlaceRegexp) => {
    let moduleNameForReport;
    let placeMatched = false;
    let moduleMatched = false;
    let modulesToSearchIn;

    if (type === 'require') {
      if (variableDeclarator.init.type === 'CallExpression') {
        modulesToSearchIn = variableDeclarator.init.arguments[0].value;
      } else if (variableDeclarator.init.type === 'MemberExpression') {
        modulesToSearchIn = variableDeclarator.init.object.arguments[0].value;
      }
    }

    // array module name params
    if (Array.isArray(param.moduleName)) {
      let foundModuleInArray;
      if (type === 'require') {
        foundModuleInArray = param.moduleName.indexOf(modulesToSearchIn);
      } else if (type === 'import') {
        foundModuleInArray = param.moduleName.indexOf(node.source.value);
      }

      if (foundModuleInArray >= 0) {
        moduleMatched = true;
        moduleNameForReport = param.moduleName[foundModuleInArray];
      }
    // regexp module name params
    } else {
      let testModuleTemp = false
      if (type === 'require') {
        testModuleTemp = modulesToSearchIn.match(forbiddenModuleRegexp);
      } else if (type === 'import') {
        testModuleTemp = node.source.value.match(forbiddenModuleRegexp);
      }
      if (testModuleTemp !== null) {
        moduleMatched = true;
      }
      moduleNameForReport = forbiddenModuleRegexp;
    }

    // array import place params
    if (Array.isArray(param.importPlace)) {
      const foundPlaceInArray = param.importPlace.indexOf(currentFileExt);
      if (foundPlaceInArray >= 0) {
        placeMatched = true;
      }
    // regexp import place params
    } else if (currentFileExt.match(forbiddenPlaceRegexp) !== null) {
      placeMatched = true;
    }

    // console.log('---');
    // console.log('placeMatched', placeMatched);
    // console.log('moduleMatched', moduleMatched);
    // console.log('action', action);
    // console.log('type', type);
    
    // forbid report
    if (placeMatched === true && moduleMatched === true && action !== 'permit') {
      context.report(node, `Requirement of '${moduleNameForReport}' is NOT allowed in files: '${currentFileExt}'`);
    }

    // permit report
    if (placeMatched === false && moduleMatched === true && action === 'permit') {
      context.report(node, `Requirement of '${moduleNameForReport}' is allowed ONLY in files: '${param.importPlace}'`);
    }
  }


  return {
    meta: {
      schema: [
        paramSchema
      ]
    },
    // loop through 'const b = require(...);' declarations
    VariableDeclaration: (node) => {
      node.declarations.forEach((variableDeclarator) => {
        if (variableDeclarator.init) {
          if (checkArray(permitArray)) {
            permitArray.forEach((permitParam) => {
              if (permitParam.moduleName && permitParam.importPlace) {
                const allowedModuleRegexp = new RegExp(permitParam.moduleName, 'g');
                const allowedPlaceRegexp = new RegExp(permitParam.importPlace, 'g');
                // ordinary 'const module = require(...)';
                if (variableDeclarator.init.type === 'CallExpression' &&
                  variableDeclarator.init.callee.name === 'require') {
                    compareParams('require', 'permit', node, permitParam, variableDeclarator, allowedModuleRegexp, allowedPlaceRegexp);
                // check member expressions like 'require("./config/config")[ENVIRONMENT]';
                } else if (
                  variableDeclarator.init.type === 'MemberExpression' &&
                  variableDeclarator.init.object.type === 'CallExpression' &&
                  variableDeclarator.init.object.callee.name === 'require'
                ) {
                  compareParams('require', 'permit', node, permitParam, variableDeclarator, allowedModuleRegexp, allowedPlaceRegexp);
                }
              }
            });
          }
          if (checkArray(restrictArray)) {
            restrictArray.forEach((forbidParam) => {
              if (forbidParam.moduleName && forbidParam.importPlace) {
                const forbiddenModuleRegexp = new RegExp(forbidParam.moduleName, 'g');
                const forbiddenPlaceRegexp = new RegExp(forbidParam.importPlace, 'g');

                // ordinary 'const module = require(...)';
                if (variableDeclarator.init.type === 'CallExpression' &&
                  variableDeclarator.init.callee.name === 'require') {
                    compareParams('require', 'forbid', node, forbidParam, variableDeclarator, forbiddenModuleRegexp, forbiddenPlaceRegexp);
                    
                // check member expressions like 'require("./config/config")[ENVIRONMENT]';
                } else if (
                  variableDeclarator.init.type === 'MemberExpression' &&
                  variableDeclarator.init.object.type === 'CallExpression' &&
                  variableDeclarator.init.object.callee.name === 'require'
                ) {
                  compareParams('require', 'forbid', node, forbidParam, variableDeclarator, forbiddenModuleRegexp, forbiddenPlaceRegexp);
                }
              }
            });
          }
        }
      });
    },
    // loop through imports (es6)
    ImportDeclaration: (node) => {
      if (node.importKind === "value") {
        if (checkArray(permitArray)) {
          permitArray.forEach((allowParam) => {
            if (allowParam.moduleName && allowParam.importPlace) {
              const allowedModuleRegexp = new RegExp(allowParam.moduleName, 'g');
              const allowedPlaceRegexp = new RegExp(allowParam.importPlace, 'g');

              compareParams('import', 'permit', node, allowParam, null, allowedModuleRegexp, allowedPlaceRegexp);
            }
          });
        }
        if (checkArray(restrictArray)) {
          restrictArray.forEach((forbidParam) => {
            if (forbidParam.moduleName && forbidParam.importPlace) {
              const forbiddenModuleRegexp = new RegExp(forbidParam.moduleName, 'g');
              const forbiddenPlaceRegexp = new RegExp(forbidParam.importPlace, 'g');

              compareParams('import', 'forbid', node, forbidParam, null, forbiddenModuleRegexp, forbiddenPlaceRegexp);
            }
          });
        }
      }
    }
  }
}
