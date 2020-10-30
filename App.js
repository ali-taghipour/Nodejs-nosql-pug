const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRouter = require("./routes/shop");
const dirPath = require("./util/path");
const path = require("path");
const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(dirPath, "public")));

app.use((req, res, next) => {
    User.findById("5f668acc127b31e5f1b54726").then(user => {
        req.user = user;
        next();
    }).catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRouter);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(5000);
});