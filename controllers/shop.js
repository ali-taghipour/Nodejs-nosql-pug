const Product = require("../models/product");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) =>
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      })
    )
    .catch((err) => console.log(err));

  // console.log(adminData.products);
  // res.sendFile(path.join(dirPath,"views","shop.html"))
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) =>
      res.render("shop/index", {
        prods: products,
        pageTitle: "My Shop",
        path: "/",
      })
    )
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        cartProducts: products,
        pageTitle: "cart",
        path: "/cart",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", { pageTitle: "Checkout", path: "/checkout" });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then((orders) => {
    res.render("shop/orders", {
      orders: orders,
      pageTitle: "Your Orders",
      path: "/orders",
    });
  });
};

exports.getProduct = (req, res, next) => {
  const proId = req.params.productId;
  //   Product.findAll({where: {id: proId}})
  //   .then(product =>
  //     res.render("shop/product-detail", {
  //     product: product[0],
  //     pageTitle: "Product Detail",
  //     path: "/products",
  //   }) ).catch(err => console.log(err));
  Product.findById(proId)
    .then((product) =>
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product Detail",
        path: "/products",
      })
    )
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.postDeleteCartProduct = (req, res, next) => {
  const proId = req.body.productId;
  req.user
    .deleteCartProduct(proId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(() => {
      res.redirect("./orders");
    })
    .catch((err) => console.log(err));
};
