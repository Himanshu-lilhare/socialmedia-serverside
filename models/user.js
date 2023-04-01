import mongoose from "mongoose";
import bcrypt from "bcrypt"
import Jwt  from "jsonwebtoken";
import crypto from "crypto"
const userSchema=new mongoose.Schema({

name:{
    type:String,
    required:[true,"Please Enter Name"],
   
},
email:{
    type:String,
    unique:true,
    required:[true,"Please Enter Email"],

},
password:{
    type:String,
    required:[true,"Pasword Must Have 6 Characters"]
},
avatar:{
    public_id:String,
    url:String,
   
},
followers:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
],
following:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
],
posts:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    }
],
resettoken:String,
resettokenexpiry:Date

})

userSchema.pre("save",async function(next){
   
    if(this.isModified("password")){
    this.password =await bcrypt.hash(this.password,10)
    }
   next()
})
userSchema.methods.comparePassword=function(password){
return bcrypt.compare(password,this.password)
}
userSchema.methods.getJWTtoken=function(){
   return Jwt.sign({_id:this._id},process.env.JWT_SECRET)
}
userSchema.methods.comparePassword=function(password){
 return  bcrypt.compare(password,this.password)

}
userSchema.methods.getresettoken=function(){

let resetToken= crypto.randomBytes(20).toString("hex")

this.resettoken=crypto.createHash("sha256").update(resetToken).digest("hex")
this.resettokenexpiry=Date.now() + 2 * 60 * 1000

return resetToken


}
 
export const userModelbro=mongoose.model("User",userSchema)