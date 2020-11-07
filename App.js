const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);

const adminRoutes = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
const dirPath = require("./util/path");
const path = require("path");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");

const MogodbConnectionURI = "mongodb://localhost:27017/shop";

const app = express();

const store = new MongodbStore({
  uri: MogodbConnectionURI,
  collection: "sessions"
})

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(dirPath, "public")));

// we can use any name for secret and it use for hashing data
// we use resave to not save per session per request expect on it did change
// we use saveUnitialized for not saving unitialized value
app.use(session({secret: "my secret", resave: false, saveUninitialized: false, store: store}))

app.use((req, res, next) => {
  if(!req.session.user){
    next();
  }else{
    User.findById(req.session.user._id).then(user => {
      req.user = user;
      next();
    }).catch(err => console.log(err));
  }
});

app.use("/admin", adminRoutes);
app.use(shopRouter);
app.use(authRouter);

app.use(errorController.get404);

mongoose.connect(MogodbConnectionURI,{ useNewUrlParser: true,useUnifiedTopology: true })
.then(() => {
  User.findOne().then(user => {
    if(!user){
      const user = new User({
        userName: "Ali",
        email: "taghipourali19@gmail.com",
        cart: {items:[]}
      });
      user.save();
    }
  }).catch(err => {
    console.log(err)
  })

  app.listen(5000);
}).catch(err => {
  console.log(err)
})