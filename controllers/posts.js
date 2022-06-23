const fs = require("fs");
const Post = require("../models/Post");
const { post } = require("../routes/users");

//creer un post
exports.createPost = (req, res) => {
  const postObject = JSON.parse(req.body.post);

  //creation instance modele post
  const sauce = new Post({
    ...postObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  console.log(post);
  //sauvegarde dans la base de donnée
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Post enregistré !" }))
    .catch((error) => (400).JSON({ error }));
};

//modification d'un post
exports.modifyPost = (req, res, next) => {
  Post.findOne({ _id: req.params.id }) //recherche de l'url image à supprimer
    //verification id utlisateur et id post avant de modifier
    .then((post) => {
      if (req.body.userId !== post.userId) {
        res.status(403).json({ error: "pas les bons droits" });
      }
    });

  const postObject = req.file
    ? {
        //ajout d'une nouvelle image
        ...JSON.parse(req.body.post),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: "post modifié" }))
    .catch(() => res.status(400).json({ error }));
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
exports.likeDislike = (req, res, next) => {
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
