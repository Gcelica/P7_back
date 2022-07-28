const express = require("express");
const router = express.Router();

//middleware pour l'authentification
const auth = require("../middleware/auth");
//middleware pour la gestion des images
const multer = require("../middleware/multer-config");

const postCtrl = require("../controllers/posts");

router.post("/", multer, postCtrl.createPost);
router.put("/:id", multer, postCtrl.modifyPost);
router.delete("/:id", postCtrl.deletePost);
router.get("/:id", postCtrl.getOnePost);
router.get("/profile/:username", postCtrl.getAllPosts);
router.put("/:id/like", multer, postCtrl.likeDislike);
router.get("/timeline/:userId", postCtrl.timelinePost);

module.exports = router;
