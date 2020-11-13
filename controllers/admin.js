const Product = require("../models/product");
const {validationResult} = require("express-validator");
const fileControler = require("../util/file");

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
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      errorMessage: [{msg:"The file format is incrrect and required!!!"}],
      errorValues: [],
      product: {
        title: title,
        price: price,
        description: description,
      },
      hasError: true
    }); 
  }

  const imagePath = image.path;
  
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
        description: description
      },
      hasError: true
    });
  }
  
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imagePath,
    // i didn't add req.user._id because it gets it automatically
    userId: req.user

  });
  product.save().then(() => {
    console.log("Product Created!!!");
    res.redirect("/admin/products");
  }).catch(err => {
    /***** some scenario we have minor problem and we redirect to 500 page as blew ****/
    //res.status(500).redirect("/500")
    /***** we can solve upon problem by using express error middleware handler ****/
    const error = new Error(err);
    error.httpStatusCode = 500;
    next(error);
    /////////************** it is for such case we can fix as fast ***********//////
    // return res.status(500).render("admin/edit-product", {
    //   pageTitle: "Add Product",
    //   path: "/admin/add-product",
    //   errorMessage: [{msg:"Database operation has failed. Please try later."}],
    //   errorValues: [],
    //   product: {
    //     title: title,
    //     price: price,
    //     description: description,
    //     imageUrl: imageUrl
    //   },
    //   hasError: true
    // });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const productTitle = req.body.title;
  const productImage = req.file;
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
    if(productImage){
      fileControler.deleteFile(product.imageUrl);
      product.imageUrl = productImage.path;
      console.log("ssadsad")
    }
    product.save();
  })
    .then(() => {
      console.log("Product Updated!!!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId).then(product => {
    if(!product){
      return next(new Error("Not found Product!!!"))
    }
    fileControler.deleteFile(product.imageUrl);
     //Product.findByIdAndRemove(productId)
    // we use deleteOne to pass more props to which product we wanna delete by authorized one
    return Product.deleteOne({_id: productId , userId: req.user._id});
  })
    .then(() => {
      console.log("Destroied Product!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};
