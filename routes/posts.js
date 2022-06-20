const router = require("express").Router();
const Post = require("../models/Post");

//creer un post

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//supprimer un post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("ce commentaire a été supprimé");
    } else {
      res.status(403).json("vous pouvez supprimer que vos commentaires");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// like et dislike

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Ce commentaire à été liké !");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Ce commentaire à été disliké !");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
