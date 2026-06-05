const CodeSave = require("../models/code");
const AutoSave = require("../models/code");

const autoSave = async(req,res)=>{
    
    try{
     const problemId = req.params.problemId;
     const userId = req.result._id;
    // const problem = await Problem.findById(problemId);
     const {code,language} = req.body;
    await AutoSave.findOneAndUpdate(
  {
    userId,
    problemId
  },
  {
    code,
    language
  },
  {
    upsert: true,
    new: true
  }
);
     res.status(201).json({
        sucess:true,
        message:"code Saved"
     });
    }catch(err){
        res.status(400).send("Error in saving code :",err);
    }


}

const getCode = async(req,res)=>{
    
    try{
     const {problemId} = req.params;
     const userId = req.result._id;

     const autoSavedCode = await CodeSave.findOne({problemId,userId});
     res.status(200).send(autoSavedCode);
    }catch(err){
        res.status(401).send("Error",err);
    }
     

}

module.exports={autoSave,getCode};