const express = require("express");
const adminController = require("../controllers/admin");
const {body} = require("express-validator");
const router = express.Router();
const isAuth = require("../middleware/is-auth")

// /admin/add-product => GET

router.get('/add-product',isAuth,adminController.getAddProduct); 

// /admin/add-product => POST

router.post('/add-product',[
    body("title","Please enter the title in right format at least 3 charecter.")
    .isString()
    .isLength({min:3})
    .trim(),
    body("price","Please enter the price in right format")
    .isFloat(),
    body("description","Please enter the description in right format at least 5 charecter and max 400 charecter")
    .isLength({min: 5, max: 400})
    .trim()
],isAuth,adminController.postAddProduct);

router.get('/products',isAuth,adminController.getProducts); 

router.get('/edit-product/:productId',isAuth,adminController.getEditProduct)

router.post('/edit-product',[
    body("title")
    .isString()
    .isLength({min:3})
    .trim(),
    body("price")
    .isFloat(),
    body("description")
    .isLength({min: 5, max: 200})
    .trim()
],isAuth,adminController.postEditProduct);

router.post('/delete-product',isAuth,adminController.postDeleteProduct);

module.exports = router;
