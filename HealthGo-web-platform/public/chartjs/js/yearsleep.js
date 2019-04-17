const YEARSLE = document.getElementById("yearsleep");

function refreshYearsleep(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearsleep = new Chart(YEARSLE, data);

    }
  };
  xhttp.open("GET", "/graph/yearsleepE", true);
  xhttp.send();
}

refreshYearsleep();