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


