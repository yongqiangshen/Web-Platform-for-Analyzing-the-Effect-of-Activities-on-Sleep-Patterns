const SleepToday = document.getElementById("todaysleep");

function refreshSleepToday(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(SleepToday, data);

    }
  };
  xhttp.open("GET", "/graph/todaysleep", true);
  xhttp.send();
}

refreshSleepToday();
