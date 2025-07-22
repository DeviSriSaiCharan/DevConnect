const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User' 
    },
    toUserId: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    status:{
        type:String,
         enum: ["ignore",  "accepted", "rejected","interested"],
        required:true,
        message: '{VALUE} is not a valid status'
    }
}
,{ timestamps:true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function(next) {
    if (this.fromUserId.equals(this.toUserId)) {
        return next(new Error("You cannot send a connection request to yourself"));
    }
    next();
});
module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
