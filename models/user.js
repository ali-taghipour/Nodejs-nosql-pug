const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

const ObjectID = mongodb.ObjectID;

class User {
  constructor(userName, email) {
    this.userName = userName;
    this.email = email;
  }

  save() {
    const db = getDb();
    return db
      .collection("users")
      .insertOne(this)
      .then((user) => console.log(user))
      .catch((err) => console.log(err));
  }

  static findById(userId){
    const db = getDb();
    return db
    .collection("users")
    .find({_id: new ObjectID(userId)})
    .next()
    .then(product => {
        return product;
    })
    .catch(err => console.log(err));
  }
}


module.exports = User;