require('dotenv').config(); 
const mongoose = require("mongoose");

// to encrypt password in schema -> dbs
// const encrypt = require('mongoose-encryption');
const md5 = require('md5');

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const userSchema = new mongoose.Schema({
    email: String,
    pass: String
});

const User = mongoose.model("User", userSchema); 

module.exports = User;