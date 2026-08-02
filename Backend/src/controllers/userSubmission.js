const problem = require("../models/problem");
const Submission = require("../models/submission");
const Problem = require("../models/problem")
const {getlanguagebyId,submitBatch,submitToken, submitHiddenCode, submitVisibleCode} = require("../utils/problemUtility");
const executionQueue = require("../queue/executionQueue");
const { default: axiosClient } = require("../../../Frontend/src/utils/axiosClient");

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!code || !userId || !problemId || !language) {
            return res.status(400).json({
                success: false,
                message: "Fields are Missing"
            });
        }

        // Fetch problem
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }

        // Create submission before sending it to worker
        const submittedCode = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.hiddenTestcase.length
        });

        // Add submission to BullMQ
        await executionQueue.add(
            "judgeSubmission",
            {
                submissionId: submittedCode._id
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000
                }
            }
        );

        return res.status(202).json({
            success: true,
            submissionId: submittedCode._id,
            status: "pending"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const runCode = async (req, res) => {
  try {
    const { testCaseArray } = req.body;

    const allVisibleResult =
      await submitVisibleCode(testCaseArray);

    res.json({
      success: true,
      results: allVisibleResult
    });

  } catch (error) {
    console.log("Error in runCode:", error);

    res.status(500).json({
      success: false,
      message: "Error occurred"
    });
  }
};



const submitHistory = async(req,res)=>{
    try{
            
       const userId = req.result._id;
       const problemId = req.params.id;

       const submitHistory = await Submission.find({userId,problemId});
       if(submitHistory.length==0){
          return res.json({
            success : false,
            message:"No History"
           })
       }
      res.status(200).json({
        success:true,
        submitHistory
      })

    }catch(err){
        res.json({
            success:false,
            message:`Error Occured: ${err}`
        })

    }
}


const checkSubmission = async(req,res)=>{
   try{
        const respond= await Submission.findById(req.params.id);
        res.status(200).send(respond);
   }catch(err){
        res.status(500).send("Error Occured",err);
   }
}





module.exports={submitCode,runCode,submitHistory,checkSubmission};




// const submitCode =async(req,res)=>{
//     try{
//         const userId = req.result._id;
//         const problemId = req.params.id;

//         const {code,language} = req.body;

//         if(!(code||userId||problemId||language)){
//             res.status(404).send("Fields are Missing"); 

//         }

//         //fetch the problem from db
//         const problem = await Problem.findById(problemId);
        

//         //storing sumbitted code, before Sending to judge0
//         const submittedCode = await submission.create({
//             userId,
//             problemId,
//             code,
//             language,
//             status : "pending",
//             testCasesTotal : problem.hiddenTestCase.length
//         })

//         //now sending code to judge0
//          const languageId = getlanguagebyId(language);

//         const submission = problem.hiddenTestCase.map(({ input, output }) => ({
//             source_code:code,
//             language_id: languageId,
//             stdin: input,
//             expected_output: output
//         }));

//         const submitResult = await submitBatch(submission);
//         const resultToken = submitResult.map((value) => value.token);
//         const resultb = await submitToken(resultToken);
        
//         let runtime =0;
//         let memory=0;
//         let status="accepted";
//         let errorMessage = null;
//         let testCasesPassed=0;
//         for(const test of resultb){
//             if(test.status_id==3){
//                 testCasesPassed++;
//                 runtime+=parseFloat(test.time);
//                 memory=Math.max(memory,test.memory);


//             }
//             else{
//                 if(test.status_id==4){
//                     status="error";
//                     errorMessage=test.stderr;
//                 }else{
//                     status="wrong";
//                     errorMessage=test.stderr;
//                 }
//             }
//         }

//         submittedCode.runtime=runtime;
//         submittedCode.memory=memory;
//         submittedCode.status=status;
//         submittedCode.errorMessage=errorMessage;
//         submittedCode.testCasesPassed=testCasesPassed;
        
//         //req.result means userSchmea because when authentication(tokenMw) result stored the refernce of document i.e userSchema(indirectly)
//         if(!req.result.probelmSolved.includes(problemId)){
//             req.result.probelmSolved.push(problemId);
//             await req.result.save();
//         }
//         await submittedCode.save();
//         res.status(400).send(submittedCode);

//     }catch(err){

//         res.status(404).send("Intenal Server Error"+err);
//     }
// }







        // const result = await submitHiddenCode(submission);
        // let runtime =0;
        // let status="accepted";
        // let errorMessage = null;
        // let testCasesPassed=0;
        // for(const test of result){
        //     if(test.passed){
        //         testCasesPassed++;
        //         runtime+=test.runtime;
                

        //     }
        //     else{
               
        //             status="Wrong";
        //             errorMessage=test.error;
                
        //         }
        //     }
        

        // submittedCode.runtime=runtime;
        // submittedCode.memory=0;
        // submittedCode.status=status;
        // submittedCode.errorMessage=errorMessage;
        // submittedCode.testCasesPassed=testCasesPassed;
        
        // //req.result means userSchmea because when authentication(tokenMw) result stored the refernce of document i.e userSchema(indirectly)
        // if(!req.result?.probelmSolved?.includes(problemId)){
        //     req.result?.probelmSolved?.push(problemId);
        //     await req.result.save();
        // }
        // await submittedCode.save();
        // res.status(200).send(submittedCode);
