const limitApiAccess = async(req , res , next)=> {
    try {
        let origin = req.get('Origin')
        if(origin === "https://recipe-mern-app.onrender.com/"){
            next();
        }else{
            res.render('unAuthorised')
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}


module.exports = limitApiAccess;