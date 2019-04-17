const YEARCAL = document.getElementById("yearcal");

function refreshYearcal(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearcal = new Chart(YEARCAL, data);

    }
  };
  xhttp.open("GET", "/graph/yearCal", true);
  xhttp.send();
}

refreshYearcal();