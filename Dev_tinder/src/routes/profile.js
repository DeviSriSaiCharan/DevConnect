const express = require("express");
const profileRouter = express.Router();
const User = require('../models/user');
const userAuth = require('../middlewares/auth');
const isvalid = require('../utils/validation');

profileRouter.get("/", userAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).send("please login");
        }
        res.send(user);
    } catch (err) {
        res.status(400).send("Error : " + err.message);
    }
});

profileRouter.patch("/edit",userAuth,async(req,res)=>{
     try{
        if(!isvalid){
        throw new Error("Invalid user data");
        }
        const loggesdInUser = req.user;
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined) {
                loggesdInUser[key] = req.body[key];
            }
        });
        await loggesdInUser.save();
       res.send({
  _id:loggesdInUser._id,
  firstName: loggesdInUser.firstName,
  lastName: loggesdInUser.lastName,
  gender: loggesdInUser.gender,
  age: loggesdInUser.age,
  skills: loggesdInUser.skills,
  about: loggesdInUser.about,
  photoURL: loggesdInUser.photoURL
});
     }catch(err){
        res.status(400).send("Error: " + err.message);
     }
}); 


module.exports = profileRouter;