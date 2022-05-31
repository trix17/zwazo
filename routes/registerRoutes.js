const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');

app.set("view engine", "pug");
app.set("views", "views ");

// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));



router.get("/",(req, res, next)=>{

  res.status(200).render('register');
})


// async spefies how in the order the code needs to run 
router.post("/",async(req, res, next)=>{
  
  var firstName = req.body.firstName.trim();
  var lastName = req.body.lastName.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var password = req.body.password;

  var payload = req.body;

  if (firstName && lastName && username && email && password){
    //Query
    var user = await User.findOne({ // wait until user is returned before next code block
      $or:[          //MnagoDB operator for conditions
        {username: username},
        {email: email}
      ]
    })
    .catch((error)=>{
      console.log(error);
      payload.errorMessage = "Something went wrong";
      res.status(200).render("register", payload);
    });

    if(user == null){
      // we go ahead and insert it 
      var data = req.body;
      data.password = await bcrypt.hash(password, 10); // 10 times to hash pass
      
      User.create(data)
      .then((user)=>{
            req.session.user = user;
            return res.redirect("/");
      })
    }
      
    else {
      // User is found
      if (email == user.email){
        payload.errorMessage = "Email is already in use";
         }
        
      else{
        payload.errorMessage = "Username is already in use";
         }
        
      res.status(200).render("register", payload);
        }
    }

  
  else {
    payload.errorMessage = "Make sure you fill out each field";
    res.status(200).render("register", payload);
  }
});

module.exports = router;

// install body parser 