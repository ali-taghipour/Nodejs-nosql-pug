exports.getLogin = (req,res,next) => {
    const isLoggedin = req.get("Cookie").split("=")[1] === "true";
    res.render("auth/login",{ pageTitle: "Login",path:"/login",isAuthenticated: isLoggedin});
};

exports.postLogin = (req,res,next) => {
   // expires format res.setHeader("set-Cookie","isLoggedin=true; Expires=Sat, 07 Nov 2020 00:24:09 GMT or Max-Age=10// it alternative way for expiration in 10 seconds"); 
   // we use Secure and it is for Https to encrypt data in request
   res.setHeader("set-Cookie","isLoggedin=true; HttpOnly")
   res.redirect("/");
};
