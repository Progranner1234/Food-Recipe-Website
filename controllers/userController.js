const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const adminSchema = require('../models/adminSchema')
const userSchema = require("../models/userSchema");


const bcryptPassword = async (password) => {
  try {
    let hashPassword = await bcryptjs.hash(password, 12);
    return hashPassword;
  } catch (err) {
    console.log("line 9", err.message);
  }
};

const generateAuthToken = async (email, key) => {
  try {
    let token = jwt.sign({ email: email }, key);
    return token;
  } catch (err) {
    console.log("Line 20", err.message);
  }
};

const sendResetPasswordMail = async (name, email, token, id, role) => {
  const html =
    role === "admin"
      ? `<div style="width:100vw;height:100vh;padding:"20px;display:flex;align-item:"center;justify-content:center">
    <h2>Reset Your Password</h2>
   <div style={"width:100%;marginTop:20px;"}>
   <p style={"color:white"}> Hii Admin ${name} </p> 
   <p>Let's reset your password so you can get back to enjoying foods</p>
   <a href="http://localhost:4000/api/v1/admin/reset-password/${role}/${id}/${token}">
   <button style={"width:100%;padding:12px;font-size:17px;color:white;background:#008ee6;margin-top:20px"}>Reset Your Password</button> </a>
   </div>
   </div>`
      : `<div style="width:100vw;height:100vh;padding:"20px;display:flex;align-item:"center;justify-content:center">
   <h2>Reset Your Password</h2>
  <div style={"width:100%;marginTop:20px;"}>
  <p style={"color:white"}> Hii ${name} </p> 
  <p>Let's reset your password so you can get back to enjoying foods</p>
  <a href="http://localhost:4000/api/v1/reset-password/${role}/${id}/${token}">
  <button style={"width:100%;padding:12px;font-size:17px;color:white;background:#008ee6;margin-top:20px"}>Reset Your Password</button> </a>
  </div>
  </div>`;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOption = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "For Reset Password",
    html: html,
  };
  transporter.sendMail(mailOption, function (err, info) {
    if (err) {
      res.status(500).send({success:false , error:"Something Went Wrong"})
    } 
  });
};

const register = async (req, res) => {
  try {
    let email = req.body.email;
    let checkUser = await userSchema.findOne({ email: email });
    if (!checkUser) {
      let token = await jwt.sign({ email: email }, process.env.SECRET_KEY);
      const hashPassword = await bcryptPassword(req.body.password);
      let saveUser = new userSchema({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
      });

      await saveUser.save();

      res.cookie("EaseRecipies", token, {
        expire: new Date(Date.now() + 25892000000),
        httpOnly: true,
        secure: false,
      });

      res.status(201).send({
        success: true,
        msg: "User Registered Successfully",
        token: token,
      });
    } else {
      res.status(409).send({ success: true, error: "User Already Exists" });
    }
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err)
  }
};

const login = async (req, res) => {
  console.log("LOGIN API ACTIVATED")
  try {
  console.log("INSIDE LOGIN API")
    let user;
    let secret_key;
    let email = req.body.email;
    let password = req.body.password;
    let verifyUser = await userSchema.findOne({ email: email });
    let verifyAdmin = await adminSchema.findOne({ email: email });

    if (verifyAdmin) {
      user = verifyAdmin;
      secret_key = process.env.ADMIN_SECRET_KEY;
    } else if (verifyUser) {
      user = verifyUser;
      secret_key = process.env.SECRET_KEY;
    } else {
     return  res.status(404).send({ success: false, error: "No User Found" });
    }
    
    let verifyPassword =  await bcryptjs.compare(password, user.password);
     console.log("PASSWORD",password)
     console.log("EMAIL",email)
    if (verifyPassword) {
      let token = await generateAuthToken(email, secret_key);
      res.cookie("EaseRecipies",token,{
        expires:new Date(Date.now()+ 25892000000),
        httpOnly:true,
        secure:false
    })
       res.status(200).send({ success: true, msg: "User Login Successfully" });
       console.log("LOGIN SUCCESS")
    } else {
      res.status(401).send({ success: false, error: "Invalid Credentials" });
      console.log("INVALID CRADENTIALS")
    }
  } catch (err) {
    res.status(500).send({success:false , error:err.message});
    console.log("ERROR OCCURED")
    
  }
};

const forgotPassword = async (req, res) => {
  try {
    let user;
    let secret_key;
    let schema;
    let email = req.body.email;
    let ifAdmin = await adminSchema.findOne({ email: email });
    let ifUser = await userSchema.findOne({ email: email });

    if (ifAdmin) {
      user = ifAdmin
      secret_key = process.env.ADMIN_SECRET_KEY;
      schema = adminSchema;
    } else if (ifUser) {
      user = ifUser;
      secret_key = process.env.SECRET_KEY;
      schema = userSchema;
    } else {
     return  res.status(404).send({ success: false, error: "No User Found" });
    }

    let token = jwt.sign({ email: user.email }, secret_key);
    let verifyToken = { token: token, expire: false };
    let updateUserToken = await user.updateOne({
      $push: { resetPasswordLinks: verifyToken },
    });
    let sendEmail = await sendResetPasswordMail(
      user.name,
      user.email,
      token,
      user._id,
      user.role
    );

    
      res.clearCookie("EaseRecipies", {
        path:"/",
        secure:false,
        httpOnly:true
      });
    
    res
      .status(200)
      .send({
        success: true,
        msg: "Reset Password Link Has Been SuccessFully Send",
        update: updateUserToken,
      });
  } catch (err) {
    res.status(500).send(err.message);
    console.log(err)
  }
};

