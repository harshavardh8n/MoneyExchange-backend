const express = require("express")
const zod = require("zod");
const { User, Account } = require("../db");
const router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const usermiddleware = require("../middlewares/usermiddleware");

const signupSchema = zod.object({
    username:zod.string().email(),
    firstName:zod.string(),
    lastName:zod.string(),
    password:zod.string(),
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signup",async (req,res)=>{

    try {
        const {success} = signupSchema.safeParse(req.body);
        if(!success){
            return res.status(401).json({message:"Inputs Invalid"})
        }
    
        const existing = await User.findOne({username:req.body.username})
    
        if(existing){
            return res.status(411).json({message:"Email already taken"});
        }
    
        const user = await User.create({
            username : req.body.username,
            password : req.body.password,
            firstName: req.body.firstName,
            lastName : req.body.lastName
        })
    
        const account = await Account.create({
            userId: user._id,
            balance:1000
        })
    
        const userId = user._id;
        const token1 = jwt.sign({userId},JWT_SECRET);
        console.log(userId);
        res.status(200).json({message:"User created successfully",token:token1})

    } catch (error) {
        res.status(110).json({error:error})
    }
   
})

router.get("/getUser",usermiddleware,async(req,res)=>{
    try{
        const userId = req.userId;
        const user = await User.findOne({_id:userId});
        res.status(200).json({username:user.username,firstName:user.firstName,lastName:user.lastName})
    }
    catch(e){
        res.status(400).json({mssg:"User not found"})
    }
   
})


router.post("/signin",async(req,res)=>{
    const resp = signinSchema.safeParse(req.body);
    const username = req.body.username;
    const password = req.body.password;
    if(!resp.success){
        res.status(411).json("Invalid Inputs");
    }
    const user = await User.findOne({username:username,password:password})
    if(!user){
        return res.json({mssg:"Invalid credentials"})
    }
    const userId = user._id;
    const token2 = jwt.sign({userId},JWT_SECRET)
    return res.json({mssg:"Logged In successfully",token:token2})
})

    router.get("/getAllUsers", usermiddleware,async(req,res)=>{
        const users = await User.find({});
        return res.status(200).json({users:users.map(user=>({userid:user._id,username:user.username,firstName:user.firstName,lastName:user.lastName}))})
    })

    router.get("/bulk",usermiddleware,async(req,res)=>{

        const filter = req.query.filter || ""
        console.log(filter)
        const users  = await User.find({
            $or:[{firstName:{"$regex":filter}},{lastName:{"$regex":filter}}]
        })
        res.status(200).json({users:users.map(user=>({userid:user._id,username:user.username,firstName:user.firstName,lastName:user.lastName}))})
    })

    router.get("/otherusers",usermiddleware,async(req,res)=>{

        const filter = req.query.filter || ""
        console.log(filter)
        const users  = await User.find({
            $or:[{firstName:{"$regex":filter}},{lastName:{"$regex":filter}}]
        })
        const otherusers = users.filter(user=>user._id!=req.userId)
        const finalusers = otherusers.map(user=>({userid:user._id,username:user.username,firstName:user.firstName,lastName:user.lastName}))
        
        res.status(200).json({users:finalusers,before:finalusers.length})
    })

    // router.post("/deleteAll",async(req,res)=>{
    //     await User.deleteMany({});
    //     await Account.deleteMany({});
    //     return res.json({mssg:"deleted successfully"})


    // })

module.exports = router;