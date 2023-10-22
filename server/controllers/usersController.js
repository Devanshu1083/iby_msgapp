//model for usrr 
const User = require("../model/userModel");
//bcrypt for password encryption
const bcrypt = require("bcrypt");


//for register
module.exports.register = async (req,res,next)=>{
    console.log(req.body);
    //info for new user to register in req.body 
    //registering in database
    try{
    const {username,email,password} = req.body;
    //check for existing user
    const usernameCheck = await User.findOne({username});
    if(usernameCheck){
        return res.json({msg:"This username already exists.",status:false});
    }
    const emailCheck = await User.findOne({email});
    if(emailCheck){
        return res.json({msg:"This email already exists.",status:false});
    }
    //encrypting the password
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        email,
        username,
        password: hashedPassword,
    });
    
    delete user.password;
    return res.json({status:true,user});
   }
   catch(ex){
    next(ex);
   }
};
//for login
module.exports.login = async (req,res,next)=>{
    //logging in database
    try{
    const {username,password} = req.body;
    //check for existing user
    const user= await User.findOne({username});
    if(!user){
        return res.json({msg:"Invalid username or password",status:false});
    }
    const passCheck = await bcrypt.compare(password,user.password);
    if(!passCheck){
        return res.json({msg:"Invalid username or password",status:false});
    }
   
    delete user.password;
    return res.json({status:true,user});
   }
   catch(ex){
    next(ex);
   }
};
//avatar page
module.exports.setAvatar = async (req,res,next)=>{
    try{
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userId,{
            isAvatarImageSet:true,
            avatarImage,
        });
        return res.json({
            isSet:userData.isAvatarImageSet,
            image:userData.avatarImage,
        });
    }catch(ex){
        next(ex);
    }
};
//User list
module.exports.getAllUsers = async(req,res,next)=>{
    try{
        const users = await User.find({_id:{$ne:req.params.id}}).select(
            ["email","username","avatarImage","_id"]
        );
        return res.json(users);
    }catch(ex){
        next(ex);
    }
}