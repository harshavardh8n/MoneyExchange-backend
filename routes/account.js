const {Account, User} = require("../db")
const express = require("express");
const usermiddleware = require("../middlewares/usermiddleware");
const { default: mongoose } = require("mongoose");
const router = express.Router()

router.get("/balance",usermiddleware,async(req,res)=>{

    const account = await Account.findOne({userId:req.userId})
    // console.log(account.userId,account.balance) 
    const balance = account.balance;
    
    res.status(200).json({balance:account.balance})

})

router.post("/transfer",usermiddleware,async(req,res)=>{

    const session = await mongoose.startSession();
    session.startTransaction();
    const {to,amount} = req.body;
    
    try {
        const sender = await Account.findOne({userId:req.userId}).session(session)
        if(sender.balance<amount){
            session.abortTransaction();
            return res.status(400).json({mssg:"Insufficient bank balance"})
            
        }
        const receiver = await Account.findOne({userId:to}).session(session)
        if(!receiver){
            session.abortTransaction();
            return res.status(404).json({mssg:"No such user found"})
        }

        await Account.updateOne({userId:req.userId},{
            $inc:{
                balance: -amount
            }
        }).session(session)

        await Account.updateOne({userId:to},{
            $inc:{
                balance:amount
            }
        }).session(session)

        session.commitTransaction();
        res.status(200).json({mssg:"Transaction successful"})


    } catch (error) {
        res.status(101).json({error:error})
    }
    

})

module.exports = router;