const express = require('express')
const recipe_routes = express()
const cookieParser  = require('cookie-parser')
recipe_routes.use(cookieParser())
const recipeController = require('../controllers/recipeController')
const userMiddleware = require('../middleware/userMiddleware')
const limitApiAccess = require('../middleware/limitApiAccess')

recipe_routes.post('/recipe',recipeController.getRecipe)
recipe_routes.post('/get-nutrients',recipeController.getNutritionValue)



module.exports = recipe_routes;