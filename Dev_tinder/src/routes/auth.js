const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const validateSignup= require('../utils/validation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userAuth = require('../middlewares/auth');


authRouter.post("/signup", async(req, res) => {
 try{
     validateSignup(req);
     const {firstName,lastName,email,password}=req.body;
     const passwordHash=await bcrypt.hash(password, 10);
     const user=new User({
         firstName,lastName,email,password:passwordHash
     });
     const token = await user.getJWT();
     res.cookie("jwt",token);
     await user.save();
   res.send(user);
   }catch(err){
     res.status(500).send("Error adding user: " + err.message);
   }
});

authRouter.post("/login",async(req,res)=>{
   const {email, password} = req.body;
   try{
    const user=await User.findOne({email});
    if(!user){
        throw new Error("Invalid credentials");
    }
    const isvalid=await user.isPasswordvalid(password);
    if(isvalid){
        const token = await user.getJWT();
        res.cookie("jwt",token);
        const { firstName, lastName, gender, age, skills, about, photoURL } = user;
        res.send({ firstName, lastName, gender, age, skills, about, photoURL }); 
    }else{
        throw new Error("Invalid credentials");
    }
   }catch(err){
    res.status(500).send("Error logging in: " + err.message);
   }
});

authRouter.post("/logout",(req,res)=>{
    res.cookie("jwt",null,{expiresIn:new Date(Date.now())});
    res.send("logged out successfully");
});

authRouter.patch("/changepassword",userAuth,async(req,res)=>{
    try{
        const {oldPassword, newPassword} = req.body;
        const user = req.user;
        if(!user){
            throw new Error("User not found");
        }
        const isvalid=await user.isPasswordvalid(oldPassword);
        if(!isvalid){
            throw new Error("Invalid old password");
        }
        const passwordHash=await bcrypt.hash(newPassword, 10);
        user.password=passwordHash;
        await user.save();
        res.send("Password changed successfully");
    }catch(err){
        res.status(500).send("Error changing password: " + err.message);
    }
});
module.exports = authRouter;