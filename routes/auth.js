const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

router.get("/login",authController.getLogin);

router.post("/login",authController.postLogin);

router.get("/signup",authController.getSignup);

router.post("/signup",authController.postSignup);

router.post("/logout",authController.postLogout);

router.get("/resetPassword",authController.getResetPassword);

router.post("/resetPassword",authController.postResetPassword);

router.get("/resetPassword/:token",authController.getNewPassword);

router.post("/newPassword",authController.postNewPassword);

module.exports = router;