const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// mise à jour utilisateur
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      //mot de passe envoyé
      try {
        const salt = await bcrypt.genSalt(10); // nouveau mot de passe generé
        req.body.password = await bcrypt.hash(req.body.password, salt); //hachage et mise à jour du mot de passe dans le body
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Compte mis à jour");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("vous ne pouvez pas mettre à jour votre compte !");
  }
});

//supprimer utlisateur
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Compte supprimé");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("vous ne pouvez pas supprimer ce compte !");
  }
});

//chercher un utilisateur
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //objet avec les propriétés non utiles/ utiles
    const { password, ...other } = user._doc; //_doc contient other
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// chercher tous les utlisateurs

//suivre un utlisateur
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("vous suivez cet utilisateur");
      } else {
        res.status(403).json("vous suivez deja cet utilisateur");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("vous ne pouvez pas vous suivre");
  }
});

//ne pas suivre un utilisateur
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("vous ne suivez plus cet utlisateur");
      } else {
        res.status(403).json("vous ne suivez pas cette utlisateur");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("impossible de ne pas se suivre (no entendemos !!!)");
  }
});

module.exports = router;