const resetPasswordClient = async(req , res)=> {
    try {
    let schema;
     let role = req.params.role;
     let token = req.params.token;
     let id = req.params.id;
     let secret_key;
     
     if(role === "admin"){
         schema = adminSchema;
          secret_key = process.env.ADMIN_SECRET_KEY
     }else{
      schema = userSchema;
      secret_key = process.env.SECRET_KEY
     }

     let checkToken =  jwt.verify(token , secret_key)
     console.log(token)
     if(checkToken){
      let verifyToken = await schema.findOne({_id:id , "resetPasswordLinks.token":token},{"resetPasswordLinks.$":1})
      if(verifyToken.resetPasswordLinks[0].expire !== true){
        res.render('resetPassword',{ id: id, token: token , role:role })
        let updateToken = await schema.updateOne({_id:id , "resetPasswordLinks.token":token},{$set:{"resetPasswordLinks.$.expire":true}})
      }else{
        res.render('linkUsed')
      }
     }else{
      res.render('invalidLink')
     }
    } catch (err) {
      res.render('invalidLink')
       console.log(err)
    }
};

const resetPassword = async(req , res)=> {
  try {
    let schema;
    let secret_key;
    let role = req.params.role
    let id = req.params.id;
    let password = req.body.password;

    if(role === "admin"){
      schema = adminSchema;
       secret_key = process.env.ADMIN_SECRET_KEY
  }else{
   schema = userSchema;
   secret_key = process.env.SECRET_KEY
  }

  let hashPassword = await bcryptPassword(password)
  let changeUserPassword = await schema.updateOne({_id:id},{$set:{password:hashPassword}})
  res.status(200).send({success:true , msg:"Password Reset Successfully"})
  } catch (err) {
    res.status(500).send(err.message)
  }
};

const changePassword = async(req , res)=> {
  try {
    let user = req.userData;
    console.log(user.password)
    let password = req.body.password;
    let newPassword = req.body.newPassword;

    let checkPassword = await bcryptjs.compare(password , user.password)
    if(checkPassword){
      let hashPassword = await bcryptPassword(newPassword)
      let updatePassword = await user.updateOne({$set:{password:hashPassword}})
      res.status(200).send({success:true , msg:"Password Change Successfully"})
    }else{
      res.status(409).send({success:false , error:"Invalid Credentials" })
    }

  } catch (err) {
    res.status(500).send(err.message)
    console.log(err)
  }
}

const addToFevorate = async(req , res)=> {
  try {
    let user = req.userData;
    let data  = req.body;
    let addRecipe = await user.updateOne({$push:{fevorates:data}})
  if(addRecipe.modifiedCount  > 0 ){
    res.status(200).send({success:true , msg:"Item Added Successfully", update:addRecipe})
  }else{
    res.status(401).send({success:false , error:"Something Went Wrong"})
  }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const removeFromFevorates = async(req , res)=> {
  try {
    let user = req.userData;
    let name = req.params.name;

    let removeRecipe = await userSchema.updateOne(
      {_id: user._id},
      {$pull:{fevorates:{label:name}}})
    console.log(removeRecipe) 
    if(removeRecipe.modifiedCount === 1){
      res.status(200).send({success:true , msg:"Item Removed Successfully"})
    }else{
      res.status(404).send({success:false , error:"Items Not Found"})
    }
  } catch (err) {
    res.status(500).send(err.message)
    console.log(err)
  }
}

const checkUser  = async(req , res)=> {
  try {
    let user = req.userData;
    if(user !== null){
      res.status(200).send(user)
    }else{
      res.status(401).send({success:false , error:"User Unauthorised"})
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const editName = async(req , res)=> {
  try {
    let user = req.userData;
    let name = req.body.name;

    let changeName = await user.updateOne({$set:{name:name}})
    if(changeName.modifiedCount > 0){
      res.status(200).send({success:true , msg:"Updated Successfully"})
    }else{
      res.status(401).send({success:false , error:"Something Went Wrong"})
    }
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const updateImage = async(req , res)=> {
  try {
    let user  = req.userData
    let name = req.params.name;
    let img = req.body.img;

    let upateImg  = await userSchema.updateOne({_id:user._id , "fevorates.label":name},{$set:{"fevorates.$.image":img}})
    if(upateImg.modifiedCount  === 1){
      res.status(200).send({success:true , msg:"Img Updated Successfully",update:upateImg})
    }else{
      res.status(409).send({success:false , error:"Image Not Found"})
    }
  } catch (err) {
    res.status(500).send(err)
  }
}

const logout = async(req , res)=> {
  try { 
    res.clearCookie("EaseRecipies", {
      path:"/",
      secure:false,
      httpOnly:true
    });
    res.status(200).send({success:true , msg:"User Logout Successfully"})
  } catch (err) {
    res.status(500).send(err.message)
  }
}


module.exports = {
  register,
  login,
  forgotPassword,
  resetPasswordClient,
  resetPassword,
  changePassword,
  addToFevorate,
  checkUser,
  editName,
  removeFromFevorates,
  updateImage,
  logout
}
