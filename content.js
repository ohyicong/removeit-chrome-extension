var element = null;
var elementBackgroundColor = null;
var removedElements = [];
var websites = [];
var isActivated = false;
var isShown = false;

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

//check chrome storage and delete all elements
$(document).ready(function () {
  setTimeout(function () {
    loadWebsite();
  }, 1000);
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "undo") {
    console.log("content.js undo clicked");
    //undo removed element
    undoElement();
    //save removed elements to storage
    setRemovedElementsToStorage();
  }
});

function setRemovedElementsToStorage() {
  //global variable: websites,removedElements
  var isWebsiteFound = false;
  var currentWebsite = extractWebsiteFromLink(window.location.href);
  console.log("[+] content.js website selected", currentWebsite);
  if (currentWebsite == "") {
    console.log("[-] content.js no website available");
    return;
  }
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
      //initialisation
      websites = [
        {
          website: currentWebsite,
          removedElements: removedElements,
        },
      ];
    } else {
      //subsequent entries
      websites.push({
        website: currentWebsite,
        removedElements: removedElements,
      });
    }
  }
  //save to chrome storage
  chrome.storage.local.set({ websites: websites });
}

function removeElement(target) {
  //global variable removedElements
  //delete element
  $(target).hide(1000);
  //add deleted element to the list
  removedElements.push(structureSelector(target));
}

function undoElement() {
  //global variable removedElements
  //undo element
  if (removedElements.length > 0) {
    console.log(removedElements);
    $(removedElements.pop()).show(1000);
  }
}

function loadWebsite() {
  //global variable removedElements
  //check chrome storage
  chrome.storage.local.get("websites", function (result) {
    websites = result.websites;
    var currentWebsite = extractWebsiteFromLink(window.location.href);
    console.log("[+] content.js website selected", currentWebsite);
    if (currentWebsite == "") {
      console.log("[-] content.js no website available");
      return;
    }
    if (websites) {
      console.log(websites);
      for (var websiteKey in websites) {
        console.log(websites[websiteKey]["website"]);
        //check if website records exists
        if (websites[websiteKey]["website"] == currentWebsite) {
          removedElements = websites[websiteKey]["removedElements"];
          //remove elements
          if (removedElements) {
            for (var removedElementsKey in removedElements) {
              $(removedElements[removedElementsKey]).hide(1000);
            }
          }
        }
      }
    } else {
      websites = [];
      console.log(websites);
    }
  });
}

function extractWebsiteFromLink(link) {
  try {
    return link.split("/")[2];
  } catch (e) {
    console.log("[-] content.js exception occured: ", e);
    return "";
  }
}
