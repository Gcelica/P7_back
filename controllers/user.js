const bcrypt = require("bcrypt");

const User = require("../models/User");

//const jwt = require("jsonwebtoken");

//middlewar nouvel utilisateur

//fonction pour enregistrer les nouveaux utilisateurs et crypter le mot de passe
exports.signup = async (req, res) => {
  console.log("hola todos !");
  try {
    //creation mot de passe hashé
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //creation de nouvel utilisateur
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //sauvegarde dans la base de donées du nouvel utilisateur
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

//middleware connection

//fonction pour connecter les utlisateurs existants
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

//mise à jour utilisateur
exports.updateUser = async (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
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

//trouver utilisateurs

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
};

//trouver utilisateur
exports.getUserInfo = async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
};

//follow a user

exports.followers = async (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
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

exports.unfollowers = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("vous êtes desabonné");
      } else {
        res.status(403).json("vous ne pouvez pas vous abonner à ce compte");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
};

//supprimer un compte utlisateur

exports.deleteUser = async (req, res) => {
  User.findOne({
    _id: req.body.userId,
  });
  if (req.body.userId === req.params.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("le compte à été supprimé");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Vous ne pouvez pas supprimer ce compte!");
  }
};
