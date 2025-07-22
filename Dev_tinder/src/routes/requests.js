const express= require("express");
const requestRouter = express.Router();
const User = require('../models/user');
const userAuth = require('../middlewares/auth');
const ConnectionRequest = require("../models/connectionRequests");

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatuses = ["interested", "ignore"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).send("Invalid status. Allowed statuses are: " + allowedStatuses.join(", "));
        }
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });
        if (existingRequest) {
            return res.status(400).send("Connection request already exists between these users");
        }
        const requestData = {
            fromUserId,
            toUserId,
            status
        };
        const request = new ConnectionRequest(requestData);
        const data = await request.save();
        res.json({
            message: "Connection request sent successfully",
            data
        });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
     try{
         const loggedInuser= req.user;
          const allowedStatuses = ["accepted", "rejected "];
         const status = req.params.status;
         if (!allowedStatuses.includes(status)) {
             return res.status(400).send("Invalid status. Allowed statuses are: " + allowedStatuses.join(", "));
         }
         const requestId = req.params.requestId;
         const request=await ConnectionRequest.findOne({_id: requestId, toUserId: loggedInuser._id, status: "interested"});
         if (!request) {
             return res.status(404).send("Connection request not found or already processed");
         }
         request.status = status;
         const data= await request.save();
         res.json({data});
     }catch(err){
        res.status(400).send("Error: " + err.message);
     }
});
module.exports = requestRouter;
