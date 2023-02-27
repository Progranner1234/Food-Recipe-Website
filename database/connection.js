const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

mongoose.connect(process.env.DB_URL , (err)=> {
    if(!err){
        console.log("Database Connected Successfully !!")
    }else{
        console.log(err)
    }
})