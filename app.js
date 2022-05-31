const express = require('express');
const app = express();
const pug = require('pug');
const port = 3003; 
const middleware = require('./middleware'); // looking in the root directory
const path = require('path'); //using the build in path library 
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require("express-session");


const server = app.listen(port, ()=>{console.log("server listening on port " + port)});

app.set("view engine", "pug"); //told server to use pug as view engine
app.set("views", "views") // where to look to get the pug files templates 

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, "public"))); //static file path 


app.use(session({
    secret: "soccer",
    resave: true,
    saveUninitialized: false
  }));

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes/PostRoutes');
const profileRoute = require('./routes/profileRoutes');

//Api Routes
const postsApiRoute = require('./routes/api/posts');


app.use("/login", loginRoute); // tell app to use login route 
app.use("/register", registerRoute); // tell app to use login route 
app.use("/logout", logoutRoute); // tell app to use lgout route
app.use("/posts", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);

app.use("/api/posts", postsApiRoute); // tell app to use post api



app.get("/",middleware.requireLogin,(req, res, next)=>{ //res to send data back after req is done, root level
    //we're using templates to show the webpages (pug)
    // add middleware to check if user is logged in before going to the home page
    // middleware is a step before getting response from the request

    var payload = {
        pageTitle: "Home",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
      }

      //takes two parameters , the page to render and data to send to it
      res.status(200).render("home", payload); 
    
})