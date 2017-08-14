var express = require('express');
var router = express.Router();
var User = require('../models/user');
require('./../utils/data.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//登录接口
router.post("/login", (req, res, next) => {
	var param = {
		userName:req.body.userName,
		userPwd:req.body.userPwd
	};
	User.findOne(param, (err, doc) => {
		if (doc) {
			res.cookie("userId", doc.userId, {
				path: '/',
				maxAge: 1000*60*60
			});
			res.cookie("userName", doc.userName, {
				path: '/',
				maxAge: 1000*60*60
			});
			if (err) {
			res.json({
				status: "1",
				msg: err.message
			});
			}else {
				res.json({
					status: "0",
					msg: "",
					result: {
						userName:doc.userName
					}
				});
			}
		}else {
			res.json({
				status: "1",
				msg: "账号或密码错误",
				result: ""
			});
		}
	});
});

//登出接口
router.post("/logout", (req, res, next) => {
	res.cookie("userId", "", {
		path: "/",
		maxAge: -1
	});
	res.cookie("userName", "", {
		path: "/",
		maxAge: -1
	});
	res.json({
		status: "0",
		msg: "",
		result: ""
	});
});

//初始化校验登录
router.get("/checkLogin", (req, res, next) => {
	if(req.cookies.userId) {
		res.json({
			status: "0",
			msg: "",
			result: req.cookies.userName || ''
		});
	}else {
		res.json({
			status: "1",
			msg: "当前未登录",
			result: ""
		});
	}
});

//查询购物车
router.get("/cartList", (req, res, next) => {
	let userId = req.cookies.userId;
	User.findOne({userId:userId}, (err, doc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			res.json({
				status: "0",
				msg: "",
				result: doc.cartList
			});
		}
	});
});

//购物车删除
router.post("/cartdel", (req, res, next) => {
	let userId = req.cookies.userId;
	let productId = req.body.productId;
	User.update({
		userId: userId
	}, {
		$pull: {
			'cartList': {
				productId: productId
			}
		}
	}, (err, doc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			res.json({
				status: "0",
				msg: "",
				result: "suc"
			});
		}
	});
});

//修改购物车商品数量
router.post("/cartEdit", (req, res, next) => {
	let userId = req.cookies.userId,
		productId = req.body.productId,
		productNum = req.body.productNum,
		checked = req.body.checked;
	User.update({"userId": userId, "cartList.productId": productId}, {
		"cartList.$.productNum": productNum,
		"cartList.$.checked": checked
	}, (err, doc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			res.json({
				status: "0",
				msg: "",
				result: "suc"
			});
		}
	});
});

router.post("/editCheckAll", (req, res, next) => {
	let userId = req.cookies.userId,
		checkAll = req.body.checkAll ? "1" : "0";
	User.findOne({userId: userId}, (err, userDoc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			if (userDoc) {
				userDoc.cartList.forEach((item) => {
					item.checked = checkAll;
				});
				userDoc.save((err1, doc) => {
					if (err1) {
						res.json({
							status: "1",
							msg: err1.message,
							result: ""
						});
					}else {
						res.json({
							status: "0",
							msg: "",
							result: "success"
						});
					}
				});
			}
		}
	});
});

//查询用户地址借口
router.get("/addressList", (req, res, next) => {
	var userId = req.cookies.userId;
	User.findOne({userId: userId}, (err, userDoc) => {
		if (err) {
			res.json({
				status: "0",
				msg: err.message,
				result: ""
			});
		}else {
			if (userDoc) {
				res.json({
					status: "1",
					msg: "",
					result: userDoc.addressList
				});
			}
		}
	});
});

//设置默认地址接口
router.post("/setDefault", (req, res, next) => {
	var userId = req.cookies.userId,
		addressId = req.body.addressId;
	if (!addressId) {
		res.json({
			status: "1003",
			msg: "addressId is null",
			result: ""
		});
	}else {
		User.findOne({userId:userId}, (err, userDoc) => {
			if (err) {
				res.json({
					status: "1",
					msg: err.message,
					result: ""
				});
			}else {
				if (userDoc) {
					let addressList = userDoc.addressList;
					addressList.forEach((item) => {
						if (item.addressId == addressId) {
							item.isDefault = true;
						}else {
							item.isDefault = false;
						}
					});
				}

				userDoc.save((err1, doc) => {
					if (err1) {
						res.json({
							status: "1",
							msg: err.message,
							result: ""
						});
					}else {
						res.json({
							status: "0",
							msg: "",
							result: ""
						});
					}
				});
			};
		});
	}
	
});

