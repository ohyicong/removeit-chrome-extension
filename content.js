var element = null;
var elementBackgroundColor = null;
var removedElements = [];
var websites = [];
var isActivated = false;
var isShown = false;
var isAppliedToAllPages = true;

//on mouseover, highlight element when ctrl+alt+mouseover
$("body").mouseover(function (event) {
  if (element) {
    $(element).css("background-color", elementBackgroundColor);
    $(element).css("border", "");
  }
  if (event.ctrlKey && event.altKey) {
    isActivated = true;
    element = event.target;
    elementBackgroundColor = $(event.target).css("background-color");
    $(element).css("background-color", "#EB5757");
    $(element).css("border", "2px solid #EB5757");
  } else {
    isActivated = false;
    isShown = false;
  }
});

//on keyup, unhighlight all elements
$("body").keyup(function () {
  if (element) {
    $(element).css("background-color", elementBackgroundColor);
    $(element).css("border", "");
  }
});

//delete and save element when ctrl+alt+click
$("body").click(function (event) {
  if (event.ctrlKey && event.altKey) {
    //disable element from performing default actions
    event.preventDefault();
    event.stopPropagation();
    //remove element from dom
    removeElement(event.target);
    //save removed element
    setRemovedElementsToStorage();
  }
});

//create xpath for deleted element
function structureSelector(element) {
  var tagName = element.tagName.toLowerCase();
  if (tagName == "body") {
    return tagName;
  }
  var indexInParent = Array.prototype.indexOf.call(
    element.parentNode.children,
    element
  );
  return (
    structureSelector(element.parentNode) +
    ">" +
    tagName +
    ":nth-child(" +
    (indexInParent + 1) +
    ")"
  );
}

//listen to message from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "undo") {
    console.log("content.js undo clicked");
    //undo removed element
    undoElement();
    //save removed elements to storage
    setRemovedElementsToStorage();
  } else if (request.action == "toggle") {
    console.log("content.js toggle clicked");
    showAllRemovedElements();
    loadWebsite();
  }
});

//remove element and save changes to storage
function setRemovedElementsToStorage() {
  //global variable: websites,removedElements
  var isWebsiteFound = false;
  var currentWebsite = "";
  chrome.storage.local.get("isAppliedToAllPages", (result) => {
    //load isAppliedToAllPages status
    isAppliedToAllPages = result.isAppliedToAllPages;
    if (isAppliedToAllPages != null) {
      console.log(
        "[+] content.js toggle button load result",
        isAppliedToAllPages
      );
    } else {
      //initialise toggle status if doesn't exists, default as true
      chrome.storage.local.set({ isAppliedToAllPages: true });
      document.getElementById("isAppliedToAllPages").checked = true;
      console.log("[+] popup.js set toggle button to true");
    }
    //check if applied to all pages
    if (isAppliedToAllPages) {
      currentWebsite = extractWebsiteFromLink(window.location.href);
    } else {
      currentWebsite = window.location.href;
    }
    //return null, if not website found
    if (currentWebsite == "") {
      console.log("[-] content.js no website available");
      return;
    }
    //find website from storage
    for (var websiteKey in websites) {
      if (websites[websiteKey]["website"] == currentWebsite) {
        websites[websiteKey]["removedElements"] = removedElements;
        isWebsiteFound = true;
      }
    }
    //if website not found, create new entry
    if (!isWebsiteFound) {
      //check number of saved websites
      if (websites.length == 0) {
        console.log(
          "[+] content.js initialise current web (apply to all pages)"
        );
        //initialisation of current website
        websites = [
          {
            website: currentWebsite,
            removedElements: removedElements,
          },
        ];
      } else {
        console.log("[+] content.js subsequent (apply to all pages)");
        //subsequent entries
        websites.push({
          website: currentWebsite,
          removedElements: removedElements,
        });
      }
    }
    //save to chrome storage
    chrome.storage.local.set({ websites: websites });
  });
}

//remove element from content page
function removeElement(target) {
  //global variable removedElements
  //delete element
  $(target).hide(500);
  //add deleted element to the list
  removedElements.push(structureSelector(target));
}

//unhide removed element from content page
function undoElement() {
  //global variable removedElements
  //undo element
  if (removedElements.length > 0) {
    $(removedElements.pop()).show(500);
  }
}

//unhide all elements from content page
function showAllRemovedElements() {
  //global variable removedElements
  //undo element
  while (removedElements.length > 0) {
    $(removedElements.pop()).show(500);
  }
}

//retrieve data from storage and remove all elements
function loadWebsite() {
  //global variable removedElements
  //check chrome storage
  chrome.storage.local.get("isAppliedToAllPages", (result) => {
    //load isAppliedToAllPages status
    isAppliedToAllPages = result.isAppliedToAllPages;
    if (isAppliedToAllPages != null) {
      console.log(
        "[+] content.js toggle button load result",
        isAppliedToAllPages
      );
    } else {
      //initialise toggle status if doesn't exists, default as true
      chrome.storage.local.set({ isAppliedToAllPages: true });
      document.getElementById("isAppliedToAllPages").checked = true;
      console.log("[+] content.js set toggle button to true");
    }

    chrome.storage.local.get("websites", function (result) {
      websites = result.websites;
      var currentWebsite = "";
      if (websites != [] && websites) {
        for (var websiteKey in websites) {
          console.log(websites[websiteKey]["website"]);
          //check if it is applied to all pages
          if (isAppliedToAllPages) {
            currentWebsite = extractWebsiteFromLink(window.location.href);
          } else {
            currentWebsite = window.location.href;
          }
          if (currentWebsite == "") {
            console.log("[-] content.js no website available");
            return;
          }
          if (websites[websiteKey]["website"] == currentWebsite) {
            console.log("[-] content.js website found");
            isWebsiteFound = true;
            removedElements = websites[websiteKey]["removedElements"];
            numberOfRemovedElement = removedElements.length;
            //remove elements
            if (removedElements) {
              for (var removedElementsKey in removedElements) {
                $(removedElements[removedElementsKey]).hide(500);
              }
            } else {
              chrome.browserAction.setBadgeText({
                tabId: tabs[0].id,
                text: `0`,
              });
            }
            break;
          }
        }
      } else {
        websites = [];
      }
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

//on document ready, load website
$(document).ready(function () {
  setTimeout(function () {
    //wait for 1 second after DOM is loaded
    loadWebsite();
  }, 1000);
});
