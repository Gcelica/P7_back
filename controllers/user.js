const bcrypt = require("bcrypt");

const User = require("../models/User");

const jwt = require("jsonwebtoken");

//middlewar nouvel utilisateur

//fonction pour enregistrer les nouveaux utilisateurs et crypter le mot de passe
exports.signup = (req, res, next) => {
  console.log("hola todos");
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
      });

      //enregistrement de l'utlisateur dans la base de donnée
      user
        .save()
        .then(() => res.status(201).json({ message: "utilisateur crée" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

//middleware connection

//fonction pour connecter les utlisateurs existants
exports.login = (req, res, next) => {
  console.log(req.body);
  console.log("coucou");
  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: "Utilisateur non trouvé !",
        });
      }
      //bcrypt compare les hashs(issue du meme string d'origine)
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({
              error: "Mot de passe incorrect !",
            });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_JWT, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) =>
          res.status(500).json({
            error,
          })
        );
    })
    .catch((error) =>
      res.status(500).json({
        error,
      })
    );
};

//mise à jour utilisateur
exports.updateUser = (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = bcrypt.genSalt(10);
        req.body.password = bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("compte mis à jour");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("operation impossible");
  }
};

//trouver un utilisateur

exports.getUser = (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? User.findById(userId)
      : User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
};

//follow a user

exports.followers = (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId !== req.params.id) {
    try {
      const user = User.findById(req.params.id);
      const currentUser = User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        user.updateOne({ $push: { followers: req.body.userId } });
        currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("vous etes abonné");
      } else {
        res.status(403).json("vous êtes deja abonné à cet utilisateur");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
};

//unfollow a user

exports.unfollowers = (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = User.findById(req.params.id);
      const currentUser = User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        user.updateOne({ $pull: { followers: req.body.userId } });
        currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
};

//supprimer un compte utlisateur

exports.deleteUser = (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId === req.params.id) {
    try {
      User.findByIdAndDelete(req.params.id);
      res.status(200).json("le compte à été supprimé");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Vous ne pouvez pas supprimer ce compte!");
  }
};
