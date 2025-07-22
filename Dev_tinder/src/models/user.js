const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
          type: String,
          lowercase: true,
          trim: true,
          required: true,
          unique: true,
          validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address");
            }
          }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol.");
            }     
        }
    },
    age:{
        type: Number,
        min:18,
    },
    gender:{
        type: String,
    },
    photoURL:{
        type: String,
        default:"https://tse2.mm.bing.net/th?id=OIP.IQqAakFVSW2T6n9Kibpe2AAAAA&pid=Api&P=0&h=180",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid URL for photo");
            }
        }
    },
    about:{
        type: String,
        default: "No description provided"
    },
    skills:{
        type: [String],
    },
},
{
    timestamps: true
}
);

userSchema.methods.getJWT=async function(){
     const user = this;
     const token=await jwt.sign({_id: user._id},process.env.JWT_SECRET,{expiresIn: "1d"});
        return token;
};

userSchema.methods.isPasswordvalid=async function(password){
    const user = this;
    const isvalid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isvalid);
    return isvalid;
};
module.exports = mongoose.model('User', userSchema);