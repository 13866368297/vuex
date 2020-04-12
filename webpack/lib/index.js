const Compile = require("./compile.js")
const options = require("../webpack.config.js")
const compile = new Compile(options)
compile.run()