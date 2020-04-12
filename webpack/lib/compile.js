const path = require('path')
const fs = require('fs')
const { getAstAndCode, getDependencies } = require('./parse')
module.exports = class Compile {
    constructor(options) {
        this.entry = options.entry
        this.output = options.output
    }
    run() {
        let modules = this.buildModule([this.entry])
        this.emitFile(modules)
    }
    buildModule(dependencies) {
        let modules = {}
        while (dependencies.length) {
            let filename = dependencies.pop()
            let absolutePath = path.resolve(__dirname, '../src', filename)
            const {ast,code} = getAstAndCode(absolutePath)
            dependencies.push(...getDependencies(ast))
            modules[filename] = code
        }
        return modules
    }
    emitFile(modules) {
        const code = `(function(modules){
            function require(filename) {
                const code = modules[filename]
                let module = {};
                (function (module,exports) {
                    eval(code)
                })(module,module)
                return module.exports||module
            }
            require('${this.entry}')
        })(${ JSON.stringify(modules)})`
        let output = path.resolve(this.output.path, this.output.filename)
        fs.exists(this.output.path, (exists) => {
            if (!exists) {
                fs.mkdirSync(this.output.path)
            }
            fs.writeFileSync(output, code, 'utf-8')
        });
    }
}