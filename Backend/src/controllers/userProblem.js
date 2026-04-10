const { submitVisibleCode} = require("../utils/problemUtility");
const Problem = require("../models/problem")
const User = require("../models/user");
const submission = require("../models/submission");

const createProblem = async (req, res) => {
   

    const { title, description, difficulty, tags, visibleTestcase, hiddenTestcase, startcode, referenceCode, problemCreator } = req.body;
    for (const { language, completecode } of referenceCode) {

        //const languageId = getlanguagebyId(language);
        const submission = visibleTestcase?.map((result) => ({
            language: language,
            code: completecode,
            input: result.input,
            output: result.output
            
        }));

        const result = await submitVisibleCode(submission);
        if(result!=1){
            res.send(result);

        }
 }

    const userProblem = await Problem.create({ ...req.body, problemCreator: req.result._id })
    res.status(200).send("Problem Saved Successfully");
}


const problemUpdate = async (req, res) => {

    const { id } = req.params;
    try {
        if (!id) { return res.status(404).send("ID Field is Missing") }
        const dsaproblem = await Problem.findById(id);
        if (!dsaproblem) { return res.status(404).send("Invalid Problem ID") }
        // const { title, description, difficulty, tags, visibleTestcase, hiddenTestcase, startcode, referenceCode, problemCreator } = req.body;
        // for (const { language, completecode } of referenceCode) {

        //     const languageId = getlanguagebyId(language);

        //     const submission = visibleTestcase.map(({ input, output }) => ({
        //         source_code: completecode,
        //         language_id: languageId,
        //         stdin: input,
        //         expected_output: output
        //     }));

        //     const submitResult = await submitBatch(submission);
        //     const resultToken = submitResult.map((value) => value.token);
        //     const resultb = await submitToken(resultToken);

        //     for (const test of resultb) {
        //         if (test.status_id != 3) {
        //             return res.status(400).send("Error Occured");
        //         }
        //     }
        // }
         const { title, description, difficulty, tags, visibleTestcase, hiddenTestcase, startcode, referenceCode, problemCreator } = req.body;
    for (const { language, completecode } of referenceCode) {

        //const languageId = getlanguagebyId(language);
        const submission = visibleTestcase?.map((result) => ({
            language: language,
            code: completecode,
            input: result.input,
            output: result.output
            
        }));

        const result = await submitVisibleCode(submission);
        if(result!=1){
            res.send(result);

        }
 }
        



        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true })  //here new means that return the document which has updated that means newly edited.and validator means it will check validation 
        res.status(200).send("Problem Updated Successfully");

    } catch (err) {
        res.status(404).send("Error Occured :" + err);
    }


}

const problemDelete = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) { return res.status(404).send("ID is Missing") }
        const deletedProblem = await problem.findByIdAndDelete(id);
        if (!deletedProblem) { return res.status(404).send("ID is not valid") };
        res.status(200).send("Problem Deleted");
    } catch (err) {
        res.status(404).send("Error" + err);
    }
}

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) { return res.status(404).send("ID is Missing") }
        const getproblem = await Problem.findById(id).select("_id title description difficulty tags visibleTestcase startcode referenceCode");
        if (!getproblem) { return res.status(404).send("ID is invalid") };
        res.status(200).send(getproblem)
    } catch (err) {
        res.status(404).send(err);
    }
}


const getAllProblem = async (req, res) => {
    try {

        const getProblem = await Problem.find({}).select("_id title  difficulty tags "); // we can send only fileds we want by select . ALso if we want to send all except one field , then it can be done by select(" -hiddenTestCase") , means by adding minus sign
        if (getProblem.length == 0)
             { return res.status(404).send("Problem is Misssing") }; //as getprobelm will be array , as find({}) will retuen an array, so if length of array is 0 , then throow error.
        console.log(getProblem);
        res.status(200).send(getProblem)
       

    } catch (err) {
        res.status(404).send(err);
    }
}

const solvedAllProblemByUser = async(req,res)=>{
    try{
        // const count = req.result.problemSolved.length;
        // res.status(200).send(count);

        const userId = req.result._id;
        const user = await User.findById(userId).populate({
            path:"problemSolved", //if wriiten const user = await User.findById(userId).populate("probelmSolved"),then populate will give all the details of ref.
            selected:"_id title tags difficulty"  //populate uses the power of reference used in Schmema Creation, as populate will fetch the whole refernece you written in Schema and if you waant to send only selected field , then use selected
        });

        res.status(200).send(user.problemSolved);


    }catch(err){
        res.status(505).send("Server Error")
    }
}

const submittedProblem = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId =req.params.pid;
        const ans = await submission.find({userId,problemId})
        if(ans.length==0){
            res.send("NO submission");

        }

    }catch(err){
        res.send("Error" +err)
    }
}
module.exports = { createProblem, problemUpdate, problemDelete, getProblemById, getAllProblem ,solvedAllProblemByUser,submittedProblem};




// const submitResult = await submitBatch(submission);
//         const resultToken = submitResult.map((value) => value?.token);
//         const resultb = await submitToken(resultToken);

//         for (const test of resultb) {
//             if (test.status_id != 3) {
//                 return res.status(400).send("Error Occured");
//             }
//         }