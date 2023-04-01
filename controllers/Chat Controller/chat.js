import { VirtualType } from "mongoose";
import { catchAsyncErrorbro } from "../../middleware/catchAsynError.js";
import { Chat } from "../../models/chat.js";
import { userModelbro } from "../../models/user.js";
import ErrorHandling from "../../utils/errorHandler.js";

const accessChatBro = catchAsyncErrorbro(async (req, res, next) => {
  let user = await userModelbro.findById(req.user._id);
  let chatId = req.body.chatId;
  let userId = req.body.userId;

  if (chatId) {
    let isChat = await Chat.find({
      _id: chatId,
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await userModelbro.populate(isChat, {
      path: "latestMessage.sender",
      select: "name avatar email",
    });

    return res.status(200).json({
      chat: isChat[0],
    });
  }

  if (userId) {
    console.log("user iD aayi");
    let kyaChatHai = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: user } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    console.log("user iD aayi 2");

    kyaChatHai = await userModelbro.populate(kyaChatHai, {
      path: "latestMessage.sender",
      select: "name avatar email",
    });
    if (kyaChatHai.length > 0) {
      res.json({
        chat: kyaChatHai,
      });
    } else {
      console.log("user Id yaha pe  AAYi ab");
      let chatname=await userModelbro.findById({_id:userId})
      let chatData = {
        chatName:chatname.name ,
        isGroupChat: false,
        users: [user, userId],
      };
      const createdChat = await Chat.create(chatData);

      const chat = await Chat.findById({ _id: createdChat.id }).populate(
        "users",
        "-password"
      );

      res.status(200).json({ chat });
    }
  }
});
export default accessChatBro;

export const fetchChats = catchAsyncErrorbro(async (req, res, next) => {
  var chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });
  console.log("yaha to aa hi gaya");
  chats = await userModelbro.populate(chats, {
    path: "latestMessage.sender",
    select: "name avatar email",
  });
  chats = chats.map((chat) => {
    let index;

    if (chat.users[0]._id.toString() === req.user._id.toString()) {
      console.log("1 hua");
      index = 1;
    } else {
      console.log("0 hua");
      index = 0;
    }
    chat.chatName = chat.users[index].name;

    return chat;
  });

  res.status(200).json({
    chats,
  });
});

export const createGroupChat = catchAsyncErrorbro(async (req, res, next) => {
  if (!req.body.users || !req.body.groupname)
    return next(new ErrorHandling("please provide Groupname and Users"));

  let users = JSON.parse(req.body.users);
  if (users.length > 2) {
    return next(
      new ErrorHandling("More than 2 users required to create group")
    );
  }
  users.push(req.user._id);
  const groupChat = await Chat.create({
    chatName: req.body.groupname,
    isGroupChat: true,
    users: users,
    groupAdmin: req.user._id,
  });
  console.log("yaha to aa gaya");
  const fullGroupChat = await Chat.findOne({
    _id: groupChat._id,
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).send(fullGroupChat);
});

export const renameGroup = catchAsyncErrorbro(async (req, res, next) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    return next(new ErrorHandling("please provide chatid or Chatname"));
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) return next(new ErrorHandling("Chat Doesnt Exist"));

  res.status(200).json(updatedChat);
});

export const addUserTOGroup = catchAsyncErrorbro(async (req, res, next) => {
  const { chatId, userId } = req.body;
  if (!chatId || !userId) next(new ErrorHandling("provide userId and chaId"));

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!added) return next(new ErrorHandling("Chat doesnt found"));
  res.status(200).json(added);
});