//删除地址接口
router.post("/delAddress", (req, res, next) => {
	let userId = req.cookies.userId,
		addressId = req.body.addressId;
		User.update({userId: userId}, {
			$pull: {
				'addressList': {
					addressId: addressId
				}
			}
		}, (err, doc) => {
			if (err) {
				res.json({
					status: "1",
					msg: err.message,
					result: ""
				});
			}else {
				res.json({
					status: "0",
					msg: "",
					result: "success"
				});
			}
		});
});

//生成订单接口
router.post("/payment", (req, res, next) => {
	let userId = req.cookies.userId,
		addressId = req.body.addressId;
		orderTotal = req.body.orderTotal;
	User.findOne({userId: userId}, (err, userDoc) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			if (userDoc) {
				let address = '',
					goodsList = [];
				//获取当前用户的地址信息
				userDoc.addressList.forEach((item) => {
					if (addressId == item.addressId) {
						address = item;
					}
				});

				//获取用户购物车的购买商品
				userDoc.cartList.forEach((item) => {
					if (item.checked == "1") {
						goodsList.push(item);
					}
				});

				//生成订单
				let platform = '622';
				let r1 = Math.floor(Math.random()*10);
				let r2 = Math.floor(Math.random()*10);

				let sysDate = new Date().Format('yyyyMMddhhmmss');
				let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
				
				let orderId = platform + r1 + sysDate + r2;

				let order = {
					orderId: orderId,
					orderTotal: orderTotal,
					addressInfo: address,
					goodsList: goodsList,
					orderStatus: '1',
					createData: createDate
				}

				userDoc.orderList.push(order);

				userDoc.save((err1, doc) => {
					if (err1) {
						res.json({
							status: "1",
							msg: err1.message,
							result: ""
						});
					}else {
						res.json({
							status: "0",
							msg: "",
							result: {
								orderId: order.orderId,
								orderTotal: order.orderTotal
							}
						});
					}
				});
			}
		}
	});
});

//根据订单ID查询订单信息
router.get("/orderDetail", (req, res, next) => {
	let userId = req.cookies.userId,
		orderId = req.query.orderId;
	User.findOne({userId: userId}, (err, userInfo) => {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		}else {
			if (userInfo) {
				let orderList = userInfo.orderList
				if (orderList.length > 0) {
					let orderTotal = 0;
					orderList.forEach((item) => {
					  if (item.orderId == orderId) {
					  	orderTotal = item.orderTotal;
					  }
					});
					if (orderTotal > 0) {
						res.json({
							status: "0",
							msg: "",
							result: {
								orderId: orderId,
								orderTotal: orderTotal
							}
						});
					}else {
						res.json({
							status: "120002",
							msg: "无此订单",
							result: ""
						});
					}
					
				}else {
					res.json({
						status: "120001",
						msg: "当前用户未创建订单",
						result: ""
					});
				}
			}
		}
	});
});

//获取购物车数量
router.get("/getCartCount", (req, res, next) => {
	if (req.cookies && req.cookies.userId) {
		let userId = req.cookies.userId;
		User.findOne({userId: userId}, (err, userDoc) => {
			if (err) {
				res.json({
					status: "1",
					msg: err.message,
					result: ""
				});
			}else {
				let cartCount = 0;
				let userList = userDoc.cartList;
				if (userList) {
					userList.forEach((item) => {
					  cartCount += parseInt(item.productNum);
					});
					res.json({
						status: "0",
						msg: "",
						result: cartCount
					});
				}else {
					res.json({
						status: "1002",
						msg: "用户数据购物车为空",
						result: ""
					});
				}
			}
		});
	}else {
		res.json({
			status: "1001",
			msg: "",
			result: ""
		});
	}
});

module.exports = router;
