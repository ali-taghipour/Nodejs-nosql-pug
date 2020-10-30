const express = require("express");
const shopController = require("../controllers/shop");

const router = express.Router();

router.get('/',shopController.getIndex);

router.get('/products',shopController.getProducts);

// router.get('/cart',shopController.getCart);

// router.post('/cart',shopController.postCart);

router.get('/products/:productId',shopController.getProduct);

// router.get('/orders',shopController.getOrders);

// router.get('/checkout',shopController.getCheckout);

// router.post('/cart-delete-item',shopController.postDeleteCartProduct);

// router.post('/orders',shopController.postOrder);

module.exports = router;