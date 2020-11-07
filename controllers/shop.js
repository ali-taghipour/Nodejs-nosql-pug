const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
  Product.find()
    .then((products) =>
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: isLoggedin
      })
    )
    .catch((err) => console.log(err));

  // console.log(adminData.products);
  // res.sendFile(path.join(dirPath,"views","shop.html"))
};

exports.getIndex = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
  Product.find()
    .then((products) =>
      res.render("shop/index", {
        prods: products,
        pageTitle: "My Shop",
        path: "/",
        isAuthenticated: isLoggedin
      })
    )
    .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
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
        path: "/cart",
        isAuthenticated: isLoggedin
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
  res.render("shop/checkout", { pageTitle: "Checkout", path: "/checkout",isAuthenticated: isLoggedin });
};

exports.getOrders = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
  Order.find({"user.userId": req.user._id})
  .then((orders) => {
    res.render("shop/orders", {
      orders: orders,
      pageTitle: "Your Orders",
      path: "/orders",
      isAuthenticated: isLoggedin
    });
  });
};

exports.getProduct = (req, res, next) => {
  const isLoggedin = req.get("Cookie").split("=")[1] === "true";
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
        isAuthenticated: isLoggedin
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
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        /// _doc is a special mongoose thing that pull out whole of the producId object because we cant access it in simple way
        return {quantity: i.quantity, product: {...i.productId._doc}}
      })
      const order = new Order({
        user:{
          userName: req.user.userName,
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
    .catch((err) => console.log(err));
};
