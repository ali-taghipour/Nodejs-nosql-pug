const express = require("express");
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/',shopController.getIndex);

router.get('/products',shopController.getProducts);

router.get('/cart',isAuth, shopController.getCart);

router.post('/cart',isAuth,shopController.postCart);

router.get('/products/:productId',isAuth, shopController.getProduct);

router.get('/orders',isAuth,shopController.getOrders);

// router.get('/checkout',shopController.getCheckout);

router.post('/cart-delete-item',isAuth,shopController.postDeleteCartProduct);

router.post('/orders',isAuth,shopController.postOrder);

module.exports = router;