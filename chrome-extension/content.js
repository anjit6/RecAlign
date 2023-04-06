// Set up a cache dictionary to store classification result for
// tweets that have been classified before.
var classification_cache = new Map();

function clean() {
    console.log("Extension running...");
    // All tweet containers:
    var containers = document.querySelectorAll("article[data-testid='tweet']");
    var tweets = [];

    // Only keep tweets that have not been classified before.
    var new_tweets = [];
    var new_container = [];
    for (var i = 0; i < containers.length; i++) {
        // Find the outermost div with data-testid="tweetText" and get the text content
        var txt_div = containers[i].querySelector("div[data-testid='tweetText']");
        if (txt_div == null) {
            console.log("[DISCOVERY] fail to find tweet text for " + containers[i].textContent.replaceAll("\n", ""));
            tweets.push("");
            continue;
        }
        var tweet = txt_div.textContent.replaceAll("\n", "");
        tweets.push(tweet);
        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
            new_tweets.push(tweet);
            new_container.push(containers[i]);
        }
    }

    // If there are no new tweets, return
    if (new_tweets.length == 0) {
        return;
    }

    chrome.storage.sync.get(["preference"]).then((result) => {
        console.log("Value currently is " + result.preference);
        preference = result.preference;
        var data = {
            "messages": new_tweets,
            "preference": preference
        };

        // Send the data to the server and log the response to console
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        console.log("[Backend]", "Request sent...");
        xhr.onloadend = function () {
            var response = JSON.parse(xhr.responseText);
            console.log("[BACKEND]", response);
            for (var i = 0; i < response.length; i++) {
                // Set the cache to the corresponding response for the tweet
                classification_cache.set(new_tweets[i], response[i]);
            }

            for (var i = 0; i < containers.length; i++) {
                // If the cache does not contain the tweet, log the error
                if (!classification_cache.has(tweets[i])) {
                    console.log("[ERROR] cache does not contain tweet " + new_tweets[i]);
                    continue;
                }
                var keep = classification_cache.get(tweets[i]);
                if (!keep) {
                    // Find and hide the closest parent div with data-testid="cellInnerDiv"
                    containers[i].closest("div[data-testid='cellInnerDiv']").style.display = "none";
                    console.log("[REMOVE] tweet" + containers[i].textContent.replaceAll("\n", ""));
                } else {
                    console.log("[KEEP] keeping tweet" + containers[i].textContent.replaceAll("\n", ""));
                }
            }
        }
    });
}

// Run every 5 seconds.
setInterval(function () {
    // Prevent multiple instances from running at the same time.
    if (this.inProgress) {
        return;
    }
    this.inProgress = true;
    clean();
    this.inProgress = false;
}, 5000);