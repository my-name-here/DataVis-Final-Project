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


viz2btn.addEventListener('click', funcViz2Btn);
viz3btn.addEventListener('click', funcViz3Btn);
viz4btn.addEventListener('click', funcViz4Btn);


function funcViz2Btn(){
    viz2Val = document.getElementById("chartModeViz2").value;
    if (viz2Val == "CovidViz2"){
        Frame2.src = "Visualizations/viz1.html"
    }
    else{
        Frame2.src = "Visualizations/viz2.html"
    }

}
