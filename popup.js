$(function () {
  $("#user_input").keyup(function () {
    $("#text").text($("#user_input").val());
  });
});
