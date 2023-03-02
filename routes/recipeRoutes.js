const express = require('express')
const recipe_routes = express()
const cookieParser  = require('cookie-parser')
recipe_routes.use(cookieParser())
const recipeController = require('../controllers/recipeController')

recipe_routes.post('/recipe',recipeController.getRecipe)



module.exports = recipe_routes;