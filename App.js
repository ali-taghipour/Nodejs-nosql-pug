const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

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

const csrfProtection = csrf();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(dirPath, "public")));

// we can use any name for secret and it use for hashing data
// we use resave to not save per session per request expect on it did change
// we use saveUnitialized for not saving unitialized value
app.use(session({secret: "my secret", resave: false, saveUninitialized: false, store: store}));
app.use(csrfProtection);
app.use(flash());

app.use((req,res,next) => {
  // locals use for views in other hands we access thease properties such as isAthenticated and csrf token in any view page
  res.locals.isAuthenticated = req.session.isLoggedin;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {
  /** when we throw error out of async then/catch block the express can see it */
  //throw new Error("okey");
  if(!req.session.user){
    next();
  }else{
    User.findById(req.session.user._id).then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    }).catch(err => {
      next(new Error(err));
    });
  }
});

app.use("/admin", adminRoutes);
app.use(shopRouter);
app.use(authRouter);

app.use("/500",errorController.get500);

app.use(errorController.get404);

app.use((error,req,res,next) => {
  /** we set entirely render in this block because when user authorize middleware upon there execute it occure infinite loop **/
  res.status(500).render("500",{
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedin
  })
})

mongoose.connect(MogodbConnectionURI,{ useNewUrlParser: true,useUnifiedTopology: true })
.then(() => {
  app.listen(5000);
}).catch(err => {
  console.log(err)
})