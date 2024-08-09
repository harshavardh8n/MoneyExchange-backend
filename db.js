const mongoose = require("mongoose");
require("dotenv").config();
// require("dotenv").config()


mongoose.connect(process.env.MONGO_CONNECTION_KEY)

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
})

const accountSchema = mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    balance:{
        type:Number,
        required:true
    } 

})

const User = mongoose.model("User",userSchema);
const Account = mongoose.model("Account",accountSchema)


module.exports = {User,Account}