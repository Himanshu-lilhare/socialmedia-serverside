import { createTransport } from "nodemailer";

const sendemailbro=(to,message,text)=>{

    const transporter=createTransport({
        service:'gmail',
     port:process.env.SPORT,
     secure:false,
     require:true,
  auth: {
           user:process.env.USER,
           pass:process.env.PASS 
        } 
})

    transporter.sendMail({
        from:process.env.USER,to,subject:message,text
    },function(err,info){
        if(err){
            console.log(err)
            return 
        }else{
            console.log(info.response)
        }
    })
}

export default sendemailbro