const express = require("express");
const userCtrl = require("../controllers/user");

const router = express.Router();

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.delete("/deleteUser", userCtrl.deleteUser);
router.put("/followers", userCtrl.followers);
router.put("updateUser", userCtrl.updateUser);

module.exports = router;
