const axios = require("axios")
const loadBalancer = require("../scheduler/loadBalancer")

const getlanguagebyId =(lang)=>{
     const language = {
        "c++" : 54,
        "java" : 62,
        "javascript" : 63,
        "python": 71
     }
     return language[lang.toLowerCase()];
}



const executeCode = async (executor, { language, code, input }) => {
  
    const response = await axios.post(
        `${executor.url}/run`,
        {
            language,
            code,
            input
        }
    );

    return response.data;
 
};

const submitVisibleCode =async(submission)=>{

  
  const allVisibleResult =[]
  for(const data of submission){
    const result = await executeCode(data);
    if(data?.output.trim()!=result?.output.trim()){
      allVisibleResult.passed =true;
      allVisibleResult.push(result);
         
    }
    else{
      allVisibleResult.passed = false;
      allVisibleResult.push(result);
    }
    
  }
  return allVisibleResult;
}


const submitHiddenCode =
async (submission, problem) => {

    const allResult = [];

    // Safety check
    if (!submission || submission.length === 0) {
        throw new Error("No testcases provided");
    }

    const language =
        submission[0].language;


    // ------------------------------------
    // Find historical runtime stats
    // for this problem + language
    // ------------------------------------

    const runtimeStats =
        problem.runtimeStats?.find(
            stat =>
                stat.language.toLowerCase() ===
                language.toLowerCase()
        );


    // ------------------------------------
    // Workload-aware scheduler
    // chooses ONE executor
    // ------------------------------------

    const {
        executor,
        estimatedRuntime,
        hasReliableEstimate
    } = loadBalancer.getExecutor(
        runtimeStats
    );


    console.log(
        `Problem=${problem._id}
Language=${language}
Executor=${executor.id}
EstimatedRuntime=${estimatedRuntime}ms
ReliableEstimate=${hasReliableEstimate}`
    );


    try {

        // ------------------------------------
        // ALL testcases of this submission
        // execute on SAME executor
        // ------------------------------------

        for (const data of submission) {

            const result =
                await executeCode(
                    executor,
                    data
                );


            if (
                result?.output?.trim() ===
                data.output.trim()
            ) {

                result.passed = true;

                allResult.push(result);

            }

            else {

                result.passed = false;

                allResult.push(result);

                break;

            }

        }


        return allResult;

    }

    finally {

        // ------------------------------------
        // Remove this submission's reserved
        // workload from executor
        // ------------------------------------

        loadBalancer.releaseExecutor(
            executor.id,
            estimatedRuntime,
            hasReliableEstimate
        );

    }

};





module.exports ={executeCode,submitVisibleCode,submitHiddenCode};






















// const submitBatch = async(submission)=>{



// const options = {
//   method: 'POST',
//   url: 'http://localhost:2358/submissions/batch',
//   params: {
//     base64_encoded: 'false'
//   },
//   headers: {
   
//     'Content-Type': 'application/json'
//   },
//   data: {
//     submissions: submission }
  
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// return await fetchData();

// }





// const waiting = async(timer)=>{
//    setTimeout(()=>{
//       return 1;
//    },timer)
// }

// const submitToken = async(token)=>{

//    const tokenss = token.join(",");
  

// const options = {
//   method: 'GET',
//   url: 'http://localhost:2358/submissions/batch',
//   params: {
//     tokens: tokenss,
//     base64_encoded: 'false',
//     fields: '*'
//   },
//   headers: {
    
//     'Content-Type': 'application/json'
//   }
// };

// async function fetchData() {
// 	try {
// 		const response = await axios.request(options);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }
// while(true){
// const result =await fetchData();
// const IsObtained=result.submissions.every((r)=>r.status_id>=2);
// if(IsObtained){
//    return result.submissions;
// }
// await waiting(1000);
// }
// }



// const executeCode = async ({ language, code, input }) => {
//   try {
//     const response = await axios.post("http://localhost:4000/run", {
//       language,
//       code,
//       input
//     });

//     return response.data;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };


//const submitHiddenCode = async(submission)=>{
//   const allResult =[];
//   for(const data of submission){
//     const result = await executeCode(data);
//     if(result?.output.trim()==data.output.trim()){
//      result.passed = true; 
//     allResult.push(result);
//   }
//     else{
//       result.passed =false;
//       allResult.push(result);
//       break;
//     }
    
//   }
//   return allResult;
// }

