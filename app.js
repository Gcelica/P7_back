const express = require("express");

const mongoose = require("mongoose");
const helmet = require("helmet"); //securise en-têtes HTTP
const morgan = require("morgan"); //journal de requete HTTP

require("dotenv").config();
//import des routes
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");

const path = require("path"); //accès au chemin des fichiers

//connexion base de données MongoDB
mongoose
  .connect(process.env.MONGO_PASS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion MongoDB!"))
  .catch((err) => console.log(err));

//création de l'application express
const app = express();

// recupere les requetes avec un content-type/json
app.use(express.json());

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);

module.exports = app;
/*app.listen(5500, () => {
  console.log("connexion serveur !");
});*/
