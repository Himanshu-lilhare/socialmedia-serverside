import ErrorHandling from "../utils/errorHandler.js";
import { catchAsyncErrorbro } from "./catchAsynError.js";
import Jwt from "jsonwebtoken"
import { userModelbro } from "../models/user.js";
export const authnetictaedOrNot=catchAsyncErrorbro(async(req,res,next)=>{

    // to acces this cookies we have first 
    // install cookie-parser package
  
const {token}=req.cookies


if(token){
    console.log('token aa gayi')
}
if(!token) return next(new ErrorHandling("you are not logged in",400))

const decode=await Jwt.verify(token,process.env.JWT_SECRET)

req.user=await userModelbro.findById(decode._id)

next()

})