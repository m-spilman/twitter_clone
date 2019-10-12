const express = require("express");
const sessions = require('express-session')
const app = express();
const port = 1313;
const dbConfigs = require("./knexfile.js");
const db = require("knex")(dbConfigs.development);
const fs = require("fs");
const mustache = require("mustache");
const bodyParser = require("body-parser");
const tweetsTemplate = fs.readFileSync("./templates/tweets.mustache", "utf8");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded());
app.use(sessions({secret:'0lTedZkHF6bFazUOldM'}))



app.listen(port, function() {
  console.log("Listening on port " + port + " 👍");
});


/*  PASSPORT SETUP  */

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(username, cb) {
    cb(null, {username: username});
});

const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy((username, password, done) => {
    // check to see if the username exists
    db("users")
      .where({ username })
      .first()

      .then(user => {
        if (!user) return done(null, false);
        if (user.password != password) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      })

      .catch(err => {
        return done(err);
      });
  })
);
app.get("/", (req, res) =>
  res.sendFile("/index.html", { root: __dirname })
);
app.get("/error", (req, res) => res.send("error logging in"));

app.post(
  "/",
  passport.authenticate("local", { failureRedirect: "/error" }),
  function(req, res) {
    res.redirect('/user/'+req.user.username);
  }
)
app.get('/user/:username', function(req, res){
  // console.log('req.user from get ' , req.user)

getUserTweets(req.params.username).then(function(tweets){
  // console.log('data is here ' , {tweets})
  res.send(mustache.render(tweetsTemplate, {tweets: tweets}))
})
}  )

//-------------SQL----------------
function getUserTweets(username){
  return db('tweets').where('username', username);
}

//--------------RENDERING-----------
// function renderOneTweet(tweet){
//  return `<li>${tweet.tweet}</li>`
// }
// function renderAllTweets(tweets){
//  return '<ul>' + tweets.map(renderOneTweet).join('') + '</ul>'
//  }

