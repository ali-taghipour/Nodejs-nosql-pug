const User = require("../models/user");

exports.getLogin = (req,res,next) => {
    const isLoggedin = req.session.isLoggedin;
    res.render("auth/login",{ pageTitle: "Login",path:"/login",isAuthenticated: isLoggedin});
};

exports.postLogin = (req,res,next) => {
    User.findById("5fa3143fa1fa6c1d1dca6f24").then(user => {
        req.session.user = user;
        req.session.isLoggedin = true;
        // .save method guarantee that session saved in database before redirecting
        req.session.save(err => {
            res.redirect("/");
        })
    }).catch(err => console.log(err));
};

exports.postLogout = (req,res,next) => {
    req.session.destroy((err) => {
        res.redirect("/");
    });
 };
 
