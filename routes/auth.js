const express = require("express");

const router = express.Router();

const User = require("../models/user");

const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric().trim(),
  ],
  authController.postLogin
);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter the email in valid format")
      .custom((value, { req }) => {
        // if (value === "test@gmail.com") {
        //   throw new Error("This email is forbidden");
        // }
        // return true;

        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "This email alredy exists. Please pick another one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter the password in alphabic and number and at least must be 5 character"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("repassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords aren't equal");
      }
      return true;
    })
    .trim(),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/resetPassword", authController.getResetPassword);

router.post("/resetPassword", authController.postResetPassword);

router.get("/resetPassword/:token", authController.getNewPassword);

router.post("/newPassword", authController.postNewPassword);

module.exports = router;
