export default class Vuex {
    constructor(module) {
        this.module = module
        this.state = new Object()
        this.mutations = new Object()
        this.actions = new Object()
        this.getters = new Object()
        installModule(module, this)
        console.log(this);
    }
    commit(type, args) {
        if (this.mutations.hasOwnProperty(type)) {
            this.mutations[type](args)
        }
    }
    dispatch(type, args) {
        if (this.actions.hasOwnProperty(type)) {
            this.actions[type](args)
        }
    }
}
Vuex.install = function (Vue) {
    Vue.mixin({
        beforeCreate() {
            let options = this.$options
            if (options.store) {
                const store = this.$store = options.store
                const vm = defineReactive(Vue, store.state, store.getters)
                //访问store中getters数据的时候，代理到vm computed计算属性返回的getter
                defineGetterProperty(store, vm)
            } else if (options.parent && options.parent.store) {
                this.$store = options.parent.store
            }
        }
    })
    function defineGetterProperty(store, vm) {
        let getterKeys = Object.keys(store.getters)
        for (let key of getterKeys) {
            Object.defineProperty(store, key, {
                get() {
                    return vm[key]
                }
            })
        }
    }
}

function defineReactive(Vue, state, getters) {
    //因为getters中需要传递state参数，所以遍历封装成computed的方法
    let computed = {}
    let getterKeys = Object.keys(getters)
    for (let key of getterKeys) {
        computed[key] = function () {
            return getters[key](state)
        }
    }
    // console.log(computed.getA(state));

    //在vue初始化时会把data中定义的数据递归变为响应式的，并实例化一个dep用于依赖收集。
    //所以state中的数据在computed中访问的时候，也会收集computed watcher
    const vm = new Vue({
        data() {
            return { vmState: state }
        },
        computed: {
            ...computed
        }
    })
    return vm
}
function defineGetterProperty(store, vm) {
    let getterKeys = Object.keys(store.getters)
    for (let key of getterKeys) {
        Object.defineProperty(store, key, {
            get() {
                return vm[key]
            }
        })
    }
}

let nameSpace = []
//递归遍历module收集state,mutations,actions,getters
function installModule(module, store) {
    registerState(module, store, nameSpace)
    let local = makeLocalContext(store)
    registerMutations(module, store.mutations, local)
    registerActions(module, store.actions, local)
    registerGetters(module, store.getters, local)
    if (module.modules) {
        for (let name of Object.keys(module.modules)) {
            nameSpace.push(name)
            installModule(module.modules[name], store)
            nameSpace.pop()
        }
    }
}
//收集state的值
function registerState(module, store, nameSpace) {
    if (nameSpace.length) {
        //获取父模块，将当前模块中state赋值给父模块命名空间的属性
        let parentModule = getParentModuleState(store.state, nameSpace.slice(0, -1))
        parentModule[nameSpace[nameSpace.length - 1]] = module.state
    } else {
        store.state = module.state
    }
}

//收集mutations的方法
function registerMutations(module, mutations, local) {
    let path = module.namespaced ? nameSpace.join('/') + "/" : ""
    if (module.mutations) {
        for (let type of Object.keys(module.mutations)) {
            mutations[path + type] = function (args) {
                module.mutations[type](local.state, args)
            }
        }
    }
}

//收集actions的方法
function registerActions(module, actions, local) {
    let path = module.namespaced ? nameSpace.join('/') + "/" : ""
    if (module.actions) {
        for (let type of Object.keys(module.actions)) {
            actions[path + type] = function (args) {
                module.actions[type](local, args)
            }
        }
    }
}

//收集getters的方法
function registerGetters(module, getters, local) {
    let path = module.namespaced ? nameSpace.join('/') + "/" : ""
    if (module.getters) {
        for (let type of Object.keys(module.getters)) {
            getters[path + type] = function (args) {
                //这里要把调用的值返回出去，外面才能访问到
                return module.getters[type](local.state, local.getters, args)
            }
        }
    }
}

function makeLocalContext(store) {
    let name = nameSpace ? nameSpace.join('/') + "/" : ""
    function defineGetter(){
        const getterTarget = {}
        const getters = nameSpace.reduce((module,name)=>module.modules[name],store.module).getters
        if(getters){
            for (let key of Object.keys(getters)) {
                Object.defineProperty(getterTarget,key,{
                    get(){
                        return store[name+key]
                    }
                })
            }
        }
        return getterTarget
    }
    return {
        state: nameSpace.length ? nameSpace.reduce((state, name) => {
            return state[name]
        }, store.state) : store.state,
        commit: nameSpace.length ? function (type, args) {
            store.commit(name + type, args)
        } : store.commit.bind(store),
        dispatch: nameSpace.length ? function (type, args) {
            store.dispatch(name + type, args)
        } : store.dispatch.bind(store),
        getters: nameSpace.length ? defineGetter() : store
    }
}

function getParentModuleState(state, nameSpace) {
    return nameSpace.reduce((state, name, i) => state[name], state)
}
