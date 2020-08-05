require('dotenv').config(); 
const mongoose = require("mongoose");

// to encrypt password in schema -> dbs
// const encrypt = require('mongoose-encryption');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

// mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
// Remove the deprecation warning
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    pass: String,
    googleId: String,
    facebookId: String,
    secret: String
});

// 3rd app.use
userSchema.plugin(passportLocalMongoose);

// For Google OAuth2
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

module.exports = User;