import  express  from "express";
import { addupdateComment, deletecomment, deletePost, editPostCaption, getMyPosts, getOthersPosts, getPosts, likeOrUnlike, replyToComment, uploadPost } from "../controllers/post.js";
import { authnetictaedOrNot } from "../middleware/authentication.js";

const postRouter=express.Router()

postRouter.route("/post/uploadpost").post(authnetictaedOrNot,uploadPost)
postRouter.route("/likeUnlike/:id").get(authnetictaedOrNot,likeOrUnlike)
postRouter.route("/deletePost/:id").delete(authnetictaedOrNot,deletePost)
postRouter.route("/replyToComment/:id").post(authnetictaedOrNot,replyToComment)
postRouter.route("/getFollowingPosts").get(authnetictaedOrNot,getPosts)
postRouter.route("/editpostcaption/:id").put(authnetictaedOrNot,editPostCaption)
postRouter.route("/post/comments/:id").put(authnetictaedOrNot,addupdateComment)
postRouter.route('/deletecomment/:id').delete(authnetictaedOrNot,deletecomment)
postRouter.route('/getmyposts').get(authnetictaedOrNot,getMyPosts)
postRouter.route('/getotherspost/:id').get(authnetictaedOrNot,getOthersPosts)
export default postRouter

