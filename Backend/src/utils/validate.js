const validator = require("validator");

const validate = (data)=>{

    const mandatoryField = ["firstName","emailId","password"];

    const isAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));
    console.log(isAllowed);

    if(!isAllowed){
        throw new Error("Field is missing");
    }

    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid email");
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error("Invalid password");
    }
}

module.exports = validate;