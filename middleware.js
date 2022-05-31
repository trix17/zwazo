exports.requireLogin = (req, res, next)=>{ 
    // check the require login function to make sure 
    if (req.session && req.session.user){
        return next(); // next function take user to the root home page from the app.js file 
    }
    else {
        return res.redirect('/login');
    }
}