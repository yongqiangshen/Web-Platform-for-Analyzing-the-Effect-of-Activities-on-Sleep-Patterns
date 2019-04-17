const YEARDIS = document.getElementById("yeardis");

function refreshYeardis(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yeardis = new Chart(YEARDIS, data);

    }
  };
  xhttp.open("GET", "/graph/yearDis", true);
  xhttp.send();
}

refreshYeardis();