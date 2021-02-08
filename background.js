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
  loadBadgeNotification();
});
function loadBadgeNotification() {
  chrome.browserAction.setBadgeBackgroundColor({ color: "#23272b" });
  chrome.storage.local.get("isAppliedToAllPages", (result) => {
    //load isAppliedToAllPages status
    const isAppliedToAllPages = result.isAppliedToAllPages;
    console.log(isAppliedToAllPages, result.isAppliedToAllPages);
    if (isAppliedToAllPages != null) {
      console.log(
        "[+] background.js toggle button load result",
        isAppliedToAllPages
      );
    } else {
      //initialise toggle status if doesn't exists, default as true
      chrome.storage.local.set({ isAppliedToAllPages: true });
      document.getElementById("isAppliedToAllPages").checked = true;
      console.log("[+] background.js set toggle button to true");
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      var isWebsiteFound = false;
      var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
      var currentPage = tabs[0].url.toString();
      console.log("[+] background.js website selected", currentWebsite);
      chrome.storage.local.get("websites", function (result) {
        var websites = result.websites;
        if (websites) {
          for (var websiteKey in websites) {
            //check if it is applied to all pages
            if (isAppliedToAllPages) {
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
            } else {
              //check if page records exists
              if (websites[websiteKey]["website"] == currentPage) {
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
        }
        if (!isWebsiteFound) {
          chrome.browserAction.setBadgeText({
            tabId: tabs[0].id,
            text: `0`,
          });
        }
      });
    });
  });
}

//function to extract main website from link
function extractWebsiteFromLink(link) {
  try {
    return `${link.split("/")[0]}//${link.split("/")[2]}/`;
  } catch (e) {
    console.log("[-] content.js exception occured: ", e);
    return "";
  }
}
