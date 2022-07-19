const express = require("express");
const router = express.Router();

//middleware pour l'authentification
const auth = require("../middleware/auth");
//middleware pour la gestion des images
const multer = require("../middleware/multer-config");

const postCtrl = require("../controllers/posts");

router.post("/", auth, multer, postCtrl.createPost);
router.put("/:id", auth, multer, postCtrl.modifyPost);
router.delete("/:id", auth, postCtrl.deletePost);
router.get("/:id", auth, postCtrl.getOnePost);
router.get("/profile/:username", auth, postCtrl.getAllPosts);
router.put("/:id/like", auth, multer, postCtrl.likeDislike);
router.get("/timeline/:userId", auth, postCtrl.timelinePost);

module.exports = router;
