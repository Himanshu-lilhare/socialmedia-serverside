import { catchAsyncErrorbro } from "../../middleware/catchAsynError.js"
import { Chat } from "../../models/chat.js"
import { Message } from "../../models/message.js"
import { userModelbro } from "../../models/user.js"
import ErrorHandling from "../../utils/errorHandler.js"
export const sendMessage=catchAsyncErrorbro(async(req,res,next)=>{
    const {content,chatId}=req.body
   
    if(!content||!chatId) return next(new ErrorHandling('Please provide Content and Chat Id both'))
    let newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId
    }
    let message=await Message.create(newMessage)
    message=await message.populate('sender','name avatar')
    message=await message.populate('chat')

    console.log('id hai'+chatId)
   
   
    message=await userModelbro.populate(message,{path:'chat.users',select:'name avatar email'})
  
   const updatedChat= await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:message._id}).populate('latestMessage')
   console.log(updatedChat)
    res.json({message})

}) 
export const fetchAllMessages=catchAsyncErrorbro(async(req,res,next)=>{
   
    const messages=await Message.find({chat:req.params.chatId})
    .populate('sender','name avatar email')
    .populate('chat')

  res.json({messages})
})
