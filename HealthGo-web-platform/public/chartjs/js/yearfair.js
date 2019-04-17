const YEARFAIR = document.getElementById("yearfair");

function refreshYearfair(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearfair = new Chart(YEARFAIR, data);

    }
  };
  xhttp.open("GET", "/graph/yearFair", true);
  xhttp.send();
}

refreshYearfair();