// Set up a cache dictionary to store classification result for
// tweets that have been classified before.
const classification_cache = new Map<string, boolean>();

function checkVisible(elm: HTMLElement): boolean {
  const rect = elm.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function clean_twitter(): void {
  // Check whether twitter is enabled
  chrome.storage.sync.get(["twitter"]).then((result: { [key: string]: any }) => {
    if (result.twitter == null) {
      result.twitter = true;
    }
    if (result.twitter) {
      // All tweet containers:
      const containers = document.querySelectorAll("article[data-testid='tweet']");
      const tweets: string[] = [];

      const filter = Array.prototype.filter;
      const visibleContainers = filter.call(containers, (container: Element) => {
        return checkVisible(container as HTMLElement);
      });

      // Only keep tweets that have not been classified before.
      const new_tweets: string[] = [];
      const new_container: Element[] = [];
      for (let i = 0; i < visibleContainers.length; i++) {
        // Find the outermost div with data-testid="tweetText" and get the text content
        const txt_div = visibleContainers[i].querySelector("div[data-testid='tweetText']");
        if (txt_div == null) {
          tweets.push("");
          continue;
        }

        const tweet = txt_div.textContent.replaceAll("\n", "");
        tweets.push(tweet);

        // Partially hide tweets that have not been classified yet.
        const parent = visibleContainers[i].closest("div[data-testid='cellInnerDiv']");
        if (!classification_cache.has(tweets[i]) && parent) {
          parent.style.opacity = "0.3";
        }

        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
          new_tweets.push(tweet);
          new_container.push(visibleContainers[i]);
        }
      }

      // If there are no new tweets, return
      if (new_tweets.length == 0) {
        return;
      }

      chrome.storage.sync.get(["preference", "openai_api_key"]).then((result: { [key: string]: any }) => {
        const data = {
          messages: new_tweets,
          preference: result.preference,
          openai_api_key: result.openai_api_key,
        };

        // Send the data to the server and log the response to console
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));

        xhr.onloadend = function () {
          const response = JSON.parse(xhr.responseText);

          for (let i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            classification_cache.set(new_tweets[i], response[i]);
          }

          for (let i = 0; i < visibleContainers.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!classification_cache.has(tweets[i])) {
              continue;
            }
            const keep = classification_cache.get(tweets[i]);
            if (!keep) {
              // Find and hide the closest parent div with data-testid="cellInnerDiv"
              visibleContainers[i].closest("div[data-testid='cellInnerDiv']").style.display = "none";
            } else {
              // Set opacity to 1
              visibleContainers[i].closest("div[data-testid='cellInnerDiv']").style.opacity = "1";
            }
          }
        };
      });
    }
  });
}

function clean_linkedin(): void {
  // Check whether linkedin is enabled
  chrome.storage.sync.get(["linkedin"]).then((result: { [key: string]: any }) => {
    if (result.linkedin == null) {
      result.linkedin = true;
    }
    if (result.linkedin) {
      // All tweet containers:
      const containers = document.querySelectorAll("div.feed-shared-update-v2.artdeco-card");
      const tweets: string[] = [];
      const filter = Array.prototype.filter;
      const visibleContainers = filter.call(containers, (container: Element) => {
        return checkVisible(container as HTMLElement);
      });

      // Only keep tweets that have not been classified before.
      const new_tweets: string[] = [];
      const new_container: Element[] = [];

      for (let i = 0; i < visibleContainers.length; i++) {
        // Find the outermost div and get the text content
        const txt_div = visibleContainers[i].querySelector("div.update-components-text.relative.feed-shared-update-v2__commentary");

        if (txt_div == null) {
          tweets.push("");
          continue;
        }

        const tweet = txt_div.textContent.replaceAll("\n", "");
        tweets.push(tweet);

        // Partially hide tweets that have not been classified yet.
        if (!classification_cache.has(tweets[i])) {
          visibleContainers[i].style.opacity = "0.3";
        }

        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
          new_tweets.push(tweet);
          new_container.push(visibleContainers[i]);
        }
      }

      // If there are no new tweets, return
      if (new_tweets.length == 0) {
        return;
      }

      chrome.storage.sync.get(["preference", "openai_api_key"]).then((result: { [key: string]: any }) => {
        const data = {
          messages: new_tweets,
          preference: result.preference,
          openai_api_key: result.openai_api_key,
        };

        // Send the data to the server and log the response to console
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));
        xhr.onloadend = function () {
          const response = JSON.parse(xhr.responseText);

          for (let i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            classification_cache.set(new_tweets[i], response[i]);
          }

          for (let i = 0; i < visibleContainers.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!classification_cache.has(tweets[i])) {
              continue;
            }
            const keep = classification_cache.get(tweets[i]);
            if (!keep) {
              // Find and hide
              visibleContainers[i].style.display = "none";
            } else {
              // Set opacity to 1
              visibleContainers[i].style.opacity = "1";
            }
          }
        };
      });
    }
  });
}

