//button click reference
//https://www.w3schools.com/jsref/event_onclick.asp

var fileIndex = 0;
const fileList = ["viz1.html", "viz2.html", "viz3.html", "viz4.html"];

function constrainVal(minVal, maxVal, val){
    return Math.max(minVal, Math.min(maxVal, val)) // using clever min and max function usage, can constrain it between the given values
}

const upButton = document.getElementById("UpButton");
const downButton = document.getElementById("DownButton");

const Frame = document.getElementById("vizFrame");

function changeIframe(){
    // don't forget that when we change it on button presses, we need to constrain it
    Frame.src = "Visualizations/" + fileList[fileIndex]
}

//based on button click reference(https://www.w3schools.com/jsref/event_onclick.asp)
upButton.onclick = function(){
    fileIndex = constrainVal(0,3, fileIndex - 1);
    changeIframe()
};

//based on button click reference(https://www.w3schools.com/jsref/event_onclick.asp)
downButton.onclick = function(){
    fileIndex = constrainVal(0,3, fileIndex + 1);
    changeIframe()
};

changeIframe()