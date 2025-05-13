//button click reference
//https://www.w3schools.com/jsref/event_onclick.asp

const viz3main = document.getElementById("chart-container-weekly");
const viz3Grouped =  document.getElementById("chart-container-weeklyGrouped");
var viz3btn = document.getElementById("submitViz3");

// use button for submission
viz3btn.onclick = function(){
    viz3Val = document.getElementById("chartModeViz3").value;
    // swap which chart is visible based on the chart mode
    if (viz3Val == "weekdayViz3"){
        viz3Grouped.style="display:flex;"
        viz3main.style="display:none;"
    }
    else{
        viz3Grouped.style="display:none;"
        viz3main.style="display:flex;"
    }
};



const viz4main = document.getElementById("chart-container-hourly");
const viz4MaxHighlight =  document.getElementById("chart-container-hourlyMax");
var viz4btn = document.getElementById("submitViz4");

// use button for submission
viz4btn.onclick = function(){
    viz4Val = document.getElementById("chartModeViz4").value;
    // swap which chart is visible based on the chart mode
    if (viz4Val == "maxViz4"){
        viz4MaxHighlight.style="display:flex;"
        viz4main.style="display:none;"
    }
    else{
        viz4MaxHighlight.style="display:none;"
        viz4main.style="display:flex;"
    }
};


