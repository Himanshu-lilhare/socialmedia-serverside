import mongoose from "mongoose";

export async function connectdb(){
   const{connection}= await mongoose.connect(process.env.MONGO_URL)
  
    console.log(`server is connect with host ${connection.port}`)
}