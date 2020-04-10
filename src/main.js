import Vue from '../node_modules/vue/dist/vue.js'
Vue.config.productionTip = false

import Vuex from "./vuex"
Vue.use(Vuex)
const store = new Vuex({
  state:{
    a:111
  },
  mutations:{
    setA(store,num){
      store.a = num
    }
  },
  actions:{
    setA(store,num){
      setTimeout(()=>{
        store.commit('setA',num)
      },1000)
    }
  },
  getters:{
    getA(state,getters){
      return state.a
    },
    getB(state,getters){
      return getters.getA
    }
  },
  modules:{
    MA:{
      namespaced: true,
      state:{
        a:111
      },
      mutations:{
        setA(store,num){
          store.a = num
        }
      },
      getters:{
        getA(state,getters){
          return state.a
        },
        getB(state,getters){
          return getters.getA
        }
      },
      actions:{
        asyncSetA(store,num){
          setTimeout(()=>{
            store.commit('setA',num)
          },1000)
        },
        asyncSetB({dispatch},num){
          dispatch('asyncSetA',num)
        }
      }
    }
  }
})
new Vue({
  data(){
    return {
    }
  },
  store,
  template:`
  <div>
  <h3>根模块</h3>
  <div @click="$store.commit('setA',222)">commit==={{this.$store.state.a}}==={{this.$store.getA}}</div>
  <div @click="$store.dispatch('setA',333)">dispatch==={{this.$store.state.a}}==={{this.$store.getB}}</div>
  <h3>子模块</h3>
  <div @click="$store.commit('MA/setA',444)">commit==={{this.$store.state.MA.a}}==={{this.$store['MA/getA']}}</div>
  <div @click="$store.dispatch('MA/asyncSetB',555)">dispatch==={{this.$store.state.MA.a}}==={{this.$store['MA/getB']}}</div>
  </div>`,
}).$mount('#app')
