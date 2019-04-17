const TODAY = document.getElementById("today");

function refreshToday(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let today = new Chart(TODAY, data);

    }
  };
  xhttp.open("GET", "/graph/today", true);
  xhttp.send();
}

refreshToday();