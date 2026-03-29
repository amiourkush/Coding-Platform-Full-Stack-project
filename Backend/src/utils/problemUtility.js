const axios = require("axios")
const getlanguagebyId =(lang)=>{
     const language = {
        "c++" : 54,
        "java" : 62,
        "javascript" : 63
     }
     return language[lang.toLowerCase()];
}

const submitBatch = async(submission)=>{



const options = {
  method: 'POST',
  url: 'http://localhost:2358/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
   
    'Content-Type': 'application/json'
  },
  data: {
    submissions}
  
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}

return await fetchData();

}

const waiting = async(timer)=>{
   setTimeout(()=>{
      return 1;
   },timer)
}

const submitToken = async(token)=>{

   const tokenss = token.join(",");
  

const options = {
  method: 'GET',
  url: 'http://localhost:2358/submissions/batch',
  params: {
    tokens: tokenss,
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    
    'Content-Type': 'application/json'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error(error);
	}
}
while(true){
const result =await fetchData();
const IsObtained=result.submissions.every((r)=>r.status_id>=2);
if(IsObtained){
   return result.submissions;
}
waiting(1000);
}
}

module.exports ={getlanguagebyId,submitBatch,submitToken};

