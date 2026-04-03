const express = require("express");
require("dotenv").config();
const main = require("./config/db")
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/userAuth")
const problemRouter = require("./routes/problemFetch")
const redisClient = require("./config/redis")
const submitRouter = require("./routes/submit");
const cors = require("cors");
const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials : true
}))
app.use(express.json());
app.use(cookieParser());


app.use("/user",authRouter)
app.use("/problem",problemRouter)
app.use("/submission",submitRouter)




const connection = async()=>{

    try{
        await Promise.all([main(),redisClient.connect()])
        console.log("DB is connected")
        app.listen(process.env.PORT,()=>{
        console.log("Server is Listening at :"+process.env.PORT)
     })
    }
    catch(err){
        console.log("ERR :"+err)
    }
}

connection();