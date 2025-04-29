//button click reference
//https://www.w3schools.com/jsref/event_onclick.asp



const Frame3 = document.getElementById("viz3");



Frame3.src = "Visualizations/viz3.html";



var viz3btn = document.getElementById("submitViz3");


// use buttons instead of submit

viz3btn.onclick = function(){
    viz3Val = document.getElementById("chartModeViz3").value;
    if (viz3Val == "weekdayViz3"){
        Frame3.src = "Visualizations/viz3weekend.html"
    }
    else{
        Frame3.src = "Visualizations/viz3.html"


    }
};


document.getElementById("viz1").src = "/Visualizations/viz1.html"
document.getElementById("viz2").src = "/Visualizations/viz2.html"
document.getElementById("viz2Covid").src = "/Visualizations/viz2Covid.html"
document.getElementById("viz3Covid").src = "/Visualizations/viz3Covid.html"
document.getElementById("viz4").src = "/Visualizations/viz4.html"
document.getElementById("viz4Covid").src = "/Visualizations/viz4Covid.html"