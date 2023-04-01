import express from 'express'
import { fetchAllMessages, sendMessage } from '../controllers/Chat Controller/message.js'
import { authnetictaedOrNot } from '../middleware/authentication.js'
export const messageRouter=express.Router()

messageRouter.route('/sendmessage').post(authnetictaedOrNot,sendMessage)
messageRouter.route('/fetchallmessages/:chatId').get(authnetictaedOrNot,fetchAllMessages)