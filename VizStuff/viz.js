//button click reference
//https://www.w3schools.com/jsref/event_onclick.asp


const Frame1 = document.getElementById("viz1");
const Frame2 = document.getElementById("viz2");
const Frame3 = document.getElementById("viz3");
const Frame4 = document.getElementById("viz4");

Frame1.src = "Visualizations/viz1.html";
Frame2.src = "Visualizations/viz2.html";
Frame3.src = "Visualizations/viz3.html";
Frame4.src = "Visualizations/viz4.html";


// getting value of selection on submit  based on https://stackoverflow.com/q/56923127
var viz2btn = document.getElementById("submitViz2");
var viz3btn = document.getElementById("submitViz3");
var viz4btn = document.getElementById("submitViz4");

// use buttons instead of submit
viz2btn.onclick = function(){
        viz2Val = document.getElementById("chartModeViz2").value;
        if (viz2Val == "CovidViz2"){
            Frame2.src = "Visualizations/viz1.html"
        }
        else{
            Frame2.src = "Visualizations/viz2.html"
        }
    };

viz3btn.onclick = function(){
    viz3Val = document.getElementById("chartModeViz3").value;
    if (viz3Val == "CovidViz3"){
        Frame3.src = "Visualizations/viz1.html"
    }
    else if (viz3Val == "weekdayViz3"){
        Frame3.src = "Visualizations/viz2.html"
    }
    else{
        Frame3.src = "Visualizations/viz3.html"


    }
};


viz4btn.onclick = function(){
    viz4Val = document.getElementById("chartModeViz4").value;
    if (viz4Val == "CovidViz4"){
        Frame4.src = "Visualizations/viz1.html"
    }
    else{
        Frame4.src = "Visualizations/viz2.html"
    }
};



