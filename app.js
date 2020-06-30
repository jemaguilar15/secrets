//jshint esversion:6
require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const User = require('./model/db');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));

app.get("/", (req, res) => {
    
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

//|------------------
//| POST ROUTES
//|------------------
app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        pass: req.body.password
    });

    newUser.save((err) => {
        if(!err) {
            console.log("Successfully saved.");
            res.render("secrets")
        } else {
            console.log(err);
        }
    });
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
        email: username
    }, (err, foundUser) => {
        if(err) {
            console.log(err);
            
        } else {
            if(foundUser) {
                if(foundUser.pass === password) {
                    res.render("secrets");
                } else {
                    console.log("Incorrect credentials.");
                    
                }
            } 
        }
    });
});

app.listen(3000, () => {
    console.log("Server are running at port 3000...");
      
});
