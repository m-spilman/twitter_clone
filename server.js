const express = require("express");
const sessions = require("express-session");
const app = express();
const port = 1313;
const dbConfigs = require("./knexfile.js");
const db = require("knex")(dbConfigs.development);
const fs = require("fs");
const mustache = require("mustache");
const bodyParser = require("body-parser");
const tweetsTemplate = fs.readFileSync("./templates/tweets.mustache", "utf8");
const userHomeTemplate = fs.readFileSync( "./templates/userHome.mustache","utf8");
const homepageTemplate = fs.readFileSync("./templates/homepage.mustache", "utf8");
const bcrypt = require ('bcrypt')
const salty = 10
const flash = require('express-flash-messages');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded());
app.use(sessions({ 
  secret: "0lTedZkHF6bFazUOldM",
  resave: false,
  saveUninitialized:true
}));
app.use(flash())
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
        hashed = user.password
        checkPassword(password, hashed).then(function(result){
          if (result) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch(err => {
          return done(err);
        });
        })
  })
);
//-------------GETS---------------------------------------------------
app.get('/', function (req, res){
  res.send(mustache.render(homepageTemplate, { bob: tweets }));
})
app.get("/user/:username", function(req, res) {
  getUserTweets(req.params.username).then(function(tweets) {
    console.log('tweets', tweets)


    res.send(mustache.render(tweetsTemplate, { tweets: tweets }));
  });
});

app.get("/user/:username/home", loggedIn, function(req, res) {
  var tweetsObject = [];
  var check = 1
  getTweetsFromPeepsIFollow(req.params.username)
    .then(function() {
      for (let i = 0; i < usersTweets.length; i++) {
        usersTweets[i].map(function(objects) {
          objects.location = "/user/" + objects.username;
          tweetsObject.push(objects);
        });
      }
      if(tweetsObject.length === 0){
        noFollowers = { tweet_id: '404',
                       tweet: 'Follow others to see their tweets, click here to see the admins page and add to following ',
                       username: 'admin',
                       tweet_to: req.params.username,
                       location: '/user/admin'
                }
        tweetsObject.push(noFollowers)
        check = 2
        res.send(mustache.render(userHomeTemplate, { tweets: tweetsObject}));
      }
       if(check ===1){
        res.send(mustache.render(userHomeTemplate, { tweets: tweetsObject}));
       }
      
      
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

app.get('/usertweets', function(req,res){
  if (req.user) {
  username = req.user.username
  res.redirect('/user/'+username)  
  }
  else {
    return res.redirect('/')}
})

app.get("/logout", (req, res) => {
  req.logout();
  req.session.success = null;
  res.redirect("/");
});

//----------POSTS--------------------------------------------------------
app.post(
  "/",
  passport.authenticate("local", { 
  failureRedirect: "/" ,
  failureFlash : true,
}),
  function(req, res, err) {
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
          Message = {message: 'user successfully created, please login'}
          res.send(mustache.render(homepageTemplate, {message:Message.message}));
        })
      }
      if(user.length !==0)
      {
        Message = {message: 'username already exists'}
        res.send(mustache.render(homepageTemplate, {message:Message.message}));
      }
       })
      })



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


async function addUser(username, password){
  var hash = await bcrypt.hash(password, salty)
  return db("users").insert({ username: username, password: hash })
}

async function getUserTweets(username) {
  return db("tweets").where("username", username).orderBy('ts')
}

function getFollowing(user) {
  return db
    .select("following")
    .from("users")
    .where("username", user);
}

function createTweet(username, tweet, toWhom) {
 var currentDate = new Date()
 var date = currentDate.getDate();
 var month = currentDate.getMonth();
 var year = currentDate.getFullYear();
 var hour = currentDate.getHours();
 var minutes = currentDate.getMinutes();
var dateString = date + "-" +(month + 1) + "-" + year+ "-" +hour+ "-" +minutes;
  console.log(dateString)
  return db("tweets").insert({
    tweet: tweet,
    username: username,
    tweet_to: toWhom,
    ts: dateString
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
async function checkPassword(password, hashed){
  return result = await bcrypt.compare(password, hashed)
  
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
