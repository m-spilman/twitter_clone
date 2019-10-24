const express = require("express");
const jwt = require("jsonwebtoken");
const sessions = require("express-session");
const app = express();
const port = 1313;
const dbConfigs = require("./knexfile.js");
const db = require("knex")(dbConfigs.development);
const fs = require("fs");
const mustache = require("mustache");
const bodyParser = require("body-parser");
const tweetsTemplate = fs.readFileSync("./templates/tweets.mustache", "utf8");
const userHomeTemplate = fs.readFileSync(
  "./templates/userHome.mustache",
  "utf8"
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded());
app.use(sessions({ secret: "0lTedZkHF6bFazUOldM" }));

app.listen(port, function() {
  console.log("Listening on port " + port + " 👍");
});

//------PASSPORT SETUP----------------------------------------------------
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(username, cb) {
  cb(null, { username: username });
});

const LocalStrategy = require("passport-local").Strategy;
passport.use(
  new LocalStrategy((username, password, done) => {
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

//--------logout test------------------------------------------------
app.get("/logout", (req, res) => {
  req.logout();
  req.session.success = null;
  res.redirect("/");
});
//-------------GETS---------------------------------------------------
app.get("/", (req, res) => res.sendFile("/index.html", { root: __dirname }));

app.get("/error", (req, res) => res.send("error logging in"));

app.get("/user/:username", function(req, res) {
  getUserTweets(req.params.username).then(function(tweets) {
    res.send(mustache.render(tweetsTemplate, { tweets: tweets }));
  });
});

app.get("/user/:username/home", loggedIn, function(req, res) {
  var tweetsObject = [];
  getTweetsFromPeepsIFollow(req.params.username)
    .then(function() {
      for (let i = 0; i < usersTweets.length; i++) {
        usersTweets[i].map(function(objects) {
          objects.location = "/user/" + objects.username;
          tweetsObject.push(objects);
        });
      }
      res.send(mustache.render(userHomeTemplate, { tweets: tweetsObject }));
    })
    .then(function() {
      usersTweets = [];
    });
});
app.get("/data", function(req, res) {
  searchUsers(req.query.query).then(function(results) {
    res.send(results);
  });
});

app.get('/userHome', function(req,res){
  if (req.user) {
  username = req.user.username
  res.redirect('/user/'+username+'/home')  
  }
  else {
    return res.redirect('/')}

})

//----------POTS--------------------------------------------------------
app.post(
  "/",
  passport.authenticate("local", { failureRedirect: "/error" }),
  function(req, res) {
    res.redirect("/user/" + req.user.username + "/home");
  }
);

app.post("/login", function(username, res, req) {
  newUser = username.body.username;
  newPassword = username.body.password;
  db("users")
    .where("username", newUser)
    .then(function(user) {
      if (user.length === 0) {
        addUser(newUser, newPassword).then(function() {
          res.redirect("/user/admin");
        });
      }
    });
});

app.post("/user/:username", function(req, res) {
  let page = req.params.username;
  if (req.user) {
    let username = req.user.username;
    let tweet = req.body.tweet;
    let toWhom = req.body.toWho;
    createTweet(username, tweet, toWhom).then(function() {
      res.redirect("/user/" + username);
    });
  } else {
    res.redirect("/user/" + page);
  }
})
app.post("/user/:username/home", function(req, res) {
  let page = req.params.username;
  if (req.user) {
    let username = req.user.username;
    let tweet = req.body.tweet;
    let toWhom = req.body.toWho;
    createTweet(username, tweet, toWhom).then(function() {
      res.redirect("/user/" + username);
    });
  } else {
    res.redirect("/user/" + page);
  }
})


app.delete("/unfollow", function(req, res) {
  if(req.user){
  currentUser = req.user.username;
  pageUserIsOn = req.body.page.substr(6);
  removeUserFromFollowingList(currentUser, pageUserIsOn).then(function() {
    res.redirect(303, "/user/" + currentUser);
  })
}
else{res.redirect(req.body.page)}
});

app.post("/follow/", function(req, res) {
  if(req.user){
  currentUser = req.user.username;
  pageUserIsOn = req.body.page.substr(6);
  updateFollowingAdd(currentUser, pageUserIsOn).then(function() {
    res.redirect("/user/" + currentUser + "/home");
  })
}
else{res.redirect(req.body.page)}
});
//-------------SQL------------------------------------------------------------
function addUser(username, password) {
  return db("users").insert({ username: username, password: password });
}

async function getUserTweets(username) {
  return db("tweets").where("username", username);
}

function getFollowing(user) {
  return db
    .select("following")
    .from("users")
    .where("username", user);
}

function createTweet(username, tweet, toWhom) {
  return db("tweets").insert({
    tweet: tweet,
    username: username,
    tweet_to: toWhom
  });
}
function searchUsers(query) {
  firstChar = "%";
  lastChar = "%";
  string = firstChar.concat(query, lastChar);

  return db("users")
    .where("username", "ilike", string)
    .select("username");
}

async function updateFollowingAdd(user, following) {
  var whoFollowingSplit = [];
  let followingList = await getFollowing(user);
  if (followingList[0].following !== null) {
    whoFollowingSplit = followingList[0].following.split(",");
    var found = whoFollowingSplit.indexOf(following);
    if (found !== -1) {
      return;
    }
    let followingCSV = followingList[0].following.concat("," + following);
    return db("users")
      .where({ username: user })
      .update({ following: followingCSV });
  } else {
    return db("users")
      .where({ username: user })
      .update({ following: following });
  }
}
async function updateFollowingRemove(user, following) {
  return db("users")
    .where({ username: user })
    .update({ following: following });
}

//PETTY SURE THIS IS WORTHLESS
// function getTweetsFromFollowing (user){
//   return db.column('tweet').from('tweets').innerJoin('users', 'tweets.username', '=', 'users.username').where('tweets.username',(db.select('following').from('users').where('username', user)))
// }

//-----------FUNCTIONS------------------

var whoFollowingSplit = [];
var tweets = [];
var usersTweets = [];
async function getTweetsFromPeepsIFollow(user) {
  let following = await getFollowing(user);
  if (following[0].following === null) {
    return;
  }
  whoFollowingSplit = following[0].following.split(",");
  for (let i = 0; i < whoFollowingSplit.length; i++) {
    tweets = await getUserTweets(whoFollowingSplit[i]);
    usersTweets.push(tweets);
  }
}

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

async function removeUserFromFollowingList(user, page) {
  var whoFollowingSplit = [];
  let following = await getFollowing(user);
  whoFollowingSplit = following[0].following.split(",");
  var found = whoFollowingSplit.indexOf(page);
  if (found === -1) {
    return;
  }
  whoFollowingSplit.splice(found, 1);
  putback = whoFollowingSplit.join(",");
  updateFollowingRemove(user, putback).then(function() {
    return;
  });
}
