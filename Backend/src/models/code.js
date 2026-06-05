const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const codeSchema = new Schema({
    userId:{
       type:Schema.Types.ObjectId,
       ref:"user",
       required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:"problem",
        required:true
    },
    code:{
        type:String
    },
    language:{
        type:String,
        enum:["python","c++","java"],
    }
});

const CodeSave = mongoose.model("codesave",codeSchema);
module.exports = CodeSave;