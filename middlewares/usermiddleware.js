const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const usermiddleware = (req,res,next)=>{
    const authheader = req.headers.authorization;
    const headerarr = authheader.split(" ");
    const token = headerarr[1];
    // console.log(token)
    try {
        const decodedvalue = jwt.verify(token,JWT_SECRET);
        if(decodedvalue){
            // console.log(decodedvalue.userId);
            req.userId = decodedvalue.userId;
            next();
        }
        else{
            res.status(101).json({mssg:"Not authorized user"});
        }

    } catch (error) {
        res.status(100).json({mssg:"Internal error"});
    }

}


module.exports = usermiddleware;