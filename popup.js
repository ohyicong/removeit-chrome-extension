var numberOfRemovedElement = 0;
var query = { active: true, currentWindow: true };

//function to undo last removed item
$("#undoButton").click(() => {
  console.log("[+] popup.js undo clicked");
  $("#undoButton").blur();
  if (numberOfRemovedElement > 0) {
    chrome.tabs.query(query, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
      $("#numberRemovedElements").text(`${--numberOfRemovedElement}`);
    });
  }
});

//function to load information on popup.html
chrome.tabs.query(query, (tabs) => {
  var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
  console.log("[+] popup.js website selected", currentWebsite);
  $("#currentWebsite").text(currentWebsite.toLowerCase());
  if (currentWebsite == "") {
    console.log("[-] popup.js no website available");
    return;
  }
  //check chrome storage
  chrome.storage.local.get("websites", function (result) {
    //global variable: websites
    var isWebsiteFound = false;
    websites = result.websites;
    if (websites) {
      for (var websiteKey in websites) {
        //check if website records exists
        if (websites[websiteKey]["website"] == currentWebsite) {
          isWebsiteFound = true;
          removedElements = websites[websiteKey]["removedElements"];
          numberOfRemovedElement = removedElements.length;
          //remove elements
          if (removedElements) {
            $("#numberRemovedElements").text(`${numberOfRemovedElement}`);
          }
        }
      }
    }
    if (!isWebsiteFound) {
      $("#numberRemovedElements").text("0");
    }
  });
});
function extractWebsiteFromLink(link) {
  try {
    return link.split("/")[2];
  } catch (e) {
    console.log("[-] popup.js Exception occured: ", e);
    return "";
  }
}
