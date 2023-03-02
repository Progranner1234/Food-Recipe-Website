const express = require('express')
const user_route = express()
const cookieParser  = require('cookie-parser')
user_route.use(cookieParser())
const userController = require('../controllers/userController')
const userMiddleware = require('../middleware/userMiddleware')
const limitApiAccess = require('../middleware/limitApiAccess')

user_route.post('/register',limitApiAccess, userController.register)
user_route.post('/login',limitApiAccess,  userController.login)
user_route.get('/user-data',limitApiAccess , userMiddleware , userController.checkUser)
user_route.post('/edit-name' , limitApiAccess , userMiddleware , userController.editName)
user_route.put('/add-to-fevorates' , limitApiAccess , userMiddleware , userController.addToFevorate)
user_route.post('/change-password',limitApiAccess , userMiddleware , userController.changePassword)
user_route.post('/forgot-password',limitApiAccess,userController.forgotPassword)
user_route.get('/reset-password/:role/:id/:token',userController.resetPasswordClient)
user_route.post('/reset-password/:role/:id/:token',userController.resetPassword)
user_route.get('/success',limitApiAccess,async(req , res)=> {res.render('success')})
user_route.delete('/remove-from-fevorates/:name',limitApiAccess , userMiddleware , userController.removeFromFevorates)
user_route.put('/update-image-url/:name',limitApiAccess , userMiddleware, userController.updateImage)
user_route.get('/logout' , limitApiAccess , userController.logout)


module.exports  = user_route;
