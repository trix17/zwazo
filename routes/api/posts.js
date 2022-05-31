const express = require("express"); //express depedency 
const app = express(); // create instance of express app var
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/UserSchema"); 
const Post = require("../../schemas/PostSchema"); 
const { ConnectionPoolClosedEvent } = require("mongodb");




// Body-parser middleware
app.use(bodyParser.urlencoded({extended:false}));

router.get("/", async (req, res, next)=>{ 
    var searchObj = req.query;
    if (searchObj.isReply != undefined){
        var isReply = searchObj.isReply == "true";
        searchObj.replyTo = { $exists: isReply}; //exists is Mango DB obj
        delete searchObj.isReply;
        console.log(searchObj)
    }

    var results = await getPosts(searchObj);
    res.status(200).send(results);
}) 


router.get("/:id", async(req, res, next)=>{ 
    var postId = req.params.id;

    var postData = await getPosts({_id: postId});
    postData = postData[0];

    var results = {
        postData: postData
    }

    if(postData.replyTo !== undefined){
        results.replyTo = postData.replyTo;
    }
    // any post without repyto field and same ost id won't be returned 
    results.replies = await getPosts({ replyTo: postId })


    res.status(200).send(results);
}) 

router.post("/", async(req, res, next)=>{ 
    if (req.body.replyTo) {
        console.log(req.body.replyTo);
    }
    if (!req.body.content){
        console.log(" Content not sent with request");
        return res.sendStatus(400);
    }
    
    
    var postData = {
        content: req.body.content,
        postedBy: req.session.user
    }

    if(req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async newPost =>{
        newPost = await User.populate(newPost, {path: "postedBy"})
        res.status(201).send(newPost);

    })

    .catch(error =>{
        console.log(error);
        res.sendStatus(400);

    })
    
}); 

// name it id because wew referred to it in the code
router.put("/:id/like", async(req, res, next)=>{
    
    var postId = req.params.id;
    var userId = req.session.user._id;   //current userlogin i 


    var isLiked = req.session.user.likes &&  req.session.user.likes.includes(postId);

    var option = isLiked ? "$pull":"$addToSet" //conditional statement logic 
    
    
    //add user like, new:true to get a newly updated user
    req.session.user = await User.findByIdAndUpdate(userId,{[option]: {likes:postId}}, {new:true})
    .catch(error =>{
        console.log(error);
        res.status(400);
    })

    //add post like 
    var post = await Post.findByIdAndUpdate(postId,{[option]: {likes:userId}}, {new:true})
    .catch(error =>{
        console.log(error);
        res.status(400);
    })

    res.status(200).send(post)
    })
    
router.post("/:id/retweet", async(req, res, next)=>{
    
    
    var postId = req.params.id;
    var userId = req.session.user._id;   //current userlogin i 


    // try delete retweet 
    var deletedPost = await Post.findOneAndDelete({postedBy: userId, retweetData: postId})
    .catch(error =>{
        console.log(error);
        res.status(400);
    })

    var option = deletedPost != null ? "$pull" : "$addToSet";  //conditional statement logic 
    var repost = deletedPost;

    if (repost == null){
        repost = await Post.create({postedBy: userId, retweetData: postId})
        .catch(error =>{
            console.log(error);
            res.status(400);
        })
    }

    //add user like, new:true to get a newly updated user
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id}}, {new:true})
    .catch(error =>{
        console.log(error);
        res.status(400);
    })

    //add post like 
    var post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers:userId  } }, { new: true})
    .catch(error =>{
        console.log(error);
        res.sendStatus(400);
    })

    res.status(200).send(post)
    })

    // delete came from the ajax call type
router.delete("/:id/", (req, res, neext)=>{
    Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error =>{
        console.log(error);
        res.sendStatus(400);
    })
})

async function getPosts(filter){
    var results = await Post.find(filter)
    .populate("postedBy") //populate the username and name of the user 
    .populate("retweetData") // showing the data instead of the postid 
    .populate("replyTo") // reply to 
    .sort({"createdAt":-1}) //posted from newest to oldest 
    .catch(error=> console.log(error))

    results = await User.populate(results,{path:"replyTo.postedBy"})
    return await User.populate(results,{path:"retweetData.postedBy"});
}
module.exports = router; // //export from router file so we can use it in other files 