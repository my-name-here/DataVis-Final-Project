// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1000;
const svgHeight = 600;
const margin = { top: 50, right: 220, bottom: 350, left: 150 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;
let choices = ["Bayview Hunters Point", "Financial District/South Beach", "Mission", "South of Market", "Tenderloin"]
let hourOptionsList = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10","11","12","13","14","15","16","17","18","19","20","21","22","23"]
const minSize = 1
const maxSize = 6
let years


function getNextHour(CurHour){
    // first create a list of months, which we will locate the provided month in, then get the next one
    
    //get index of current month
    hourIndex = hourOptionsList.indexOf(CurHour)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newHourIndex = Math.min(hourIndex+1, hourOptionsList.length -1 )
    return hourOptionsList[newHourIndex]

}

const svg = d3.select("#chart-container")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// a function that takes a neighborhood, and gives out either the neighborhood if it is in the list of saved neighborhoods, or other
function locRange(i){
    neighborhoodChoices = choices;
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
        d.hour = hourFromTime(d.collision_time);
        d.neighborhood = d.analysis_neighborhood;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const hours = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.hour, d => locRange(d.neighborhood));
    hours.delete("none")
    // loop over keys with https://stackoverflow.com/questions/69145734/fastest-way-to-loop-through-map-keys
    hours.forEach(function(value, key){
        value.delete("other")
    })
    // for easier access in the y scale
    // remove by index with https://stackoverflow.com/a/5767357
    var hourTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.hour,d => locRange(d.neighborhood));
    hourTmp.splice(findIndexOfNone(hourTmp), 1);
    hourTmp = removeOtherFromSublists(hourTmp)
    console.log(hours)
    console.log(hourTmp)
    console.log(d3.min(hourTmp, D1 => d3.min(D1[1], d=>d[1])))
    console.log(d3.max(hourTmp, D1 => d3.max(D1[1], d=>d[1])))
    // Define X and Y scales
    //see https://d3js.org/d3-scale/band
    const y = d3.scaleBand()
        .domain( choices)
        .range([ 0, -height])
        //.padding(0.1);

    // scale band instead of time, since it reduces annoyance later hopefully
    const x = d3.scaleBand()
        .domain(hourOptionsList)
        .range([ 0, width]);
    
    
    var colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .nice()
        .domain( [d3.min(hourTmp, D1 => d3.min(D1[1], d=>d[1])),d3.max(hourTmp, D1 => d3.max(D1[1], d=>d[1]))])


        

    // Add X and Y axes
    
    svg.append("g")
        .attr("class", "axis axis-x")
        // ${x(d3.timeParse("%y")(72)-d3.timeParse("%y")(71))/2} shifts axis label for year to middle of year box
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(24));

    svg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars


    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    hourList = d3.map(d3.groups(data,d=>d.hour),D=>D[0])
    // remove none from hourlist, see  https://stackoverflow.com/a/5767357
    hourList.splice(hourList.indexOf("none"), 1)
    console.log(hourList)
    neighborhoodList = choices
    bandheight = Math.abs(y(choices[1])-y(choices[0]))
    console.log(bandheight)
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(hourList,neighborhoodList))
    dataSpots = d3.cross(hourList,neighborhoodList)

    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")


    bars =  svg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(hours.get("23").get("Mission"))

    // tooltips will be implemented using https://mappingwithd3.com/tutorials/basics/tooltip/
    bars.append("rect")
        .attr("test", d => `${d}`)
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", d => x(getNextHour("00"))-x("00"))
        .attr("height", d => bandheight)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("fill", d=>colorScale(hours.get(d[0]).get(d[1])))
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
                
                .html(`hour: ${d[0]}<br>neighborhood: ${d[1]}<br>Crashes:
                    ${hours.get(d[0]).get(d[1])}
                    `)
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
        console.log(hours.get("18").get("Mission"))
    const annotations = [
        {
            note: {
                label: "The number of crashes in the Mission  peaks around 6:00pm. The Financial district and South of Market both peak around 5pm.",
                title: "multiple neighborhoods peak around 6pm"
            },
        
            type: d3.annotationCalloutLabel,
            x: x("18")+x.step()/2,
            y: height+y("Mission")+y.step()/2,
            dx: 10,
            dy:130,
            color: "black"
        },
        {
            note: {
                label: "The number of crashes in the Tenderloin peaks around 3pm, 3 hours before the peak in the Mission.",
                title: "Tenderloin has different peak"
            },
        
            type: d3.annotationCalloutLabel,
            x: x("13")+x.step()/2,
            y: height+y("Tenderloin")+y.step()/2,
            dx: -35,
            dy:130+2*y.step(),
            color: "black"
        },

    ]
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        
        .annotations(annotations)
    d3.select("svg")
        .append("g")
        .attr("transform", ` translate(${margin.left},${margin.top}) `)
        .call(makeAnnotations);
  

    svg.append("text")
        .attr("class","axisLabelY")
        .text("neighborhood")
        .attr("x", -margin.left+10)
        .attr("y", height/2)
        
    svg.append("text")
        .attr("class","axisLabelX")
        .text("hour")
        .attr("x", width/2)
        .attr("y", height+50)

    svg.append("text")
    
        .text("heatmap of the accidents each hour for different neighborhoods")
        .attr("class", "title")
        .attr("x", (width-margin.left)/2-margin.right)
        .attr("y", -margin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: Number of Crashes")
		.titleWidth(100)
        .cells(7) // change the number of cells during demo 
        .scale(colorScale);
		

    svg.append("g")
        .attr("transform", `translate(${width+margin.right/2+20},0)`)
        .call(legend);
});