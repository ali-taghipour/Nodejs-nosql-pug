const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) =>
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });

  // console.log(adminData.products);
  // res.sendFile(path.join(dirPath,"views","shop.html"))
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) =>
      res.render("shop/index", {
        prods: products,
        pageTitle: "My Shop",
        path: "/"
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
  // populate spread other props of productId into cart items
    .populate("cart.items.productId")
  // it doesn't give back promise itself for that we use exec to create promise for that 
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      res.render("shop/cart", {
        cartProducts: products,
        pageTitle: "cart",
        path: "/cart"
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", { pageTitle: "Checkout", path: "/checkout"});
};

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id})
  .then((orders) => {
    res.render("shop/orders", {
      orders: orders,
      pageTitle: "Your Orders",
      path: "/orders"
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
  })
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
        path: "/products"
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postDeleteCartProduct = (req, res, next) => {
  const proId = req.body.productId;
  req.user
    .deleteCartProduct(proId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        /// _doc is a special mongoose thing that pull out whole of the producId object because we cant access it in simple way
        return {quantity: i.quantity, product: {...i.productId._doc}}
      })
      const order = new Order({
        user:{
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("./orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
