var element = null;
var element_background_color = null;
var removed_elements = [];
var is_activated = false;
var is_shown = false;
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
$("body").click(function (event) {
  if (event.ctrlKey && event.altKey) {
    event.returnValue = "";
    event.preventDefault();
    event.stopPropagation();
    $(event.target).hide(1000);
    removed_elements.push(structureSelector(event.target));
    console.log(removed_elements);
    chrome.storage.local.set(
      { removed_elements: JSON.stringify(removed_elements) },
      function () {
        console.log("Value is set to:" + JSON.stringify(removed_elements));
      }
    );
  }
});
$(document).ready(function () {
  chrome.storage.local.get(["removed_elements"], function (result) {
    console.log(JSON.parse(result.removed_elements));
    //removed elements from chrome local storage
    let removed_elements = JSON.parse(result.removed_elements);
    for (var key in removed_elements) {
      console.log(removed_elements[key]);
      $(removed_elements[key]).css("background-color", "#71AFE2");
    }
  });
});

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
