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
router.get("/", auth, postCtrl.getAllPosts);
router.post("/:id/like", auth, multer, postCtrl.likeDislike);

module.exports = router;
