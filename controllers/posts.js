const fs = require("fs");
const Post = require("../models/Post");
const User = require("../models/User");

//creer un post
exports.createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

//modification d'un post
exports.modifyPost = async (req, res, next) => {
  try {
    const post = Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("post mis à jour !");
    } else {
      res.status(403).json("operation impossible !");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// Récupération d'un post
exports.getOnePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id }) //comparaison meme id dans la requete que dans la base de données
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(404).json({ error }));
};

// Récupération de tous les posts
exports.getAllPosts = (req, res, next) => {
  Post.find() //liste de tous les posts de la base de données
    .then((post) => res.status(200).json(post))
    .catch((error) => res.status(400).json({ error }));
};

//supprimer un post
exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id }) //recherche de l'url image à supprimer
    .then((post) => {
      //verification id utlisateur et id post avant de supprimer
      if (req.body.userId !== post.userId) {
        res.status(403).json({ erro: "pas les bons droits" });
      }
      const filename = post.imageUrl.split("/images/")[1];
      //suppression avec "unlink" et le nom du fichier
      fs.unlink(`images/${filename}`, () => {
        //document correspondant de la base de données supprimé
        Post.deleteOne({ _id: req.params.id })

          .then(() => res.status(200).json({ message: "Post supprimé" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error = res.status(500).json({ error })));
};

// like et dislike
exports.likeDislike = (req, res) => {
  if (req.body.like == 1) {
    Post.updateOne(
      { _id: req.params.id },
      {
        $push: { usersLiked: req.body.userId },
        $inc: { likes: req.body.like },
      }
    )

      .then(() => res.status(200).json({ message: "J'aime !" }))
      .catch((error) => res.status(400).json({ error }));
  } else if (req.body.like == -1) {
    Post.updateOne(
      { _id: req.params.id },
      {
        $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId },
      }
    )
      .then((post) => res.status(200).json({ message: "J'aime pas !" }))
      .catch((error) => res.status(400).json({ error }));
  } else {
    Post.findOne({ _id: req.params.id })
      .then((post) => {
        if (post.usersLiked.includes(req.body.userId)) {
          post
            .updateOne(
              { _id: req.params.id },
              { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
            )
            .then((post) => {
              res.status(200).json({ message: "Je retire mon j'aime" });
            })
            .catch((error) => res.status(400).json({ error }));
        } else if (post.usersDisliked.includes(req.body.userId)) {
          Post.updateOne(
            { _id: req.params.id },
            {
              $pull: { usersDisliked: req.body.userId },
              $inc: { dislikes: -1 },
            }
          )
            .then((post) => {
              res.status(200).json({ message: "Je retire mon j'aime pas !" });
            })
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(400).json({ error }));
  }
};

// timeline posts

exports.timelinePost = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
};
