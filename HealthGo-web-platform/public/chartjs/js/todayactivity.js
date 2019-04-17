const STEPActiv = document.getElementById("todayactivity");

function refreshSTEPActiv(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let gymByMonth = new Chart(STEPActiv, data);

    }
  };
  xhttp.open("GET", "/graph/todayactivity", true);
  xhttp.send();
}

refreshSTEPActiv();
