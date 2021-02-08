var numberOfRemovedElement = 0;
var query = { active: true, currentWindow: true };
var isAppliedToAllPages = true;
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

//function to extract main website from link
function extractWebsiteFromLink(link) {
  try {
    return `${link.split("/")[0]}//${link.split("/")[2]}/`;
  } catch (e) {
    console.log("[-] content.js exception occured: ", e);
    return "";
  }
}

//load popup.html when initialised
function loadPopup() {
  //function to load information on popup.html
  chrome.storage.local.get("isAppliedToAllPages", (result) => {
    //load isAppliedToAllPages status
    isAppliedToAllPages = result.isAppliedToAllPages;
    console.log(isAppliedToAllPages, result.isAppliedToAllPages);
    if (isAppliedToAllPages != null) {
      console.log(
        "[+] popup.js toggle button load result",
        isAppliedToAllPages
      );
      document.getElementById(
        "isAppliedToAllPages"
      ).checked = isAppliedToAllPages;
    } else {
      //initialise toggle status if doesn't exists, default as true
      chrome.storage.local.set({ isAppliedToAllPages: true });
      document.getElementById("isAppliedToAllPages").checked = true;
      console.log("[+] popup.js set toggle button to true");
    }

    chrome.tabs.query(query, (tabs) => {
      var currentWebsite = extractWebsiteFromLink(tabs[0].url.toString());
      var currentPage = tabs[0].url.toString();
      console.log("[+] popup.js website selected", currentWebsite);
      console.log("[+] popup.js page selected", currentPage);
      $("#currentWebsite").text(currentWebsite.toLowerCase());
      if (currentWebsite == "") {
        console.log("[-] popup.js no website available");
        return;
      }
      //check chrome storage
      chrome.storage.local.get("websites", (result) => {
        //global variable: websites
        var isWebsiteFound = false;
        websites = result.websites;
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
                  $("#numberRemovedElements").text(`${numberOfRemovedElement}`);
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
                  $("#numberRemovedElements").text(`${numberOfRemovedElement}`);
                }
              }
            }
          }
        }
        if (!isWebsiteFound) {
          $("#numberRemovedElements").text("0");
        }
      });
    });
  });
}

//toggle isAppliedToAllPages status
$("#isAppliedToAllPages").change(() => {
  const isAppliedToAllPages = document.getElementById("isAppliedToAllPages")
    .checked;
  console.log("[+] popup.js toggle clicked", isAppliedToAllPages);
  //save to chrome storage
  chrome.storage.local.set({ isAppliedToAllPages: isAppliedToAllPages }, () => {
    console.log("[+] popup.js loading popup");
    //update popup
    loadPopup();
    //update content
    chrome.tabs.query(query, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggle" });
    });
  });
});

loadPopup();
