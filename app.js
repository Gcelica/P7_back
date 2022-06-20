const express = require("express");

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

//import des routes
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

const path = require("path"); //accès au chemin des fichiers

require("dotenv").config();

mongoose
  .connect(process.env.MONGO_PASS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true,
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
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

module.exports = app;
/*app.listen(5500, () => {
  console.log("connexion serveur !");
});*/
