import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";

export const signup = async(req,res)=>{
    const { fullname,email,password,bio} = req.body;
    try{
        if(!fullname || !email || !password || !bio){
            return res.json({success:false,message:"Missing Details"})
        }
        const user = await User.findOne({email});
        if(user){
            return res.json({success:false , message : "Account already exist"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = await User.create({
            fullname,email,password:hashedPassword,bio
        });
        const token = generateToken(newUser._id)
        res.json({success:true,userData:newUser,token,message : "Account Created Successfully"})
    } catch(error){
            console.log(error.message)
            res.json({success:false, message:error.message})
    }
}


export const login = async(req,res) => {
    try{
        const {email,password} = req.body;
        const userData = await User.findOne({email})
        const isPasswordCorrect = await bcrypt.compare(password,userData.password);

        if(!isPasswordCorrect){
            return res.json({success : false, message : "Invalid password"})
        }

        const token = generateToken(userData._id)
        res.json({success:true,userData,token,message:"Login Successfull"})
    }catch(error){
            console.log(error.message)
            res.json({success:false, message:error.message})
    }
}

//controller to check if user is authenticarted or not

export const checkAuth = (req,res) => {
    res.json({success : true, user : req.user});
}

// export const updateProfile = async(req,res) => {
//     try{
//         const {profilePic,bio,fullname} = req.body;
//         const userId = req.user._id;
//         let updatedUser;
//         if(!profilePic){
//             updatedUser = await User.findByIdAndUpdate(userId,{bio,fullname},{new:true});
//         } else{
//             const upload = await cloudinary.uploader.upload(profilePic);
//             updatedUser = await User.findByIdAndUpdate(userId,{profilePic : upload.secure_url,bio,fullname},{new:true});
//         }
//         res.json({success:true,user:updatedUser});
//     } catch(error){
//         console.log(error.message);
//         res.json({success:false,message : error.message});

//     }
// }


export const updateProfile = async(req,res) => {
    try{
        console.log("Request body:", req.body);
        console.log("User ID:", req.user._id);
        const {profilePic,bio,fullname} = req.body;
        const userId = req.user._id;
        let updatedUser;
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullname},{new:true});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId,{profilePic : upload.secure_url,bio,fullname},{new:true});
        }
        res.json({success:true,user:updatedUser});
    } catch(error){
        console.log(error.message);
        res.json({success:false,message : error.message});
    }
}
