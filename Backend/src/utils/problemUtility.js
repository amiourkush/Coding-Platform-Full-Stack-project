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

const submitVisibleCode = async (submission) => {

    const allVisibleResult = [];

    if (!submission || submission.length === 0) {
        throw new Error("No visible testcases provided");
    }


    // No historical runtime prediction for Run requests.
    // Therefore scheduler treats this as UNKNOWN workload.
    const {
        executor,
        estimatedRuntime,
        hasReliableEstimate
    } = loadBalancer.getExecutor(null);


    console.log(
        `[RUN]
Executor=${executor.id}
ReliableEstimate=${hasReliableEstimate}`
    );


    try {

        for (const data of submission) {

            const result =
                await executeCode(
                    executor,
                    data
                );


            if (
                result?.output?.trim() ===
                data?.output?.trim()
            ) {

                result.passed = true;

            }

            else {

                result.passed = false;

            }


            allVisibleResult.push(result);
        }


        return allVisibleResult;

    }

    finally {

        loadBalancer.releaseExecutor(
            executor.id,
            estimatedRuntime,
            hasReliableEstimate
        );

    }
};


const submitHiddenCode = async (
    { code, language },
    testcases,
    problem
) => {

    const runtimeStats =
        problem.runtimeStats?.find(
            stat =>
                stat.language.toLowerCase() ===
                language.toLowerCase()
        );

    const {
        executor,
        estimatedRuntime,
        hasReliableEstimate
    } = loadBalancer.getExecutor(
        runtimeStats
    );

    try {

        const response = await axios.post(
            `${executor.url}/run-batch`,
            {
                language,
                code,
                testcases
            },
            {
                timeout: 120000
            }
        );

        return response.data;

    } finally {

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

