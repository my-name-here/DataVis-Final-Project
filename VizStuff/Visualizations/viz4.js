// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1800;
const svgHeight = 625;
const margin = { top: 50, right: 220, bottom: 100, left: 150 };
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

// a function that takes a neighborhood, and gives out either the neighborhood if it is in the list of saved neighborhoods, or other
function locRange(i){
    neighborhoodChoices = ["Bayview Hunters Point", "Financial District/South Beach", "Mission", "South of Market", "Tenderloin"]
    if (neighborhoodChoices.includes(i)){
        return i
    }
    else{
        return "other"
    }
    
}

function hourFromTime(time){
    if (time.length>=2){// make sure not empty hour
        return time.substring(0,2)
    }
    else{
        return "none"
    }
}

//used to find the index where the none list is in the nested list from rollups, to remove it
function findIndexOfNone(list){
    for (var i = 0;i < list.length; i++){
        if (list[i][0] == "none"){
            return i;
        }
    }
}

//used to find the index where the other  list is in the given sublist , to remove it
function findIndexOfOther(list){
    for (var i = 0;i < list.length; i++){
        if (list[i][0] == "other"){
            return i;
        }
    }
}

function removeOtherFromSublists(list){

    for (var i = 0;i < list.length; i++){
        indexOfOther = findIndexOfOther(list[i][1])


        list[i][1].splice(indexOfOther,1)

    }
    return list;
}

// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.time = d.collision_time;
        d.neighborhood = d.analysis_neighborhood;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const hours = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => hourFromTime(d.time), d => locRange(d.neighborhood));
    hours.delete("none")
    // loop over keys with https://stackoverflow.com/questions/69145734/fastest-way-to-loop-through-map-keys
    hours.forEach(function(value, key){
        value.delete("other")
    })
    // for easier access in the y scale
    // remove by index with https://stackoverflow.com/a/5767357
    var hourTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => hourFromTime(d.time),d => locRange(d.neighborhood));
    hourTmp.splice(findIndexOfNone(hourTmp), 1);
    hourTmp = removeOtherFromSublists(hourTmp)
    console.log(hours)
    console.log(hourTmp)
    console.log(d3.min(hourTmp, D1 => d3.min(D1[1], d=>d[1])))
    console.log(d3.max(hourTmp, D1 => d3.max(D1[1], d=>d[1])))
    // Define X and Y scales
    //see https://d3js.org/d3-scale/band
    const y = d3.scaleBand()
        .domain( ["0-100","100-200","200-300", "300+"])
        .range([ 0, -height])
        //.padding(0.1);

    const x = d3.scaleTime()
        .domain([d3.timeParse("%y")(d3.min(data, d => d["year"])),d3.timeParse("%y")(d3.max(data, d => d["year"]))])
        .nice()
        .range([ 0, width]);
    
    
    var colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .nice()
        .domain( [d3.min(yearTmp, D1 => d3.min(D1[1], d=>d[1])),d3.max(yearTmp, D1 => d3.max(D1[1], d=>d[1]))])


        

    // Add X and Y axes
    
    svg.append("g")
        .attr("class", "axis axis-x")
        // ${x(d3.timeParse("%y")(72)-d3.timeParse("%y")(71))/2} shifts axis label for year to middle of year box
        .attr("transform", `translate(${x(d3.timeParse("%y")(72)-d3.timeParse("%y")(71))/2}, ${height})`)
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
    bandwidth = Math.abs(y("100-200")-y("0-100"))
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(yearList,dispRangeList))
    dataSpots = d3.cross(yearList,dispRangeList)

    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")


    bars =  svg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(years.get(72).get("300+"))

    // tooltips will be implemented using https://mappingwithd3.com/tutorials/basics/tooltip/
    bars.append("rect")
        .attr("test", d => `${d}`)
        .attr("x", d => x(d3.timeParse("%y")(d[0])))
        .attr("y", d => y(d[1]))
        .attr("width", d => x(d3.timeParse("%y")(d[0]+1)-d3.timeParse("%y")(d[0])))
        .attr("height", d => bandwidth)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("fill", d=>colorScale(years.get(d[0]).get(d[1])))
        .attr("transform", `translate(0, ${height})`)// translate points down to match with axis
        // needs to be event,d, so that the value of d is passed in along with the mouse event
        .on("mouseover", function(event, d){
            
            d3.select(".tooltip")

                .style("opacity", 1)

        }
        )
        .on("mouseout", function(event,d){
            d3.select(".tooltip")
                .style("opacity", 0)
                
            }
        )
        .on("mousemove", function(event, d){

            d3.select(".tooltip")
                
                .html(`avg mpg: <br>
                    ${years.get(d[0]).get(d[1])}`)
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
        .attr("class","axisLabelY")
        .text("displacement range")
        .attr("x", -margin.left+10)
        .attr("y", height/2)
        
    svg.append("text")
        .attr("class","axisLabelX")
        .text("year")
        .attr("x", width/2)
        .attr("y", height+margin.bottom/2)

    svg.append("text")
    
        .text("heatmap of the avg mpg per year for different displacement ranges")
        .attr("class", "title")
        .attr("x", (width-margin.left)/2-margin.right)
        .attr("y", -margin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: avg mpg")
		.titleWidth(100)
        .cells(7) // change the number of cells during demo 
        .scale(colorScale);
		

    svg.append("g")
        .attr("transform", `translate(${width+margin.right/2+20},0)`)
        .call(legend);
});