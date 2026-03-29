const mongoose = require("mongoose");

async function main(){
    mongoose.connect(process.env.connect)
}

module.exports = main;