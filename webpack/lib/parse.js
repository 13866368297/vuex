const fs = require("fs")
const { transformFileSync } = require('babel-core')
const traverse = require("babel-traverse").default
module.exports = {
    getAstAndCode(path) {
        let { code, ast } = transformFileSync(path)
        return {
            ast,
            code
        }
    },
    getDependencies(ast) {
        let dependencies = []
        traverse(ast, {
            CallExpression: ({ node: { callee, arguments } }) => {
                if (callee.name === "require") {
                    dependencies.push(arguments[0].value)
                }
            }
        })
        return dependencies
    }
}