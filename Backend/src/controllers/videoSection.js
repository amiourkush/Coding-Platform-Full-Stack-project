const cloudinary = require("cloudinary").v2;
const Problem=require("../models/problem");
const Video = require("../models/video");


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API,
    api_secret:process.env.CLOUD_SECRET

});

const genSignature = async(req,res)=>{
    const {problemId} = req.params;
    const userId = req.result._id;
    const problem = await Problem.findById(problemId);
    try{
    if(!problem){
        return res.status(201).json({error:"Problem"})
    }
    const timestamp =Math.round(new Date().getTime()/1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

    const uploadParams ={
        timestamp : timestamp,
        public_id : publicId
    }

    const signature = cloudinary.utils.api_sign_request(
        uploadParams,
        process.env.CLOUD_SECRET
    );

    res.json({
        signature,
        timestamp,
        public_id:publicId,
        api_key:process.env.CLOUD_API,
        cloud_name:process.env.CLOUD_NAME,
        upload_url : `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/video/upload`,
    });
    }
    catch(err){
    console.error("Error generating upload signature:",err);
    res.status(500).json({error:"Failed to generate upload credentials"});
    }


};

const saveMetaData = async(req,res)=>{
    try{
        const{problemId,cloudinaryPublicId,secureUrl,duration}=req.body;
        const userId = req.result._id;


        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            { resource_type:"video"}
        );
    
    if(!cloudinaryResource){
        return res.status(400).json({error:"Video not found on Cloudinary"});

    }

    const existingVideo = await Video.findOne({
        problemId,
        userId,
        cloudinaryPublicId
    });

    if(existingVideo){
        return res.status(409).json({error:"Video already exists"});

    }

    // const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id,{
    //     resource_type:"image",
    //     transformation:[
    //         {
    //             width:400,height:225,crop:"fill"
    //         },
    //         {
    //             quality:"auto"
    //         },
    //         {start_offset :"auto"}
    //     ],
    //     format:"jpg"
    // })

    const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type:"video"});

    const videoSolution = await Video.create({
        problemId,
        userId,
        cloudinaryPublicId,
        secureUrl,
        duration:cloudinaryResource.duration || duration,
        thumbnailUrl
    });

    

    res.status(201).json({
        message : "Video Solution Saved Successfully",
        videoSolution:{
            id:videoSolution._id,
            thumbnailUrl:videoSolution.thumbnailUrl,
            duration:videoSolution.duration,
            uploadedAt:videoSolution.createdAt
        }

    });


    }catch(error){
        console.error("Error Saving Video metadata:",error);
        res.status(500).json({error:"Failed to save video metadata"})
    }

}

const deleteVideo = async(req,res)=>{
    try{
        const {problemId} = req.params;
        const userId = req.result._id;

        const video = await Video.findOneAndDelete({problemId:problemId});
        if(!video){
            return res.status(404).json({error:"Video not Found"});
        }

        await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type:"video",invalidate:true});
        res.json({
            message : "Video Deleted Successfully"
        })
    }catch(error){
        console.error("Error Deleting Video:",error);
        res.status(500).json({error:"Failed to delete Video"});
    }
}

module.exports ={genSignature,saveMetaData,deleteVideo};