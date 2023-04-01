import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    caption:String,

    image:{
        public_id:String,
        url:String
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    comments:[
        {
            user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
            },
            usercomment:{
                   type:String,
                   required:true
            },
            reply:[
                {
                    replyOwner:{
                        type:mongoose.Schema.Types.ObjectId,
                        ref:'User'
                    },
                    replyComment:{
                        type:String,
                        required:true
                    }
                }
            ]
        }
    ],
    createdate:{
        type:Date,
        default:Date.now
    }
 
})
export const postModel=mongoose.model("Post",postSchema)