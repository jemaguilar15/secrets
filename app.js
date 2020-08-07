//jshint esversion:6
require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const User = require('./model/db');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const MemoryStore = require('memorystore')(session)
const passport = require('passport');

const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// 1st app.use
app.use(session({   
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: "Ourlittlesecret.",
    resave: false,
    saveUninitialized: true
}));

// 2nd app.use
app.use(passport.initialize());
app.use(passport.session());
 
// 4th app.use
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    // callbackURL: "http://localhost:3000/auth/google/secrets",
    callbackURL: "https://fierce-plateau-97384.herokuapp.com/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    // callbackURL: "http://localhost:3000/auth/facebook/secrets"
    callbackURL: "https://fierce-plateau-97384.herokuapp.com/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);
    User.findOrCreate({ facebookId: profile.id }, function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

app.use(express.static('public'));

app.get("/", (req, res) => {
    
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login'}),
    (req, res) => {

        // Successfully authentication, redirect time
        res.redirect("/secrets");
    }
);

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/secrets", (req, res) => {

    // if(req.isAuthenticated()) {
    //     res.render("secrets");
    // } else {
    //     res.redirect("/login");
    // }
    User.find({ "secret": {$ne: null} }, (err, foundUsers) => {
        if(err) {
            console.log(err);
            
        } else {
            if(foundUsers) {
                res.render("secrets", { usersWithSecrets: foundUsers });
            }
        }
    });
});

app.get("/submit", (req, res) => {
    if(req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});

//|------------------
//| POST ROUTES
//|------------------
app.post("/register", (req, res) => {
    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    //     const newUser = new User({
    //         email: req.body.username,
    //         pass: hash
    //     });

    //     newUser.save((err) => {
    //         if(!err) {
    //             console.log("Successfully saved.");
    //             res.render("secrets")
    //         } else {
    //             console.log(err);
    //         }
    //     });
    // });
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if(err) {
            
            res.redirect("/register");
            
        } else {
            // passport.authenticate("local")(req, res, () => {
            passport.authenticate("heroku")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req, res) => {
    // const username = req.body.username;
    // const pass = req.body.password;
    
    // User.findOne({ email: username }, (err, foundUser) => {
    //     if(err) {
    //         console.log(err);
            
    //     } else {
    //         console.log(foundUser);
    //         // Load hash from your password DB.
    //         bcrypt.compare(pass, foundUser.pass, function(err, result) {
    //             if(result == true) {
    //                 console.log("Login successfully");
    //                 res.render("secrets");
    //             } else {
    //                 console.log(foundUser.pass);
    //             }
    //         });
    //     }
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err) {
            console.log(err);
            
        } else {
            // passport.authenticate('local')(req, res, () => {
            passport.authenticate("heroku")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/submit", (req, res) => {
    const submittedSecret = req.body.secret;

    User.findById(req.user.id , (err, foundUser) => {
        if(err) {
            console.log(err);
            
        } else {
            if(foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(() => {
                    res.redirect("/secrets");
                });
            }
            
        }
    });
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server are running at port 3000...");
      
});
