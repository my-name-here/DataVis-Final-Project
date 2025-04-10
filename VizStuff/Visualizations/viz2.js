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
let years
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// a function that takes a displacement, and converts it to a string representing the range
function dispRang(i){
    if (i < 100){
        return "0-100";
    }
    else if (i > 100 && i <200){
        return "100-200";
    }
    else if (i > 200 && i <300){
        return "200-300"
    }
    else{
        return "300+"
    }
    
}
// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/my-name-here.github.io/refs/heads/main/carsFakeData.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d["economy (mpg)"] = +d["economy (mpg)"];
        d["displacement (cc)"] = +d["displacement (cc)"];
        d.year = +d.year;
        d.name = d.name;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const years = d3.rollup(data, (D) => d3.mean(D, d=>d["economy (mpg)"]), d => d.year, d => dispRang(d["displacement (cc)"]));
    // for easier access in the y scale
    const yearTmp = d3.rollups(data, (D) => d3.mean(D, d=>d["economy (mpg)"]), d => d.year, d => dispRang(d["displacement (cc)"]));

    console.log(years)
    console.log(d3.min(yearTmp, D1 => d3.min(D1[1], d=>d[1])))
    console.log(d3.max(yearTmp, D1 => d3.max(D1[1], d=>d[1])))
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(yearTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(yearTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -height])
        //.padding(0.1);

    const x = d3.scaleTime()
        .domain([d3.timeParse("%y")(d3.min(data, d => d["year"])),d3.timeParse("%y")(d3.max(data, d => d["year"]))])
        .nice()
        .range([ 0, width]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["0-100","100-200","200-300", "300+"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02", "#7570b3", "#e7298a"])

        

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
    let maxYear = d3.max(data, d => d["year"])

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    yearList = d3.map(d3.groups(data,d=>d.year),D=>D[0])
    console.log(yearList)
    dispRangeList = ["0-100","100-200", "200-300","300+"]
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(yearList,dispRangeList))
    dataSpots = d3.cross(yearList,dispRangeList)
    bars =  svg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(years.get(72).get("300+"))
    bars.append("line")
        .attr("test", d => `${d}`)
        .attr("x1", d => x(d3.timeParse("%y")(d[0])))
        .attr("y1", d => y(years.get(d[0]).get(d[1])))
        .attr("x2", d => x(d3.timeParse("%y")(Math.min(d[0]+1, maxYear))))
        .attr("y2", d => y(years.get(Math.min(d[0]+1, maxYear)).get(d[1])))
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