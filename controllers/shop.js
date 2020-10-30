const Product = require("../models/product");

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
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      console.log(products);
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
  req.user.getOrders({include:["products"]}).then(orders => {
    console.log(orders);
    res.render("shop/orders", { orders: orders, pageTitle: "Your Orders", path: "/orders" });
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
        path: "/products",
      })
    )
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({where:{ id: prodId }});
    })
    .then((products => {
      let product;

      if(products.length > 0){
        product = products[0]
      }
      if(product){
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(prodId);
    }))
      .then(product => {
        return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
      })
      .then(() => res.redirect("/cart"))
      .catch(err => console.log(err));
  
  // Product.findById(prodId, (product) => {
  //   Cart.addProduct(prodId, product.price);
  // });
};

exports.postDeleteCartProduct = (req, res, next) => {
  const proId = req.body.productId;
  req.user.getCart().then(cart => {
    return cart.getProducts({where:{id: proId}})
  }).then(products => {
    const product = products[0];
    return product.cartItem.destroy();
  }).then(() => {
    res.redirect("/cart");
  })
  .catch(err => console.log(err));
};

exports.postOrder = (req,res,next) => {
  let fetchedCart;
  req.user.getCart().then(cart => {
    fetchedCart = cart;
    return cart.getProducts();
  }).then(products => {
    req.user.createOrder().then(order => {
      return order.addProducts(products.map(product => {
        product.orderItem = {quantity: product.cartItem.quantity};
        return product;
      })).then(result => {
        return fetchedCart.setProducts(null);
      }).then(() => {
        res.redirect('./orders');
      })
    }).catch(err => console.log(err));
  })
  .catch(err => console.log(err));
}
