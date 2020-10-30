const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  
  const product = new Product(title,price,description,imageUrl,null,req.user._id);
  product.save().then(() => {
    console.log("Product Created!!!");
    res.redirect("/admin/products");
  }).catch(err => {
    console.log(err);
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
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
  const product = new Product(productTitle,productPrice,productDescription,productImageUrl, productId);
  product.save()
    .then(() => {
      console.log("Product Updated!!!");
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteByID(productId)
    .then(() => {
      console.log("Destroied Product!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
