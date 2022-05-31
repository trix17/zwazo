const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');



// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));

router.get("/",(req, res, next)=>{ 

    var payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user
      }
    res.status(200).render("profilePage", payload); 
    
}) 
router.get("/:username", async(req, res, next)=>{ 
    var payload = await getPayload(req.params.username, req.session.user);
    res.status(200).render("profilePage", payload);
})
router.get("/:username/replies", async(req, res, next)=>{ 
    var payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "replies"

    res.status(200).render("profilePage", payload);
})




async function getPayload(username, userLoggedIn){
    var user = await User.findOne({username: username})

    if (user == null){
        
        user = await User.findById(username);
        
        if (user == null){
            return {
                pageTitle: "User not found",
                userLoggedIn: userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn)
            }
        }
    }
    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user
    }
}
 
module.exports = router; // //export from router file so we can use it in other files 