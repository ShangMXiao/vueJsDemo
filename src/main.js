// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infoniteScroll from 'vue-infinite-scroll'
import Vuex from 'vuex'

Vue.config.productionTip = false

Vue.use(VueLazyLoad, {
	loading: "static/loading-svg/loading-bubbles.svg"
});

Vue.use(Vuex)

Vue.use(infoniteScroll);

const store = new Vuex.Store({
	state: {
		nickName: '',
		cartCount: 0
	},
	mutations: {
		updateUserInfo(state, nickName) {
			state.nickName = nickName;
		},
		updateCartCount(state, cartCount) {
			state.cartCount += cartCount;
		}
	},
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
