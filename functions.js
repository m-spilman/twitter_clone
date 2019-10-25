const dbConfigs = require("./knexfile.js");
const db = require("knex")(dbConfigs.development);

function loggedIn(req, res, next) {
    if (req.user) {
      if (req.user.username === req.params.username) {
        next();
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  }



// function addUser(username, password) {
//     return db("users").insert({ username: username, password: password });
//   }
module.exports = {loggedIn}