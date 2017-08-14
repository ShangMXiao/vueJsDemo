var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/demo');

mongoose.connection.on("connected", () => {
	console.log("MongoDB connected success");
});

mongoose.connection.on("error", () => {
	console.log("MongoDB connected fail");
});

mongoose.connection.on("disconnected", () => {
	console.log("MongoDB connected disconnected");
});

//获取商品路由
router.get("/", (req, res, next) => {
	let page = parseInt(req.query.page);
	let pageSize = parseInt(req.query.pageSize);
	sort = parseInt(req.query.sort);
	let skip = (page - 1) * pageSize;
	
	let priceLevel = req.query.priceLevel;
	var priceGt = '', priceLte = ''; 
	let params = {};

	//筛选商品
	if (priceLevel != 'all') {
		switch(priceLevel) {
			case '0':priceGt = 0; priceLte = 100;break;
			case '1':priceGt = 100; priceLte = 500;break;
			case '2':priceGt = 500; priceLte = 1000;break;
			case '3':priceGt = 1000; priceLte = 2000;break;
		}
		params = {
			salePrice: {
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}
	

	
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':sort});
	goodsModel.exec((err, doc) => {
		if (err) {
			res.json({
				status: '1',
				msg: err.message
			});
		}else {
			res.json({
				status: '0',
				msg: '',
				result: {
					count: doc.length,
					list: doc
				}
			});
		}
	});
});

//加入购物车
router.post("/addCart", (req, res, next) => {
	let userId = '100000077';
	let productId = req.body.productId;
	let User = require('../models/user.js');
	User.findOne({userId:userId}, (err, userDoc) => {
		if (err) {
			res.json({
				status: "0",
				msg: err.message
			});
		}else {
			if (userDoc) {
				let goodsItem = '';
				userDoc.cartList.forEach((item) => {
					if (item.productId == productId) {
						goodsItem = item;
						item.productNum ++;
					}
				});
				if (goodsItem) {
					userDoc.save((err2, doc2) => {
						if (err2) {
							res.json({
								status: "0",
								msg: err2.message
							});
						}else {
							res.json({
								status: "1",
								mes: "",
								result: "success"
							});
						}
					});
				}else {
					Goods.findOne({productId:productId}, (err1, doc1) => {
						if (err1) {
							res.json({
								status: "0",
								msg: err1.message
							});
						}else {
							if (doc1) {
								doc1.productNum = 1;
								doc1.checked = 1;
								userDoc.cartList.push(doc1);
								userDoc.save((err2, doc2) => {
									if (err2) {
										res.json({
											status: "0",
											msg: err2.message,
											result: ""
										});
									}else {
										res.json({
											status: "1",
											mes: "",
											result: "success"
										});
									}
								});
							}
						}
					});
				}
				
			}
		}
	});
});


module.exports = router;