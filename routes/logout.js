const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');



// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));
//this page is handling the route,  server traffic(app )
// router will handle request at that level /login
router.get("/",(req, res, next)=>{ 
    if(req.session){
        req.session.destroy(()=>{
            res.redirect("/login")
        })
    }
    
}) 



module.exports = router; // //export from router file so we can use it in other files 