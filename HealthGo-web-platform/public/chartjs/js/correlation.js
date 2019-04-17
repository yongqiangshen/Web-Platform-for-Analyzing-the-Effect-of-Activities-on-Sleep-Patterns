const relation = document.getElementById("corr");

function refreshcorr(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);
     Chart.defaults.scale.ticks.beginAtZero = true;

     let corr = new Chart(relation, data);

    }
  };
  xhttp.open("GET", "/graph/correlation", true);
  xhttp.send();
}

refreshcorr();