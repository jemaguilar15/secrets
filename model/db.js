require('dotenv').config(); 
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const userSchema = new mongoose.Schema({
    email: String,
    pass: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['pass'] });
const User = mongoose.model("User", userSchema); 

module.exports = User;