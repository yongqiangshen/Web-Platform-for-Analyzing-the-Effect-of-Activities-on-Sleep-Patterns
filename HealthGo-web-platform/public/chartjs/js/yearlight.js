const YEARLIGHT = document.getElementById("yearlight");

function refreshYearlight(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearlight = new Chart(YEARLIGHT, data);

    }
  };
  xhttp.open("GET", "/graph/yearLight", true);
  xhttp.send();
}

refreshYearlight();