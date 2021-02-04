//check if new tab is selected, update badge number
chrome.tabs.onSelectionChanged.addListener(() => {
  loadBadgeNotification();
});
//check if new tab is selected, update badge number
chrome.tabs.onCreated.addListener(() => {
  loadBadgeNotification();
});
//check if new tab is selected, update badge number
chrome.webNavigation.onCommitted.addListener(() => {
  loadBadgeNotification();
});
//listen to any change in storage, update badge number
chrome.storage.onChanged.addListener((result, storageName) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var isWebsiteFound = false;
    var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
    console.log("[+] event.js website selected", currentWebsite);
    if (currentWebsite == "") {
      console.log("[-] event.js no website available");
      return;
    }
    var websites = result.websites.newValue;
    if (websites) {
      for (var websiteKey in websites) {
        //check if website records exists
        if (websites[websiteKey]["website"] == currentWebsite) {
          isWebsiteFound = true;
          removedElements = websites[websiteKey]["removedElements"];
          numberOfRemovedElement = removedElements.length;
          //remove elements
          if (removedElements) {
            chrome.browserAction.setBadgeText({
              text: `${numberOfRemovedElement}`,
            });
          } else {
            chrome.browserAction.setBadgeText({
              text: `0`,
            });
          }
        }
      }
    }
    if (!isWebsiteFound) {
      console.log("[-] event.js no website available");
      chrome.browserAction.setBadgeText({
        text: `0`,
      });
    }
  });
});

function loadBadgeNotification() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var isWebsiteFound = false;
    var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
    console.log("[+] event.js website selected", currentWebsite);
    chrome.storage.local.get("websites", function (result) {
      var websites = result.websites;
      if (websites) {
        for (var websiteKey in websites) {
          //check if website records exists
          if (websites[websiteKey]["website"] == currentWebsite) {
            isWebsiteFound = true;
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
      }
      if (!isWebsiteFound) {
        chrome.browserAction.setBadgeText({
          text: `0`,
        });
      }
    });
  });
}
function extractWebsiteFromLink(link) {
  try {
    return link.split("/")[2];
  } catch (e) {
    console.log("[-] event.js exception occured: ", e);
    return "";
  }
}
