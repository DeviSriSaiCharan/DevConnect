const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const userAuth = require("../middlewares/auth");
const mongoose = require("mongoose");
const User = require("../models/user");

router.post("/create-group", async (req, res) => {
  const { name, participants } = req.body;
  try {
    const existinggroup=await Group.findOne({participants: {$all: participants}});
    if (existinggroup) {
      return res.status(400).json({ error: "Group with these participants already exists." });
    }
    const group = new Group({ name, participants });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Failed to create group" });
  }
});

router.get("/groups", userAuth, async (req, res) => {
  try{
    const groups = await Group.find({ participants: req.user._id }).populate("participants", "firstName lastName");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Group not found" });
  }
});



router.get("/groups/:groupId", userAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id; 
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }
    const group = await Group.findOne({ _id: groupId })
      .populate("participants", "firstName lastName")
      .populate("messages.senderId", "firstName lastName");
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const isMember = group.participants.some((p) =>
      p._id.equals(userId)
    );
    if (!isMember) {
      return res.status(403).json({ error: "Only group members can access the group" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/groups/:groupId/add-member/:userId", userAuth, async(req,res)=>{
    try{
      const {groupId}=req.params;
      const {userId}=req.params;
    const group=await Group.findById(groupId);
    if(!group){
      throw new Error("Group not found");
    }
    const user=await User.findById(userId);
    if(!user){
      throw new Error("User not found");
    }
    if(group.participants.includes(userId)){
      throw new Error("User already in group");
    }
    group.participants.push(userId);
    await group.save();
    const group1 = await Group.findOne({ _id: groupId })
    .populate("participants", "firstName lastName")
    .populate("messages.senderId", "firstName lastName");
    res.json(group1);
    }catch(err){
       res.status(500).json({error:err.message});
    }
});

router.patch("/groups/:groupId/delete-member/:userId", userAuth, async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.params;
  try {
    const group = await Group.findById(groupId);
    if (!group) throw new Error("Group not found");
    const user=await User.findById(userId);
    if(!user){
      throw new Error("User not found");
    }
    group.participants = group.participants.filter(
      (id) => id.toString() !== userId
    );
    await group.save();
    const group1 = await Group.findOne({ _id: groupId })
    .populate("participants", "firstName lastName")
    .populate("messages.senderId", "firstName lastName");
    res.json(group1);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
});
module.exports = router;