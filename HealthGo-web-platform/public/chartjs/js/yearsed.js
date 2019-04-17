const YEARSED = document.getElementById("yearsed");

function refreshYearsed(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     data = JSON.parse(this.responseText);

     Chart.defaults.scale.ticks.beginAtZero = true;

     let yearsed = new Chart(YEARSED, data);

    }
  };
  xhttp.open("GET", "/graph/yearSed", true);
  xhttp.send();
}

refreshYearsed();