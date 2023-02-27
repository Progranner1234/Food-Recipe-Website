const express = require('express')
const app = express();
require('dotenv').config()
const cors = require('cors');
const user_route = require('./routes/userRoutes');
require('./database/connection')
const recipe_routes = require('./routes/recipeRoutes')
const path = require('path')

app.use(express.json())
app.use(cors({credentials:true , origin:true}))
app.set('view engine','ejs');
app.use('/images',express.static('images'))
app.use('/api/v1' , user_route)
app.use('/api/v1',recipe_routes)

app.use(express.static(path.join(__dirname,'./client/dist')))
app.get('*',function(req , res){
    res.sendFile(path.join(__dirname , './client/dist/index.html'))
})

app.listen(process.env.PORT , ()=> {
    console.log(`Started On PORT ${process.env.PORT}`)
})