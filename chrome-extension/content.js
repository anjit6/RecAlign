// Set up a cache dictionary to store tweets that have been seen before
var cache = new Map();

function clean() {
    console.log("Extension running...");
    var articles = document.querySelectorAll("article[data-testid='tweet']");
    var all_tweets = [];

    // for (var i = 0; i < articles.length; i++) {
    //     console.log("[DISCOVERY]", articles[i].textContent.replaceAll("\n", ""));
    // }
    var tweets = [];
    var filtered_articles = [];
    for (var i = 0; i < articles.length; i++) {
        // Find the outermost div with data-testid="tweetText" and get the text content
        var txt_div = articles[i].querySelector("div[data-testid='tweetText']");
        if (txt_div == null) {
            console.log("[DISCOVERY] fail to find tweet text for " +  articles[i].textContent.replaceAll("\n", ""));
            all_tweets.push("");
            continue;
        }
        var tweet = txt_div.textContent.replaceAll("\n", "");
        all_tweets.push(tweet);
        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!cache.has(tweet)) {
            tweets.push(tweet);
            filtered_articles.push(articles[i]);
        }
    }

    // If there are no new tweets, return
    if (tweets.length == 0) {
        return;
    }

    preference = "I like reading about adademic research on AI.";
    var data = {
        "messages": tweets,
        "preference": preference
    };

    // Send the data to the server and log the response to console
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
    xhr.onloadend = function() {
        var response = JSON.parse(xhr.responseText);
        console.log("[BACKEND]", response);
        for (var i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            cache.set(tweets[i], response[i]);
        }

        for (var i = 0; i < articles.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!cache.has(all_tweets[i])) {
                console.log("[ERROR] cache does not contain tweet " + tweets[i]);
                continue;
            }
            var keep = cache.get(all_tweets[i]);
            if (!keep) {
                // Find and hide the closest parent div with data-testid="cellInnerDiv"
                articles[i].closest("div[data-testid='cellInnerDiv']").style.display = "none";
                console.log("[REMOVE] tweet" + articles[i].textContent.replaceAll("\n", ""));
            } else {
                console.log("[KEEP] keeping tweet" + articles[i].textContent.replaceAll("\n", ""));
            }
        }
    }
}

// Run every 5 secondS, but prevent multiple instances from running at the same time
setInterval(function() {
    if (this.inProgress) {
        return;
    }
    this.inProgress = true;
    clean();
    this.inProgress = false;
}, 5000);