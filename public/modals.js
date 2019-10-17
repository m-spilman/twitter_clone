//-------INITIALIZE MODALS-------------------------
document.addEventListener('DOMContentLoaded', function () {
  let modals = document.querySelectorAll('.modal')
  M.Modal.init(modals)
})

document.addEventListener("DOMContentLoaded", function() {
  const searchBar = document.forms["search_users"].querySelector("input");
  searchBar.addEventListener("keyup", function(e) {
    const term = e.target.value;
    if(term === '')
    {return}
    else {
    $.ajax({
      url: "/data",
      type: "get",
      data: {
        query: term
      }
    }).then(extractInfo);

    function extractInfo(theInfo) {
      vomUsers = theInfo.map(function(usernames) {
        return `<li>${usernames.username}</li>`;
      });
      document.getElementById('resultsContainer').innerHTML = '<ul>' + vomUsers.join('') + '</ul>'
    }
  }
  });
});

