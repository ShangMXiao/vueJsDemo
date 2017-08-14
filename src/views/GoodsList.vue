<template>
    <div>
      <nav-header></nav-header>
      <nav-bread>
        <span>Goods</span>
      </nav-bread>
      <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" @click="sortGoods">
              Price
              <svg class="icon icon-arrow-short">
                <use xlink:href="#icon-arrow-short"></use>
              </svg>
            </a>
            <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show': filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur': priceChecked=='all'}"
                @click="priceChecked='all'">All</a></dd>
                <dd v-for="(price, index) in priceFilter">
                  <a href="javascript:void(0)" @click="setPriceFilter(index)" v-bind:class="{'cur': priceChecked==index}">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="(item, index) in goodsList">
                    <div class="pic">
                      <a href="#"><img v-lazy="'/static/'+ item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30"> 
                  <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav-footer></nav-footer>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
        <p slot="message">
          请先登录否则无法加入到购物车！
        </p>
        <div slot="btnGroup">
          <a href="javascript:;" class="btn btn--m" @click="mdShow=false">关闭</a>
        </div>
      </modal> 
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          加入购物车成功！
        </p>
        <div slot="btnGroup">
          <a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
          <router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
        </div>
      </modal> 
    </div>
</template>
<script>
    import './../assets/css/base.css'
    import './../assets/css/product.css'
    import './../assets/css/checkout.css'
    import './../assets/css/login.css'

    import axios from 'axios'

    import NavHeader from './../components/NavHeader.vue'
    import NavFooter from './../components/NavFooter.vue'
    import NavBread  from './../components/NavBread.vue'
    import Modal from './../components/Modal.vue'

    export default{
        data(){
            return {
              goodsList: [],
              priceFilter: [
                {
                  startPrice: '0',
                  endPrice: '500'
                },
                {
                  startPrice: '500',
                  endPrice: '1000'
                },
                {
                  startPrice: '1000',
                  endPrice: '2000'
                }
              ],
              priceChecked: 'all',
              filterBy: false,
              sortFlag: true,
              page: 1,
              pageSize: 8,
              busy: true,
              loading: false,
              mdShow: false,
              mdShowCart: false
            }
        },
        components: {
            NavHeader,
            NavFooter,
            NavBread,
            Modal
        },
        mounted: function() {
            this.getGoodsList();
        },
        methods: {
          getGoodsList(flag=false) {
            this.loading = true;
            var param = {
              sort: this.sortFlag ? 1 : -1,
              page: this.page,
              pageSize: this.pageSize,
              priceLevel: this.priceChecked
            }
            axios.get("/goods", {
              params: param
            }).then((result) => {
              this.loading = false;
              var res = result.data;
              if (res.status == 0) {
                this.$store.commit("updateCartCount", 1);
                if (flag) {
                  this.goodsList = this.goodsList.concat(res.result.list);
                  if (res.result.count == 0) {
                    this.busy = true;
                  }else {
                    this.busy = false;
                  }
                }else {
                  this.goodsList = res.result.list;
                  this.busy = false;
                }
              }
            });
          },
          showFilterPop() {
            this.filterBy = true;
            this.overLayFlag = true;
          },
          sortGoods() {
            this.sortFlag = !this.sortFlag
            this.page = 1;
            this.getGoodsList();
          },
          loadMore() {
            this.busy = true;
 
            setTimeout(() => {
              this.page++;
              this.getGoodsList(true);
            }, 1000);
          },
          setPriceFilter(index) {
            this.priceChecked = index;
            this.page = 1;
            this.getGoodsList();
          },
          addCart(productId) {
            axios.post("/goods/addCart", {
              productId: productId
            }).then((result) => {
              let res = result.data;
              if (res.status == 1) {
                this.mdShowCart = true;
              }else {
                this.mdShow = true;
              }
            });
          },
          closeModal() {
            this.mdShow = false;
          }
        }
    }
</script>
