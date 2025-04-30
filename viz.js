//button click reference
//https://www.w3schools.com/jsref/event_onclick.asp



const viz3main = document.getElementById("chart-container-weekly");
const viz3Grouped =  document.getElementById("chart-container-weeklyGrouped");







var viz3btn = document.getElementById("submitViz3");


// use buttons instead of submit

viz3btn.onclick = function(){
    viz3Val = document.getElementById("chartModeViz3").value;
    if (viz3Val == "weekdayViz3"){
        viz3Grouped.style="display:flex;"
        viz3main.style="display:none;"
    }
    else{
        viz3Grouped.style="display:none;"
        viz3main.style="display:flex;"


    }
};


document.getElementById("viz1").src = "/Visualizations/viz1.html"
document.getElementById("viz2").src = "/Visualizations/viz2.html"
document.getElementById("viz2Covid").src = "/Visualizations/viz2Covid.html"
document.getElementById("viz3Covid").src = "/Visualizations/viz3Covid.html"
document.getElementById("viz4").src = "/Visualizations/viz4.html"
document.getElementById("viz4Covid").src = "/Visualizations/viz4Covid.html"