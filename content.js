var element = null;
var element_background_color = null;
var removed_elements = [];
var websites = [];
var is_activated = false;
var is_shown = false;

//highlight element when ctrl+alt+mouseover
$("body").mouseover(function (event) {
  if (element) {
    $(element).css("background-color", element_background_color);
    $(element).css("border", "");
  }
  if (event.ctrlKey && event.altKey) {
    is_activated = true;
    element = event.target;
    element_background_color = $(event.target).css("background-color");
    $(element).css("background-color", "#71AFE2");
    $(element).css("border", "1px solid #71AFE2");
  } else {
    is_activated = false;
    is_shown = false;
  }
});
$("body").keyup(function () {
  if (element) {
    $(element).css("background-color", element_background_color);
    $(element).css("border", "");
  }
});
//delete and save element when ctrl+alt+click
$("body").click(function (event) {
  is_website_found = false;
  if (event.ctrlKey && event.altKey) {
    //disable element from performing default actions
    event.preventDefault();
    event.stopPropagation();
    //delete element
    $(event.target).hide(1000);
    //save deleted element
    removed_elements.push(structureSelector(event.target));
    for (var website_key in websites) {
      if (websites[website_key]["website"] == window.location.href) {
        websites[website_key]["removed_elements"] = removed_elements;
        is_website_found = true;
      }
    }
    //if website not found, create new entry
    if (!is_website_found) {
      //check number of saved websites
      console.log("websites", websites);
      if (websites.length == 0) {
        //initialisation
        websites = [
          {
            website: window.location.href,
            removed_elements: removed_elements,
          },
        ];
      } else {
        //subsequent entries
        websites.push({
          website: window.location.href,
          removed_elements: removed_elements,
        });
      }
    }
    //save to chrome storage
    chrome.storage.local.set({ websites: websites });
  }
});

//check chrome storage and delete all elements
$(document).ready(function () {
  setTimeout(function () {
    //check chrome storage
    chrome.storage.local.get("websites", function (result) {
      websites = result.websites;
      if (websites) {
        console.log(websites);
        for (var website_key in websites) {
          console.log(websites[website_key]["website"]);
          //check if website records exists
          if (websites[website_key]["website"] == window.location.href) {
            removed_elements = websites[website_key]["removed_elements"];
            //remove elements
            if (removed_elements) {
              for (var removed_elements_key in removed_elements) {
                $(removed_elements[removed_elements_key]).hide(1000);
              }
            }
          }
        }
      } else {
        websites = [];
        console.log(websites);
      }
    });
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