function clean_zhihu(): void {
  // Check whether zhihu is enabled
  chrome.storage.sync.get(["zhihu"]).then((result: any) => {
    if (result.zhihu == null) {
      result.zhihu = true;
    }
    if (result.zhihu) {
      // All tweet containers:
      let containers = document.querySelectorAll(".Card.TopstoryItem");
      let tweets: string[] = [];

      let filter = Array.prototype.filter;
      let visibleContainers = filter.call(containers, function (container: Element) {
        return checkVisible(container as HTMLElement);
      });

      // Only keep tweets that have not been classified before.
      let new_tweets: string[] = [];
      let new_container: Element[] = [];
      for (let i = 0; i < visibleContainers.length; i++) {
        let author: string, title: string;
        const contentItem = visibleContainers[i].querySelector(".ContentItem");
        if (contentItem && contentItem.dataset.zop) {
          const author_and_title = JSON.parse(contentItem.dataset.zop);
          author = author_and_title.authorName;
          title = author_and_title.title;
        } else {
          title = contentItem.querySelector(".QuestionItem-title").textContent;
          author = "";
        }
        const main_text = contentItem.querySelector(".RichText.ztext").textContent.replaceAll("\n", "");
        const tweet = `Author: ${author}, Title: ${title}, Body: ${main_text}`;

        tweets.push(tweet);
        // If tweet is new, add it to the list of tweets and add article to filtered_articles and add tweet to cache
        if (!classification_cache.has(tweet)) {
          new_tweets.push(tweet);
          new_container.push(containers[i]);
          visibleContainers[i].style.opacity = "0.3";
        }
      }

      // If there are no new tweets, return
      if (new_tweets.length == 0) {
        return;
      }

      chrome.storage.sync.get(["preference", "openai_api_key"]).then((result: any) => {
        const preference = result.preference;
        const data = {
          messages: new_tweets,
          preference: preference,
          openai_api_key: result.openai_api_key,
        };

        // Send the data to the server and log the response to console
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://hiubwe6637gmpslsccd4ofi3de0yaeqa.lambda-url.us-east-2.on.aws/");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(data));

        xhr.onloadend = function () {
          const response = JSON.parse(xhr.responseText);

          for (let i = 0; i < response.length; i++) {
            // Set the cache to the corresponding response for the tweet
            classification_cache.set(new_tweets[i], response[i]);
          }

          for (let i = 0; i < visibleContainers.length; i++) {
            // If the cache does not contain the tweet, log the error
            if (!classification_cache.has(tweets[i])) {
              continue;
            }
            const keep = classification_cache.get(tweets[i]);
            if (!keep) {
              // Find and hide the closest parent div with data-testid="cellInnerDiv"
              visibleContainers[i].style.display = "none";
            } else {
              // Set opacity to 1
              visibleContainers[i].style.opacity = "1";
            }
          }
        };
      });
    }
  });
}

let inProgress = false;

// Run every 3 seconds.
setInterval(() => {
  // Prevent multiple instances from running at the same time.
  if (inProgress) {
    return;
  }

  inProgress = true;

  // If the user is on Twitter, run the Twitter extension
  if (window.location.href === "https://twitter.com/home" || window.location.href === "https://www.twitter.com/home") {
    clean_twitter();
  } else if (window.location.href === "https://www.linkedin.com/feed/" || window.location.href === "https://linkedin.com/feed/") {
    // If the user is on LinkedIn, run the LinkedIn extension
    clean_linkedin();
  } else if (window.location.href === "https://www.zhihu.com/" || window.location.href === "https://www.zhihu.com/follow") {
    // If the user is on Zhihu, run the Zhihu extension
    clean_zhihu();
  } else {
    // do nothing
  }

  inProgress = false;
}, 3000);
