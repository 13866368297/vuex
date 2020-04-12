const babel = require('babel-core')
const traverse = require('babel-traverse').default
let {ast} = babel.transform("let a = 1");
traverse(ast,{
    VariableDeclaration:(...args)=>{
        console.log(args);
    }
})

