import { catchAsyncErrorbro } from "../middleware/catchAsynError.js";
import sendemailbro from "../middleware/sendEmail.js";
import { postModel } from "../models/post.js";
import { userModelbro } from "../models/user.js";
import ErrorHandling from "../utils/errorHandler.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
export const registerUser = catchAsyncErrorbro(async (req, res, next) => {
  const { name, email, password, imageUri } = req.body;
  if (!name || !email || !password)
    return next(new ErrorHandling("Enter All Required Fields", 400));

  let user = await userModelbro.findOne({ email });
  if (user) return next(new ErrorHandling("User Already Exist", 400));

  const myCloud = await cloudinary.v2.uploader.upload(imageUri, {
    folder: "socialMediaApp",
  });
  user = await userModelbro.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  //   await user.save()

  res.status(201).json({
    message: "Register Successfully",
    user,
  });
});

export const login = catchAsyncErrorbro(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandling("Missing Email or Password", 400));

  let user = await userModelbro
    .findOne({ email })
    .select("+password")
    .populate("posts following followers");

  if (!user)
    return next(
      new ErrorHandling("user doesn't exist, Please register first", 400)
    );

  const isRight = await user.comparePassword(password);
  if (!isRight) return next(new ErrorHandling("Wrong Email Or Password", 400));

  let token = await user.getJWTtoken();

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      message: "logged in Successfully",
      user,
      token,
    });
});

export const logout = catchAsyncErrorbro(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      secure: true,
      httpOnly: true,
      sameSite: "none",
    })
    .json({
      message: "Logged Out",
    });
});

export const followUnfollow = catchAsyncErrorbro(async (req, res, next) => {
  let userToFollow = await userModelbro.findById(req.params.id);
  console.log("1");
  if (!userToFollow)
    return next(
      new ErrorHandling("The User You Want To Follow Doesn't Exist", 400)
    );
  console.log("2");
  let loggedInUser = await userModelbro.findById(req.user._id);

  if (loggedInUser.following.includes(userToFollow._id)) {
    let index = loggedInUser.following.indexOf(userToFollow._id);
    loggedInUser.following.splice(index, 1);
    console.log("2");
    let index2 = userToFollow.followers.indexOf(loggedInUser._id);
    userToFollow.followers.splice(index2, 1);
    console.log("3");
    await userToFollow.save();
    await loggedInUser.save();

    res.status(200).json({
      message: `unFollowed ${userToFollow.name}`,
      userToFollow,
      loggedInUser,
    });
  } else {
    loggedInUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedInUser._id);
    await loggedInUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: `followed ${userToFollow.name}`,
      userToFollow,
      loggedInUser,
    });
  }
});

export const updatePassword = catchAsyncErrorbro(async (req, res, next) => {
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword || !newpassword)
    return next(new ErrorHandling("Missing Old or New Password", 400));

  let user = await userModelbro.findById(req.user._id).select("+password");

  const isOldPasswordRight = await user.comparePassword(oldpassword);

  if (isOldPasswordRight) {
    user.password = newpassword;
    await user.save();

    res.status(200).json({
      message: "Password Changed Successfully",
    });
  } else {
    next(new ErrorHandling("Incorrect OldPassword", 400));
  }
});

export const updateNameOrEmail = catchAsyncErrorbro(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email)
    return next(new ErrorHandling("Missing Name Or Email", 400));

  let user = await userModelbro.findById(req.user._id);

  user.name = name;
  user.email = email;
  await user.save();

  res.status(200).json({
    message: "Updated Successfully",
  });
});

export const deleteAccount = catchAsyncErrorbro(async (req, res, next) => {
  let user = await userModelbro.findById(req.user._id);
  let id = user._id;
  let loggedinUserFollowings = user.following;
  let loggedinUserFollowers = user.followers;
  let userPosts = user.posts;

  await user.remove();

  for (let i = 0; i < userPosts.length; i++) {
    let post = await postModel.findById(userPosts[i]);
    console.log(post);
    post && (await post.remove());
  }

  for (let i = 0; i < loggedinUserFollowers.length; i++) {
    let userWhoFollowMe = await userModelbro.findById(loggedinUserFollowers[i]);

    let index = userWhoFollowMe.following.indexOf(id);

    userWhoFollowMe.following.splice(index, 1);
    await userWhoFollowMe.save();
  }

  for (let i = 0; i < loggedinUserFollowings.length; i++) {
    let userWhoIfollow = await userModelbro.findById(loggedinUserFollowings[i]);
    let index = userWhoIfollow.followers.indexOf(id);
    userWhoIfollow.followers.splice(index, 1);
    await userWhoIfollow.save();
  }

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      message: "Account deleted",
    });
});

export const getMyProfile = catchAsyncErrorbro(async (req, res, next) => {
  let user = await userModelbro
    .findById(req.user._id)
    .populate("posts following followers");
  res.status(200).json({
    user,
  });
});
// export const getOthersProfile = catchAsyncErrorbro(async (req, res, next) => {
//     let user = await userModelbro
//       .findById(req.body.id)
//       .populate("posts following followers");
//     res.status(200).json({
//       user,
//     });
//   });

export const getOtherUserProfile = catchAsyncErrorbro(
  async (req, res, next) => {
    let user = await userModelbro.findById(req.params.id).populate("posts following followers");

    console.log(user);
    res.status(200).json({
      user,
    });
  }
);

export const getAllUsers = catchAsyncErrorbro(async (req, res, next) => {
  const allusers = await userModelbro.find({});

  res.status(200).json({
    allusers,
  });
});
export const searchUsers = catchAsyncErrorbro(async (req, res, next) => {
  let users = [];
  console.log(req.query.username);
  if (req.query.username === "") {
    return res.status(200).json({
      users: [],
    });
  }
  users = await userModelbro.find({
    name: {
      $regex: req.query.username,
      $options: "i",
    },
  });
  res.status(200).json({
    users,
  });
});

export const sendResetLink = catchAsyncErrorbro(async (req, res, next) => {
  if (!req.body.email) return next(new ErrorHandling("Email Needed", 400));
  let user = await userModelbro.findOne({ email: req.body.email });
  if (!user) return next(new ErrorHandling("No Account On These Email", 400));

  let resettoke = await user.getresettoken();

  await user.save();

  const link = `change password on Click this ${process.env.BACKENDURL}/forgetpassword/${resettoke}`;
  const message = "Change Password";
  const to = user.email;

  sendemailbro(to, message, link);
  res.status(200).json({
    message: `reset Link Sent To ${user.email}`,
  });
});

export const forgetPassword = catchAsyncErrorbro(async (req, res, next) => {
  let resetToken = req.params.token;
  if (!resetToken) return next(new ErrorHandling("Invalid Request", 400));

  let hashResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  let user = await userModelbro.findOne({
    resettoken: hashResetToken,
    resettokenexpiry: {
      $gt: Date.now(),
    },
  });
  if (!user) return next(new ErrorHandling("Token Expired", 400));

  user.password = req.body.password;
  user.resettoken = undefined;
  user.resettokenexpiry = undefined;
  await user.save();
  res.status(200).json({
    message: "Forget Password SUccessful",
  });
});
