const mongoose = require('mongoose');
const { Schema } = mongoose;



const PostSchema = new Schema({
    // String is shorthand for {type: String}
    content: {type: String, trim: true },
    postedBy: {type: Schema.Types.ObjectId, ref:'User'},//mdb can populate it with the right object 'User'
    pinned: Boolean,
    likes: [{type: Schema.Types.ObjectId, ref:'User'}], 
    retweetUsers: [{type: Schema.Types.ObjectId, ref:'User'}], 
    retweetData: {type: Schema.Types.ObjectId, ref:'Post'},
    replyTo: {type: Schema.Types.ObjectId, ref:'Post'},  
},{timestamps : true }); // added the created date in MangoDB

var Post = mongoose.model('Post', PostSchema)

module.exports = Post;