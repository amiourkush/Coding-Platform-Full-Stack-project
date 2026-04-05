const axios = require("axios")
const getlanguagebyId =(lang)=>{
     const language = {
        "c++" : 54,
        "java" : 62,
        "javascript" : 63,
        "python": 71
     }
     return language[lang.toLowerCase()];
}

const executeCode = async ({ language, code, input }) => {
  try {
    const response = await axios.post("http://localhost:4000/run", {
      language,
      code,
      input
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


const submitVisibleCode =async(submission)=>{
  for(const data of submission){
    const result = await executeCode(data);
    if(data?.output.trim()!=result?.output.trim()){
      return [data.output,result.output];
         
    }
    
  }
  return 1;
}

module.exports ={executeCode,submitVisibleCode};






















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