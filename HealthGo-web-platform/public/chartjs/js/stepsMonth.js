const STEPSMON = document.getElementById("stepsMonth");

function refreshStepsMonth(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let stepsMonth = new Chart(STEPSMON, data);

    }
  };
  xhttp.open("GET", "/graph/stepsMonth", true);
  xhttp.send();
}

refreshStepsMonth();