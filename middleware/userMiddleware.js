const jwt = require('jsonwebtoken')
const userSchema = require('../models/userSchema')

const userMiddleware = async(req , res , next)=> {
    try {
        let token  = req.cookies.EaseRecipies
        if(!token){
            req.userData = null;
            res.status(401).send({success:false , msg:"User Unauthorised"})
        }else{
            let getUser  =  jwt.verify(token , process.env.SECRET_KEY)
            let findUser = await userSchema.findOne({ email: getUser.email })
               req.userData = findUser;
               next()
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}

module.exports = userMiddleware;