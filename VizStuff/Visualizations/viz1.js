// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1000;
const svgHeight = 1000;
const margin = { top: 50, right: 20, bottom: 100, left: 250 };
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

// Read data from CSV
d3.csv("cars.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d["economy (mpg)"] = +d["economy (mpg)"];
        d.year = +d.year
        d.name = d.name;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://observablehq.com/@d3/d3-group
    const years = d3.rollup(data, v => d3.mean(v, d => d["economy (mpg)"]), d => d.year);
    console.log(years)
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(years, d => d[1])-2, d3.max(years, d => d[1])+2])
        .nice()
        .range([ 0, -height])
        //.padding(0.1);

    const x = d3.scaleTime()
        .domain([d3.timeParse("%y")(d3.min(data, d => d["year"])),d3.timeParse("%y")(d3.max(data, d => d["year"]))])
        .nice()
        .range([ 0, width]);
    

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
    bars =  svg.selectAll(".bar")
        .data(years)
        .enter()
        .append("g")
        
    bars.append("line")
        .attr("test", d => `${years.get(Math.min(d[0], maxYear))}`)
        .attr("x1", d => x(d3.timeParse("%y")(d[0])))
        .attr("y1", d => y(years.get(d[0])))
        .attr("x2", d => x(d3.timeParse("%y")(Math.min(d[0]+1, maxYear))))
        .attr("y2", d => y(years.get(Math.min(d[0]+1, maxYear))))
        .attr("stroke-width", 1)
        .attr("stroke", "black")

        .attr("transform", `translate(0, ${height})`)// translate points down to match with axis
    bars.append("circle")
        .attr("test", d => `${years.get(Math.min(d[0], maxYear))}`)
        .attr("cx", d => x(d3.timeParse("%y")(d[0])))
        .attr("cy", d => y(years.get(d[0])))
       
        .attr("r", 2)

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
    
        .text("line plot of the avg mpg per year")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -margin.top/2)
});