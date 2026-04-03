const mongoose = require("mongoose");
const {Schema}= mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required : true,
        minLength : 3
        

    },
    lastName :{
        type:String
    },
    age : {
        type:Number
    },
    emailId : {
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase: true,
        immutable : true

    },
    password : {
        type:String,
        required:true
    }
    ,
    role : {
        type : String,
        enum : ["user","admin"],
        default : "user"
    },
    problemSolved :{
        type : [{
            type:Schema.Types.ObjectId,
            ref:"problem"
        }],
        

    }
},{timestamps:true})

//this is the post operation that will be executed when findByIdAndDelete will take place.
userSchema.post("findOneAndDelete",async function (doc) { //this doc means it contains the profile or all the info about deleted user. As this deleted info is returned by findByIdAndDelete
    if(doc){
        await mongoose.model("submission").deleteMany({UserId:doc._id});
    }
    
})

const User = mongoose.model("user",userSchema)
module.exports = User;