// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1200;
const svgHeight = 1000;
const margin = { top: 50, right: 200, bottom: 100, left: 250 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const minSize = 1
const maxSize = 6
let months
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top}) scale(0.9)`);

// a function that takes a displacement, and converts it to a string representing the range
function lightCat(i){
    if (i == "Daylight"){
        return "day";
    }
    else{
        return "night"
    }
    
}
// since months are not numbers like years, but strings, we need a function to get the next month from the current one, and it should end in december
// this replaces the max(d[0]+1, maxMonth) in the x2 and y2 of the lines
function getNextMonth(CurMonth){
    // first create a list of months, which we will locate the provided month in, then get the next one
    var monthList = ["January", "February","March","April","May", "June","July","August","September","October","November","December"]
    //get index of current month
    monthIndex = monthList.indexOf(CurMonth)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newMonthIndex = Math.min(monthIndex+1, monthList.length)
    return monthList[newMonthIndex]

}
// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.month = d.month;
        d.lighting = d.lighting;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const months = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.month, d => lightCat(d.lighting));
    // for easier access in the y scale
    const monthsTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.month, d => lightCat(d.lighting));

    console.log(months)
    console.log(d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1])))
    console.log(d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1])))
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -height])
        //.padding(0.1);

    const x = d3.scaleTime()
        .domain([d3.timeParse("%B")("January"),d3.timeParse("%B")("December")])
        .nice()
        .range([ 0, width]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["day", "night"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02"])

        

    // Add X and Y axes
    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(10));

    svg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxMonth = d3.max(data, d => d.month)
    console.log(maxMonth)

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    monthsList = d3.map(d3.groups(data,d=>d.month),D=>D[0])
    console.log(monthsList)
    dispRangeList = ["day", "night"]
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(monthsList,dispRangeList))
    dataSpots = d3.cross(monthsList,dispRangeList)
    bars =  svg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(months.get("January"))
    console.log(dataSpots)
    bars.append("line")
        .attr("test", d => `${d}`)
        .attr("x1", d => x(d3.timeParse("%B")(d[0])))
        .attr("y1", d => y(months.get(d[0]).get(d[1])))
        .attr("x2", d => x(d3.timeParse("%B")(getNextMonth(d[0]))))
        .attr("y2", d => y(months.get(getNextMonth(d[0])).get(d[1])))
        .attr("stroke-width", 2)
        .attr("stroke", d=>colorScale(d[1]))

        .attr("transform", `translate(0, ${height})`)// translate points down to match with axis

    // bars.append("text")
    //     .attr("class", "barLabel")
    //     .text(d => `mpg: ${(d["economy (mpg)"])}`)
    //     .attr("y", d => y(d.name)+15)
    //     .attr("x", d => 25)
        



    svg.append("text")
        .text("avg mpg")
        .attr("x", -100)
        .attr("y", height/2)
        
    svg.append("text")
        .text("year")
        .attr("x", width/2)
        .attr("y", height+margin.bottom/2)

    svg.append("text")
    
        .text("line plot of the avg mpg per year, colored by displacement")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -margin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: displacement range")
		.titleWidth(100)
        .cells(11) // change the number of cells during demo 
        .scale(colorScale);
		

    svg.append("g")
        .attr("transform", `translate(${width+10},0)`)
        .call(legend);
});