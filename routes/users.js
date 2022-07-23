const express = require("express");
const userCtrl = require("../controllers/user");

const router = express.Router();

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.delete("/:id", userCtrl.deleteUser);
router.get("/", userCtrl.getAllUsers);
router.get("/:id", userCtrl.getUserInfo);
router.put("/:id/follow", userCtrl.followers);
router.put("/:id/unfollow", userCtrl.unfollowers);
router.put("/:id", userCtrl.updateUser);

module.exports = router;
