const express= require("express");
const userRouter = express.Router();
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require("../models/connectionRequests");
const User = require('../models/user');
const USER_INFO="firstName , lastName , gender , age , skills , about , photoURL";

userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_INFO);
    

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    req.statusCode(400).send("ERROR: " + err.message);
  }
});


userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_INFO)
      .populate("toUserId", USER_INFO);


    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed",userAuth,async(req,res)=>{
     try{
          const loggedInuser=req.user;
          const connectionRequests=await ConnectionRequest.find({$or:[{fromUserId:loggedInuser._id},{toUserId:loggedInuser._id}]})
          .select("fromUserId toUserId ");
          const hideUserFromFeed =new Set();
          connectionRequests.forEach((req)=>{
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
          });
          const feed=await User.find({$and:[
            {_id:{$nin:Array.from(hideUserFromFeed)}},{_id:{$ne:loggedInuser._id}}],
          })
            .select(USER_INFO);
            res.json({ data : feed });
     }catch(err){
        res.status(400).send("Error :"+err.message);
     }
});
module.exports=userRouter;