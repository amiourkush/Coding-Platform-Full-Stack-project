const problem = require("../models/problem");
const submission = require("../models/submission");
const Problem = require("../models/problem")
const {getlanguagebyId,submitBatch,submitToken} = require("../utils/problemUtility");

const submitCode =async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code,language} = req.body;

        if(!(code||userId||problemId||language)){
            res.status(404).send("Fields are Missing"); 

        }

        //fetch the problem from db
        const problem = await Problem.findById(problemId);
        

        //storing sumbitted code, before Sending to judge0
        const submittedCode = await submission.create({
            userId,
            problemId,
            code,
            language,
            status : "pending",
            testCasesTotal : problem.hiddenTestCase.length
        })

        //now sending code to judge0
         const languageId = getlanguagebyId(language);

        const submission = problem.hiddenTestCase.map(({ input, output }) => ({
            source_code:code,
            language_id: languageId,
            stdin: input,
            expected_output: output
        }));

        const submitResult = await submitBatch(submission);
        const resultToken = submitResult.map((value) => value.token);
        const resultb = await submitToken(resultToken);
        
        let runtime =0;
        let memory=0;
        let status="accepted";
        let errorMessage = null;
        let testCasesPassed=0;
        for(const test of resultb){
            if(test.status_id==3){
                testCasesPassed++;
                runtime+=parseFloat(test.time);
                memory=Math.max(memory,test.memory);


            }
            else{
                if(test.status_id==4){
                    status="error";
                    errorMessage=test.stderr;
                }else{
                    status="wrong";
                    errorMessage=test.stderr;
                }
            }
        }

        submittedCode.runtime=runtime;
        submittedCode.memory=memory;
        submittedCode.status=status;
        submittedCode.errorMessage=errorMessage;
        submittedCode.testCasesPassed=testCasesPassed;
        
        //req.result means userSchmea because when authentication(tokenMw) result stored the refernce of document i.e userSchema(indirectly)
        if(!req.result.probelmSolved.includes(problemId)){
            req.result.probelmSolved.push(problemId);
            await req.result.save();
        }
        await submittedCode.save();
        res.status(400).send(submittedCode);

    }catch(err){

        res.status(404).send("Intenal Server Error"+err);
    }
}

const runCode = async(req,res)=>{
    try{
        const userId = req.result._id;
        const problemId = req.params.id;

        const {code,language} = req.body;

        if(!(code||userId||problemId||language)){
            res.status(404).send("Fields are Missing"); 

        }

        //fetch the problem from db
        const problem = await Problem.findById(problemId);
        

        
        //now sending code to judge0
         const languageId = getlanguagebyId(language);

        const submission = problem.visibleTestCase.map(({ input, output }) => ({
            source_code:code,
            language_id: languageId,
            stdin: input,
            expected_output: output
        }));

        const submitResult = await submitBatch(submission);
        const resultToken = submitResult.map((value) => value.token);
        const resultb = await submitToken(resultToken);
        
       res.status(200).send(resultb);
    }catch(err){

        res.status(404).send("Intenal Server Error"+err);
    }
    
}
module.exports={submitCode,runCode};