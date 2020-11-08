const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if(message.length > 0){
      message =  message[0];
  }else{
      message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if(message.length > 0){
      message =  message[0];
  }else{
      message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error","Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt.compare(password,user.password).then((isValidPassword) => {
        if (isValidPassword) {
          req.session.user = user;
          req.session.isLoggedin = true;
          // .save method guarantee that session saved in database before redirecting
          return req.session.save((err) => {
            res.redirect("/");
          });
        }
        else{
            req.flash("error","Invalid email or password");
            return res.redirect("/login")
        }
      });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const repassword = req.body.repassword;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error","The user already exists!!!");
        return res.redirect("/signup");
      } else {
        bcrypt.hash(password, 12).then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] },
          });
          return user.save().then((result) => {
            res.redirect("/login");
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
