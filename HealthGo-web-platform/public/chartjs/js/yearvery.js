const YEARVERY = document.getElementById("yearvery");

function refreshYearvery(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearvery = new Chart(YEARVERY, data);

    }
  };
  xhttp.open("GET", "/graph/yearVery", true);
  xhttp.send();
}

refreshYearvery();