var tabUrl = "";
var websites = "";
var query = { active: true, currentWindow: true };

//check if new tab is selected, update badge number
chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query(query, (tabs) => {
    tabUrl = tabs[0].url;
    console.log("active web: ", tabs[0].url);
    chrome.storage.local.get("websites", function (result) {
      console.log("event.js", result.websites);
      websites = result.websites;
      if (websites) {
        for (var websiteKey in websites) {
          console.log(websites[websiteKey]["website"]);
          //check if website records exists
          if (websites[websiteKey]["website"] == tabUrl) {
            console.log("record exists");
            removedElements = websites[websiteKey]["removedElements"];
            numberOfRemovedElement = removedElements.length;
            //remove elements
            if (removedElements) {
              chrome.browserAction.setBadgeText({
                text: `${numberOfRemovedElement}`,
              });
            }
          }
        }
      } else {
        console.log("record not exists 2");
        chrome.browserAction.setBadgeText({
          text: `0`,
        });
      }
    });
  });
});

//listen to any change in storage, update badge number
chrome.storage.onChanged.addListener((result, storageName) => {
  chrome.tabs.query(query, (tabs) => {
    tabUrl = tabs[0].url;
    console.log("active web: ", tabs[0].url);
    //alert(tabs[0].url);
    console.log("event.js", result.websites.newValue);
    websites = result.websites.newValue;
    if (websites) {
      for (var websiteKey in websites) {
        console.log(websites[websiteKey]["website"]);
        //check if website records exists
        if (websites[websiteKey]["website"] == tabUrl) {
          removedElements = websites[websiteKey]["removedElements"];
          numberOfRemovedElement = removedElements.length;
          //remove elements
          if (removedElements) {
            chrome.browserAction.setBadgeText({
              text: `${numberOfRemovedElement}`,
            });
          }
        }
      }
    } else {
      chrome.browserAction.setBadgeText({
        text: `0`,
      });
    }
  });
});
