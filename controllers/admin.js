const Product = require("../models/product");
const {validationResult} = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
      errorMessage: null,
      errorValues: [],
      hasError: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: errors.array(),
      errorValues: errors.array(),
      product: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl
      },
      hasError: true
    });
  }
  
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    // i didn't add req.user._id because it gets it automatically
    userId: req.user

  });
  product.save().then(() => {
    console.log("Product Created!!!");
    res.redirect("/admin/products");
  }).catch(err => {
    console.log(err);
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  // -_id in select means removing product id
  // by select we just get some props
  //.select("title price -_id")
  // with populate in this case we get user complete info by userId field in product and we just can get special props by second arguments
  //.populate("userId","userName")
    .then((products) => {
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const proId = req.params.productId;
  Product.findById(proId)
//   Product.findByPk(proId)
    .then((product) => {
      res.render("admin/edit-product", {
        product: product,
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        errorMessage: null,
        errorValues: []
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const productTitle = req.body.title;
  const productImageUrl = req.body.imageUrl;
  const productPrice = req.body.price;
  const productDescription = req.body.description;

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: errors.array(),
      errorValues: errors.array(),
      product: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        _id: productId
      },
      hasError: true
    });
  }

  Product.findById(productId).then(product => {
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect("/");
    }
    product.title = productTitle;
    product.price = productPrice;
    product.description = productDescription;
    product.imageUrl = productImageUrl;
    product.save();
  })
    .then(() => {
      console.log("Product Updated!!!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  //Product.findByIdAndRemove(productId)
  // we use deleteOne to pass more props to which product we wanna delete by authorized one
  Product.deleteOne({_id: productId , userId: req.user._id})
    .then(() => {
      console.log("Destroied Product!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
