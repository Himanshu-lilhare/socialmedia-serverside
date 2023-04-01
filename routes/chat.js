import  express  from "express";
import accessChatBro, { createGroupChat, fetchChats, renameGroup } from '../controllers/Chat Controller/chat.js'

import { authnetictaedOrNot } from "../middleware/authentication.js";

 const chatRouter=express.Router()

chatRouter.route('/chat').post(authnetictaedOrNot,accessChatBro)
chatRouter.route('/fetchchats').get(authnetictaedOrNot,fetchChats)
chatRouter.route('/creategroupchat').post(authnetictaedOrNot,createGroupChat)
chatRouter.route('/renamegroup').post(authnetictaedOrNot,renameGroup)




export default chatRouter
