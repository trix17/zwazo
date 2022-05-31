mongoose = require("mongoose");

class Database{

  constructor(){
    this.connect();
  }


  connect(){
    mongoose.connect("mongodb+srv://admin:admin@twitterclonecluster.xydpx.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority")
    .then(()=>{
    console.log("database connection successfully");
    })// return successfully go to then
  
    .catch((err) =>{
    console.log("database connection error" + err);
    })
  }
}

module.exports = new Database();
