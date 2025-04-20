// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1000;
const svgHeight = 1000;
const margin = { top: 50, right: 20, bottom: 70, left: 100 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const minSize = 1
const maxSize = 6
let yearChoices = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
let years
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    
    .append("g")
    .attr("transform", ` translate(${margin.left},${margin.top}) `);

function nextYear(year){
    yearIndex = yearChoices.indexOf(year)

    newYearIndex = Math.min(yearIndex+1, yearChoices.length-1 )

    return yearChoices[newYearIndex]
}
// getting band from value using https://stackoverflow.com/a/38746923
function getBandFromValue(value, scale){

    index = Math.round(value/scale.step())
    return scale.domain()[index]
}

console.log(nextYear(2023))
// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
       
        d.year = +d.accident_year

    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://observablehq.com/@d3/d3-group
    const years = d3.rollup(data, v => d3.count(v, d => d.year), d => d.year);
    console.log(years)
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(years, d => d[1])-2, d3.max(years, d => d[1])+2])
        .nice()
        .range([ 0, -height])
        //.padding(0.1);

    const x = d3.scaleBand()
        .domain(yearChoices)
        .range([ 0, width]);
    



    
    // Add X and Y axes
    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(20));

    svg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxYear = d3.max(data, d => d["year"])

    svg.append("line")

        .attr("class", "lineMarker")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", height)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")


    

    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")



    bars =  svg.selectAll(".bar")
        .data(years)
        .enter()
        .append("g")
        
    bandwidth = x(2006)- x(2005)
    console.log(bandwidth)
    bars.append("line")
        .attr("test", d => `${d[0]}`)
        .attr("x1", d => x(d[0])+ bandwidth/2)
        .attr("y1", d => y(years.get(d[0])))
        .attr("x2", d => x(nextYear(d[0]))+ bandwidth/2)
        .attr("y2", d => y(years.get(nextYear(d[0]))))
        .attr("stroke-width", 2)
        .attr("stroke", "black")

        .attr("transform", `translate(0, ${height})`)// translate points down to match with axis
    bars.append("circle")
        .attr("test", d => `${years.get(Math.min(d[0], maxYear))}`)
        .attr("cx", d => x(d[0])+ bandwidth/2)
        .attr("cy", d => y(years.get(d[0])))
       
        .attr("r", 3)

        .attr("transform", `translate(0, ${height})`)// translate points down to match with axis

    
    console.log(x(d3.timeParse("%Y")("2024")))
    console.log(x(2009))
    console.log(getBandFromValue(x(2009),x))
    svg.append("rect")
        .attr("x", -10)
        .attr("y", -margin.top)
        .attr("width", width+10)
        .attr("height", svgHeight)
        .attr("style", "opacity:0")
    .on("mouseover", function(event){
            
        d3.select(".tooltip")

            .style("opacity", 1)

    }
    )
    .on("mouseout", function(event){
        d3.select(".tooltip")
            .style("opacity", 0)
        }
    )
    .on("mousemove", function(event){
        d3.select(".lineMarker")
            .attr("x1", `${event.pageX - margin.left}`)
            .attr("x2", `${event.pageX - margin.left}`)
            .attr("y1", -margin.top)
            .attr("y2", height)
            .attr("style", "opacity:1")
        d3.select(".tooltip")

            .html(`year:${getBandFromValue((event.pageX- margin.left-bandwidth/2), x)}<br>crashes: ${years.get(getBandFromValue((event.pageX- margin.left- bandwidth/2), x))}`)
            .style("opacity", 1)
            .style("left", `${event.pageX+15}px`)
            .style("top", `${event.pageY+15}px`)
        
        }
    )
    // bars.append("text")
    //     .attr("class", "barLabel")
    //     .text(d => `mpg: ${(d["economy (mpg)"])}`)
    //     .attr("y", d => y(d.name)+15)
    //     .attr("x", d => 25)
        



    svg.append("text")
        .text("accidents")
        .attr("x", -100)
        .attr("y", height/2)
        
    svg.append("text")
        .text("year")
        .attr("x", width/2)
        .attr("y", height+margin.bottom/2)

    svg.append("text")
    
        .text("line plot of the number of accidents per year")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -margin.top/2)
});