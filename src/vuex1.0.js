class Vuex {
    constructor(modules) {
        this.modules = modules
        this.state = modules.state
        this.mutations = modules.mutations
        this.actions = modules.actions
        this.getters = modules.getters
    }
    commit(type, args) {
        if (this.mutations.hasOwnProperty(type)) {
            this.mutations[type](this.state, args)
        }
    }
    dispatch(type, args) {
        if (this.actions.hasOwnProperty(type)) {
            this.actions[type](this, args)
        }
    }
    
}
Vuex.install = function (Vue) {
    Vue.mixin({
        beforeCreate() {
            let options = this.$options
            if (options.store) {
                const store = this.$store = options.store
                const vm = defineReactive(Vue,store.state,store.getters)
                //访问store中getters数据的时候，代理到vm computed计算属性返回的getter
                defineGetterProperty(store,vm)
            } else if (options.parent && options.parent.store) {
                this.$store = options.parent.store
            }
        }
    })
}
function defineReactive(Vue,state,getters){
    //因为getters中需要传递state参数，所以遍历封装成computed的方法
    let computed = {}
    let getterKeys = Object.keys(getters)
    for(let key of getterKeys){
        computed[key] = function(){
            return getters[key](state)
        }
    }
    //在vue初始化时会把data中定义的数据递归变为响应式的，并实例化一个dep用于依赖收集。
    //所以state中的数据在computed中访问的时候，也会收集computed watcher
    const vm = new Vue({
        data(){
            return {vmState: state}
        },
        computed:{
            ...computed
        }
    })
    return vm
}

function defineGetterProperty(store,vm){
    let getterKeys = Object.keys(store.getters)
    for(let key of getterKeys){
        Object.defineProperty(store,key,{
            get(){
                return vm[key]
            }
        })
    }
}
export default Vuex