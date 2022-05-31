const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');




app.set("view engine", "pug"); //told server to use pug as view engine
app.set("views", "views");// where to look to get the pug files templates 

// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));
//this page is handling the route,  server traffic(app )
// router will handle request at that level /login
router.get("/",(req, res, next)=>{ 
    res.status(200).render('login'); 
    
}) 

router.post("/", async(req, res, next)=>{ 

    var payload = req.body;

    if (req.body.logUsername && req.body.logPassword){
        var user = await User.findOne({ // wait until user is returned before next code block
            $or:[          //MnagoDB operator for conditions
              {username: req.body.logUsername},
              {email: req.body.logUsername}
            ]
        })
        .catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong";
            res.status(200).render("login", payload);
        });

        if (user != null){
            var result = await bcrypt.compare(req.body.logPassword, user.password);

            if(result === true){
                req.session.user = user;
                return res.redirect("/");
            }


        }
        payload.errorMessage = "Incorrect Credentials";
        return res.status(200).render("login", payload); //return this so it doesn't proceed to next block 

    }
    payload.errorMessage = "Make sure you fill out each field correctly.";
    res.status(200).render("login"); 
    
}); 

module.exports = router; // //export from router file so we can use it in other files 