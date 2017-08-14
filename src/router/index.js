import Vue from 'vue'
import Router from 'vue-router'

import GoodsList from '@/views/GoodsList.vue'
import Cart from '@/views/Cart.vue'
import Address from '@/views/Address.vue'
import OrderComfirm from '@/views/OrderComfirm.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'GoodsList',
      component: GoodsList
    },
    {
      path: '/cart',
      name: 'Cart',
      component: Cart
    },
    {
      path: '/address',
      name: 'Address',
      component: Address
    },
    {
      path: '/orderConfirm',
      name: 'OrderComfirm',
      component: OrderComfirm
    },
    {
      path: '/orderSuccess',
      name: 'OrderSuccess',
      component: OrderSuccess
    }
  ]
})
