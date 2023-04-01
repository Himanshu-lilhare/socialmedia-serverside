
export const errorMiddlewarebro=(err,req,res,next)=>{
  
    err.message = err.message || 'Wrong request'
    err.statuscode=err.statuscode || 400

    res.status(err.statuscode).json(
        {
            error:err.message
        }
    )
}