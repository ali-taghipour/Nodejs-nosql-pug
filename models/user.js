const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId:{
        type: Schema.Types.ObjectId,
        ref: "Product",
        require: true
      },
      quantity:{
        type: Number,
        required: true
      }
    }]
  },
  resetToken: String,
  tokenExpiration: Date
})

userSchema.methods.addToCart = function(product) {
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    const cartProductIndex = updatedCartItems.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    if (cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        // i did delete new objectId because it adds automatically by mongoose
        productId: product._id,
        quantity: newQuantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    this.cart = updatedCart;

    return this.save();
}

userSchema.methods.deleteCartProduct  = function(productId){
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.clearCart = function(){
  this.cart.items = [];
  return this.save();
}

module.exports = mongoose.model("User",userSchema);







// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");

// const ObjectID = mongodb.ObjectID;

// class User {
//   constructor(userName, email, cart, _id) {
//     this.userName = userName;
//     this.email = email;
//     this.cart = cart; // items:[]
//     this._id = _id;
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then((user) => console.log(user))
//       .catch((err) => console.log(err));
//   }

//   addToCart(product) {
//     const db = getDb();
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     const cartProductIndex = updatedCartItems.findIndex(
//       (cp) => cp.productId.toString() === product._id.toString()
//     );
//     if (cartProductIndex >= 0) {
//       newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectID(product._id),
//         quantity: newQuantity,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectID(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((item) => {
//       return item.productId;
//     });

//     let updatedCartItems = this.cart.items;

//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         productIds.forEach(id => {
//           const existIndex = products.findIndex(p => {
//             return p._id.toString() === id.toString();
//           })
//           if(existIndex < 0){
//             updatedCartItems = this.cart.items.filter(item => {
//               return item.productId.toString() !== id.toString();
//             })
//           }
//         })
//         return products;
//       }).then(products => {
//         db.collection("users").updateOne({_id: this._id},{$set:{cart:{items: updatedCartItems}}});
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find((item) => {
//               return item.productId.toString() === product._id.toString();
//             }).quantity,
//           };
//         });
//       })
//       .catch((err) => console.log(err));
//   }

//   deleteCartProduct(productId) {
//     const updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== productId.toString();
//     });
//     const updatedCart = {
//       items: updatedCartItems,
//     };
//     const db = getDb();
//     return db
//       .collection("users")
//       .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectID(this._id),
//             userName: this.userName,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then(() => {
//         return db
//           .collection("users")
//           .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectID(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new ObjectID(userId) })
//       .then((product) => {
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = User;
