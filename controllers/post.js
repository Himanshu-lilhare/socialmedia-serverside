import { catchAsyncErrorbro } from "../middleware/catchAsynError.js";
import { postModel } from "../models/post.js";
import { userModelbro } from "../models/user.js";
import ErrorHandling from "../utils/errorHandler.js";
import cloudinary from "cloudinary"
import cookieParser from "cookie-parser";
export const uploadPost = catchAsyncErrorbro(async(req, res, next)=>{
  console.log('ok')
  const myCloud=await cloudinary.v2.uploader.upload(req.body.image,{folder:"socialMediaApp"})
  
  
  let createpost = {
    caption: req.body.caption,
    image: {
      public_id:myCloud.public_id,
      url: myCloud.secure_url,
    },
    owner: req.user._id,
  };

  let post = await postModel.create(createpost);

  const user = await userModelbro.findById(req.user._id);
  user.posts.unshift(post._id);
  await user.save();

  res.status(201).json({
    message: "Post Uploaded",
    post,
  });
});

export const likeOrUnlike = catchAsyncErrorbro(async (req, res, next) => {
  let post = await postModel.findById(req.params.id);
  if (!post) return next(new ErrorHandling("Post Not Found"));

  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id);
    post.likes.splice(index, 1);
    await post.save();

    res.status(200).json({
      message: "post Unliked",
      post,
    });
  } else {
    post.likes.push(req.user._id);
    await post.save();
    res.status(200).json({
      message: "post liked",
      post,
    });
  }
});

export const deletePost = catchAsyncErrorbro(async (req, res, next) => {
  let post = await postModel.findById(req.params.id);
  if (!post) return next(new ErrorHandling("Post Doesn't Exist"));

  if (post.owner._id.toString() !== req.user._id.toString())
    return next(new ErrorHandling("You Cannot Delete This Post"));
  
    await cloudinary.v2.uploader.destroy(post.image.public_id)
  await post.remove();

  let user = await userModelbro.findById(req.user._id);

  let index = user.posts.indexOf(req.params.id);
  console.log(index)
  user.posts.splice(index, 1);
  await user.save();
  res.status(200).json({
    message: "Post Deleted",
    user,
  });
});

export const getPosts = catchAsyncErrorbro(async (req, res, next) => {
  let user = await userModelbro.findById(req.user._id);

  let posts = await postModel.find({
    owner: {
      $in: user.following,
    },
    // populate karke bhej rahe hai taki likes or comments
    // me dekh paye uski profile image or name etc
  }).populate("likes owner comments.user comments.reply.replyOwner");

  res.status(200).json({
    // 
    posts:posts.reverse(),
  });
});

export const editPostCaption = catchAsyncErrorbro(async (req, res, next) => {
  const post = await postModel.findById(req.params.id);
  if (!post) return next(new ErrorHandling("Post Doesn't Exist", 400));

  if (post.owner.toString() !== req.user._id.toString())
    return next(new ErrorHandling("You Cannot Edit Other UsersPost", 400));
  console.log(req.body.caption+"edit")
  post.caption = req.body.caption;
  await post.save();
  res.status(200).json({
    message: "Edit Caption Successfully",
  });
});

export const addupdateComment = catchAsyncErrorbro(async (req, res, next) => {
  let post = await postModel.findById(req.params.id);

  if (!post) return next(new ErrorHandling("Post Not Found", 400));

  let commentindex = -1;

  post.comments.forEach((comment, index) => {
    if (comment.user.toString() === req.user._id.toString()) {
      commentindex = index;
    }
  });
  console.log(commentindex);

  if (commentindex !== -1) {
    post.comments[commentindex].usercomment = req.body.comment;
    await post.save();
    return res.status(200).json({
      message: "Comment Updated",
    });
  } else {
    post.comments.push({
      user: req.user._id,
      usercomment: req.body.comment,
    });
    await post.save();
    return res.status(200).json({
      message: "Comment Uploaded",
    });
  }
});
export const replyToComment=catchAsyncErrorbro(async(req,res,next)=>{

  let post = await postModel.findById(req.params.id);
  if(!post) return next(new ErrorHandling('Post Not Found',400))
  let commentId=req.body.commentId
  let replyComment=req.body.comment

   post.comments.forEach((comment,index)=>{
    if(comment._id.toString()!==commentId.toString()) return 

    comment.reply.push({
      replyOwner:req.user._id,
      replyComment:replyComment
    })
   
   })
   await post.save()
   
   return res.status(200).json({
    message:'reply Successfully'
   })



})

export const deletecomment = catchAsyncErrorbro(async (req, res, next) => {
  let post = await postModel.findById(req.params.id);
  if (!post) return next(new ErrorHandling("Post Not Found", 400));
 
  if (post.owner.toString() === req.user._id.toString()) {
    if (!req.body.commentid)
      return next(new ErrorHandling("CommentId Required", 400));

    post.comments.forEach((comment,index) => {
      if (comment._id.toString() === req.body.commentid) {
        return post.comments.splice(index, 1);
      }
    });
    await post.save();
    res.status(200).json({
      message: "Comment Deleted Succuessfully",
    });
  }else{
post.comments.forEach((comment,index)=>{
  if(comment.user.toString()===req.user._id.toString()){
    return post.comments.splice(index,1)
  }
})
await post.save()
res.status(200).json({
  message:"Your COmment Deleted"
})

  }
});

export const getMyPosts=catchAsyncErrorbro(async(req,res,next)=>{
const user=await userModelbro.findById(req.user._id)
const posts=[]
for(let i=0;i<user.posts.length;i++){
  
  let post=await postModel.findById(user.posts[i]).populate('likes comments.user')
  posts.push(post)
}
res.status(200).json({
  message:"Done",
  posts
})

})
export const getOthersPosts=catchAsyncErrorbro(async(req,res,next)=>{
  const user=await userModelbro.findById(req.params.id)
  const posts=[]
  for(let i=0;i<user.posts.length;i++){
    
    let post=await postModel.findById(user.posts[i]).populate('likes comments.user')
    posts.push(post)
  }
  res.status(200).json({
    message:"Done",
    posts
  })
  
  })


