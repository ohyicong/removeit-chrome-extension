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
  var isAppliedToAllPages = "";
  var isWebsiteFound = false;
  var currentWebsite = "";
  var websites = [];
  chrome.browserAction.setBadgeBackgroundColor({ color: "#23272b" });
  chrome.storage.local.get("isAppliedToAllPages", (result) => {
    //load isAppliedToAllPages status
    const isAppliedToAllPages = result.isAppliedToAllPages;
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
    //get current tab url
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      isWebsiteFound = false;
      currentWebsite = "";
      if (isAppliedToAllPages) {
        currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
      } else {
        currentWebsite = tabs[0].url.toString();
      }
      //get removed element data from local storage
      chrome.storage.local.get("websites", function (result) {
        websites = result.websites;
        if (websites != [] && websites) {
          for (var websiteKey in websites) {
            //check if website records exists
            if (websites[websiteKey]["website"] == currentWebsite) {
              isWebsiteFound = true;
              removedElements = websites[websiteKey]["removedElements"];
              numberOfRemovedElement = removedElements.length;
              //update notification
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
              break;
            }
          }
        }
        //if website not found, default to 0 element removed
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
