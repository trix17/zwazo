
$("#postTextarea, #replyTextarea").keyup(event =>{
    var textbox = $(event.target);
    var value = textbox.val().trim();
    
    var isModal = textbox.parents(".modal").length == 1;

    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");
    if (submitButton.length == 0 ) return alert("No submit button found");

    if(value == ""){
        submitButton.prop("disabled", true); //button property is disabled if value is empty 
        return;
    }

    submitButton.prop("disabled", false);  

})


$("#submitPostButton, #submitReplyButton").click(()=>{
    var button = $(event.target);
    var isModal = button.parents(".modal").length == 1;
    //if is modal set text box to be for the modal textarea
    var textbox = isModal ? $("#replyTextarea") : $("#postTextarea") ;
    var data = {
        content: textbox.val()
    }

    if(isModal){
        var id = button.data().id;
        if (id == null) return alert("button id is null");
        data.replyTo  = id;

    }
    //will send data to end point that will handle creating the post
    // creating REST API to handle everything back end 
    //submit post or get to api/posts and REST API send newly created post
    $.post("/api/posts", data, postData=>{
        if(postData.replyTo){
            location.reload();
        }
        else{
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);             //prepend add it at the beginning 
            textbox.val("");
            button.prop("disabled", true);

        }
      
    })
    

})
//fire an event when modal is open , boostrap even allows us to know if it is open
$("#replyModal").on("show.bs.modal", (event)=>{
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results=>{
        outputPosts(results.postData, $("#originalPostContainer"));
        
    })
})


// avoid latency 
$("#replyModal").on("hidden.bs.modal", ()=>{
    $("#originalPostContainer").html("");})

$("#deletePostModal").on("show.bs.modal", (event)=>{
    
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
})

$("#deletePostButton").click((event)=>{
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",  //DELETE request 
        success: ()=>{
            location.reload();
        }

    })


})



// we use document not actual name because button is there when page loads 
$(document).on("click", ".LikeButton",(event)=>{ //the whole page listens to click on likebutton class
    var button = $(event.target);
    var postId = getPostIdFromElement(button);    

    if (postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",  //put request to update the likes when user likes 
        success: (postData)=>{
            //console.log(postData.likes.length);
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)){
                button.addClass("active");
            }

            else {
                button.removeClass("active");

            }           

        }

    })

})

//Retweet logic 
$(document).on("click", ".retweetButton",(event)=>{ //the whole page listens to click on likebutton class
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    

    if (postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",  
        success: (postData)=>{
            //console.log(postData)
           
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)){
                button.addClass("active");
            }

            else {
                button.removeClass("active");

            }
        }
    })


})


//to show post when clcik on 
$(document).on("click", ".post",(event)=>{
    var element = $(event.target);
    var postId = getPostIdFromElement(element);

    // two logic because if it is a element is a button just ignore it 
    if (postId !== undefined && !element.is("button")){
        window.location.href = '/posts/'+ postId;
    }

})



function getPostIdFromElement(element){
    var isRoot = element.hasClass("post");
    var rootElement = isRoot ? element: element.closest(".post"); //.closest is jq function to go up tree to
    //find the parent with specified selector 
    var postId = rootElement.data().id; //data function on object to get data attributes 
    if (postId === undefined ) return alert("Post id not defined");

    return postId;
    
}

// large font is defaulted to false if you don't specify 
function createPostHtml(postData, largeFont = false){
    if (postData == null) return alert("post is null");


    //check for retweet
    var isRetweet = postData.retweetData !== undefined;
    var retweetedBy = isRetweet ? postData.postedBy.username : null;
    postData = isRetweet ? postData.retweetData : postData;
    
    var postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return console.log("User object not populated")
    }


    var displayName = postedBy.firstName+"" +postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likebuttonActiveClass =postData.likes.includes(userLoggedIn._id) ? "active" : "";
    //keeps button in the same state when resfresh 
    var reteweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    var largeFontClass = largeFont? "largeFont" : " ";

    var retweetText = '';
    if (isRetweet) {
        retweetText = `<span>
        <i class="fa fa-retweet"></i>
         Retweeted by <a href='/profile/${retweetedBy}'> @${retweetedBy}</a>
         </span>`
    }

    var replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){

        if(!postData.replyTo._id){
            return alert("reply to is not populated");
        }
        else if(!postData.replyTo.postedBy._id){
            return alert("Posted By is not populated");
        }
        var replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class="replyFlag">
                        Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
                    </div>`;
    }

    // delete post 
    var buttons = "";
    //post belongs to the logged in user
    if (postData.postedBy._id == userLoggedIn._id){
        buttons = `<button type="button" data-id ="${postData._id}" data-bs-toggle ="modal" data-bs-target ="#deletePostModal"><i class="fas fa-times"></i></button>`
    }

    // add id to each post
    return `<div class="post ${largeFontClass}"data-id='${postData._id}'> 
                <div class="postActionContainer">
                    ${retweetText}
                </div>
                <div class="mainContentContainer">
                    <div class="userImageContainer">
                        <img src='${postedBy.ProfilePic}'>
                    </div>
                    <div class="postContentContainer">
                        <div class="header">
                            <a href="/profile/${postedBy.username}" class="displayName">${displayName}</a>
                            <span class="username">@${postedBy.username}</span>
                            <span class="date">${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class="postBody">
                            <span> ${postData.content} </span>
                        </div>
                        <div class="postFooter">
                            <div class="postButtonContainer"> 
                               <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
                                    <i class="far fa-comment"></i>
                               </button>
                            </div>
                            <div class="postButtonContainer green">
                               <button class="retweetButton ${reteweetButtonActiveClass}">
                                    <i class="fa fa-retweet"></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                               </button>
                            </div>
                            <div class="postButtonContainer red">
                               <button class="LikeButton ${likebuttonActiveClass}">
                                    <i class="far fa-heart"></i>
                                    <span>${postData.likes.length || ""}</span>
                               </button> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}
//if val evaluate to greater than zero uses the length if not it is 0


function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just Now";
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return  Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return  Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){

    container.html("");

    if (!Array.isArray(results)){
        results = [results];
    }
    results.forEach(result => { //for each looping over the list result
        var html = createPostHtml(result)
        container.append(html);
    });

    if (results.length == 0 ){
        container.append("<span class='noResults'>Nothing to show </span>");
    }
}

function outputPostsWithReplies(results, container){

    container.html("");
    if (results.replyTo !== undefined && results.replyTo._id !== undefined){
        var html = createPostHtml(results.replyTo)
        container.append(html);

    }
    var mainPostHtml = createPostHtml(results.postData, true)
    container.append(mainPostHtml);


    results.replies.forEach(result => { //for each looping over the list result
        var html = createPostHtml(result)
        container.append(html);
    });

}
