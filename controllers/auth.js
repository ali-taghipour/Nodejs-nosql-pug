const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
//const sendgridTransport = require("nodemailer-sendgrid-transport"); we use for amazon service
const crypto = require("crypto");
const User = require("../models/user");
const flash = require("connect-flash/lib/flash");

const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  secureConnection: false,
  port: 587,
  tls: {
    ciphers: "SSLv3",
  },
  auth: {
    user: "taghipourali19@hotmail.com",
    pass: "aA##85242855",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Signup",
    path: "/signup",
    errorMessage: message,
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/resetPassword", {
    pageTitle: "Reset Password",
    path: "/reset",
    errorMessage: message,
  });
};

exports.getNewPassword = (req, res, next) => {
  const resetToken = req.params.token;
  User.findOne({ resetToken: resetToken, tokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/newPassword", {
        pageTitle: "New Password",
        path: "/newPassword",
        errorMessage: message,
        resetToken: resetToken,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((isValidPassword) => {
        if (isValidPassword) {
          req.session.user = user;
          req.session.isLoggedin = true;
          // .save method guarantee that session saved in database before redirecting
          return req.session.save((err) => {
            res.redirect("/");
          });
        } else {
          req.flash("error", "Invalid email or password");
          return res.redirect("/login");
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
        req.flash("error", "The user already exists!!!");
        return res.redirect("/signup");
      } else {
        bcrypt.hash(password, 12).then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] },
          });
          return user
            .save()
            .then((result) => {
              res.redirect("/login");
              return transporter.sendMail({
                to: email,
                from: "taghipourali19@hotmail.com",
                subject: "Sign up succeeded!!!",
                html: "<h1>You have successfully signed up.</h1>",
              });
            })
            .catch((err) => {
              console.log(err);
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

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/resetPassword");
    }
    const resetToken = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "There isn't such an user!!!");
          return res.redirect("/resetPassword");
        }
        user.resetToken = resetToken;
        user.tokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: email,
          from: "taghipourali19@hotmail.com",
          subject: "Reset Password",
          html: `<p>You have requested a new password</p>
              <p>Please click on this <a href="http://localhost:5000/resetPassword/${resetToken}">link</a>`,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const resetToken = req.body.resetToken;

  User.findOne({
    _id: userId,
    resetToken: resetToken,
    tokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      bcrypt
        .hash(newPassword, 12)
        .then((hashPassword) => {
          user.password = hashPassword;
          user.resetToken = undefined;
          user.tokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
