const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const adminRoutes = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");
const dirPath = require("./util/path");
const path = require("path");
const fs = require("fs");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");

const MogodbConnectionURI = "mongodb://localhost:27017/shop";

const accessLogRequestStream = fs.createWriteStream(path.join(__dirname,"logRequest.log"),{flags:"a"});

const app = express();

// store place for seession
const store = new MongodbStore({
  uri: MogodbConnectionURI,
  collection: "sessions"
})

// store place for file like image , pdf
const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,"images");
  },
  filename: (req, file, cb) => {
    cb(null,new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req,file,cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

const csrfProtection = csrf();

app.set("view engine", "pug");
app.set("views", "views");

app.use(helmet()); // security middlewares
app.use(compression()); // zip js or some file to surve
app.use(morgan("combined",{stream:accessLogRequestStream}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter:fileFilter}).single("image"));

app.use(express.static(path.join(dirPath, "public")));
app.use(express.static(path.join(dirPath, "js")));
app.use("/images",express.static(path.join(dirPath, "images")));

// we can use any name for secret and it uses for hashing data
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