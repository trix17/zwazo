const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');



// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));

router.get("/:id",(req, res, next)=>{ 

    var payload = {
        pageTitle: "View post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
      }
    res.status(200).render("postPage", payload); 
    
}) 
 
module.exports = router; // //export from router file so we can use it in other files 