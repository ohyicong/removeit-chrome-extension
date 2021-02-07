//check if new tab is selected, update badge number
chrome.tabs.onSelectionChanged.addListener(() => {
  console.log("[+] background.js tab selection changed");
  loadBadgeNotification();
});
//check if new tab is selected, update badge number
chrome.tabs.onCreated.addListener(() => {
  console.log("[+] background.js tab created");
  loadBadgeNotification();
});
//check if new tab is selected, update badge number
chrome.webNavigation.onCommitted.addListener(() => {
  console.log("[+] background.js web committed");
  loadBadgeNotification();
});
//listen to any change in storage, update badge number
chrome.storage.onChanged.addListener((result, storageName) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var isWebsiteFound = false;
    var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
    console.log("[+] background.js website selected", currentWebsite);
    if (currentWebsite == "") {
      console.log("[-] background.js no website available");
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
              tabId: tabs[0].id,
              text: `${numberOfRemovedElement}`,
            });
          } else {
            chrome.browserAction.setBadgeText({
              tabId: tabs[0].id,
              text: `0`,
            });
          }
        }
      }
    }
    if (!isWebsiteFound) {
      console.log("[-] background.js no website available");
      chrome.browserAction.setBadgeText({
        tabId: tabs[0].id,
        text: `0`,
      });
    }
  });
});
function loadBadgeNotification() {
  chrome.browserAction.setBadgeBackgroundColor({ color: "#007bff"});
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    var isWebsiteFound = false;
    var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
    console.log("[+] background.js website selected", currentWebsite);
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
                tabId: tabs[0].id,
                text: `${numberOfRemovedElement}`,
              });
            }
          }
        }
      }
      if (!isWebsiteFound) {
        chrome.browserAction.setBadgeText({
          tabId: tabs[0].id,
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
    console.log("[-] background.js exception occured: ", e);
    return "";
  }
}
