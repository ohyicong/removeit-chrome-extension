var numberOfRemovedElement = 0;
var query = { active: true, currentWindow: true };
$("#undoButton").click(() => {
  console.log("popup.js clicked");
  $("#undoButton").blur();
  if (numberOfRemovedElement > 0) {
    chrome.tabs.query(query, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "undo" });
      $("#numberRemovedElements").text(`${--numberOfRemovedElement}`);
    });
  }
});
chrome.tabs.query(query, (tabs) => {
  console.log("active web: ", tabs[0].url);
  //check chrome storage
  chrome.storage.local.get("websites", function (result) {
    var isWebsiteFound = false;
    websites = result.websites;
    if (websites) {
      console.log(websites);
      for (var websiteKey in websites) {
        console.log(websites[websiteKey]["website"]);
        isWebsiteFound = true;
        //check if website records exists
        if (websites[websiteKey]["website"] == tabs[0].url) {
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
