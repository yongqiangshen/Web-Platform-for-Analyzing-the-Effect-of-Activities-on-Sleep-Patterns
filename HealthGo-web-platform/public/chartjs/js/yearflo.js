const YEARFLO = document.getElementById("yearflo");

function refreshYearflo(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearflo = new Chart(YEARFLO, data);

    }
  };
  xhttp.open("GET", "/graph/yearFlo", true);
  xhttp.send();
}

refreshYearflo();