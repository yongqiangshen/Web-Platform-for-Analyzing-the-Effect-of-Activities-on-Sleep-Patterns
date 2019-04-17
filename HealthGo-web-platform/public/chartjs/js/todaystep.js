const STEPToday = document.getElementById("todaystep");

function refreshStepToday(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(STEPToday, data);

    }
  };
  xhttp.open("GET", "/graph/todaystep", true);
  xhttp.send();
}

refreshStepToday();
