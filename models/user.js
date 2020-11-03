const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

const ObjectID = mongodb.ObjectID;

class User {
  constructor(userName, email,cart, _id) {
    this.userName = userName;
    this.email = email;
    this.cart = cart; // items:[]
    this._id = _id;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then((user) => console.log(user))
      .catch((err) => console.log(err));
  }

  addToCart(product){
    const db = getDb();
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items];
    const cartProductIndex = updatedCartItems.findIndex(cp => cp.productId.toString() === product._id.toString());
    if(cartProductIndex >= 0){
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else{
      updatedCartItems.push({productId: new ObjectID(product._id),quantity: newQuantity})
    }
    
    const updatedCart = {
      items: updatedCartItems
    }

    return db.collection("users")
      .updateOne({_id: new ObjectID(this._id)},
      {$set:{cart: updatedCart}})
  }

  static findById(userId){
    const db = getDb();
    return db
    .collection("users")
    .findOne({_id: new ObjectID(userId)})
    .then(product => {
        return product;
    })
    .catch(err => console.log(err));
  }
}


module.exports = User;