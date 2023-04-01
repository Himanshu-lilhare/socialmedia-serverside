import express from "express"
import { deleteAccount, followUnfollow, forgetPassword, getAllUsers, getMyProfile, getOtherUserProfile, login, logout, registerUser, searchUsers, sendResetLink, updateNameOrEmail, updatePassword } from "../controllers/user.js"
import { authnetictaedOrNot } from "../middleware/authentication.js"

const userRoute=express.Router()

userRoute.route("/register").post(registerUser)
userRoute.route("/login").post(login)

userRoute.route("/followUnfollow/:id").get(authnetictaedOrNot,followUnfollow)
userRoute.route("/logout").get(authnetictaedOrNot,logout)

userRoute.route("/changepassword").put(authnetictaedOrNot,updatePassword)
userRoute.route("/updateprofile").put(authnetictaedOrNot,updateNameOrEmail)
userRoute.route("/deleteaccount").delete(authnetictaedOrNot,deleteAccount)
userRoute.route("/getotheruser/:id").get(authnetictaedOrNot,getOtherUserProfile)
userRoute.route("/getalluser").get(authnetictaedOrNot,getAllUsers)
userRoute.route('/search').get(authnetictaedOrNot,searchUsers)
userRoute.route("/getmyprofile").get(authnetictaedOrNot,getMyProfile)
userRoute.route("/getresetlink").post(sendResetLink)
userRoute.route("/forgetpassword/:token").put(forgetPassword)
export default userRoute