const YEARACTCAL = document.getElementById("yearactcal");

function refreshYearactcal(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearactcal = new Chart(YEARACTCAL, data);

    }
  };
  xhttp.open("GET", "/graph/yearActCal", true);
  xhttp.send();
}

refreshYearactcal();