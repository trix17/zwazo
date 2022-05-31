const mongoose = require('mongoose');
const { Schema } = mongoose;



const UserSchema = new Schema({
    // String is shorthand for {type: String}
    firstName: {type: String, required: true,trim: true },
    lastName: {type:  String, required: true, trim: true },
    username: {type: String, required: true,trim: true, unique: true },
    email: {type: String, required: true,trim: true, unique: true },
    password: {type: String, required: true },
    ProfilePic: {type: String, default:"/images/profilePic.jpg"},
    likes: [{type: Schema.Types.ObjectId, ref:'Post'}], 
    retweets: [{type: Schema.Types.ObjectId, ref:'Post'}], 
    following: [{type: Schema.Types.ObjectId, ref:'User'}],
    followers: [{type: Schema.Types.ObjectId, ref:'User'}]
},{timestamps : true }); // added the created date in MangoDB

var User = mongoose.model('User', UserSchema)

module.exports = User;