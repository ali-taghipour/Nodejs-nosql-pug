const mongodb = require("mongodb");
const MongoClient = require("mongodb/lib/mongo_client");

let _db;

const mongoConnect = callBack => {
    MongoClient.connect("mongodb+srv://Ali:a85242855@cluster0.xtuhc.mongodb.net/shop?retryWrites=true&w=majority",{ useUnifiedTopology: true}).then(client => {
        _db = client.db();
        callBack();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
}

const getDb = () => {
    if(_db){
        return _db;
    }    
    throw "No Database Found!!!";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;