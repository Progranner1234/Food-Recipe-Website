const limitApiAccess = async(req , res , next)=> {
    try {
        let origin = req.get('Origin')
        if(origin === "http://localhost:5173"){
            next();
        }else{
            res.render('unAuthorised')
        }
    } catch (err) {
        res.status(500).send(err.message)
    }
}


module.exports = limitApiAccess;