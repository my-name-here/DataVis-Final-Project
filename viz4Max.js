// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const hourlyMaxSvgWidth = 1200;
const hourlyMaxSvgHeight = 1000;
const hourlyMaxMargin = { top: 50, right: 200, bottom: 750, left: 250 };
const hourlyMaxWidth = hourlyMaxSvgWidth - hourlyMaxMargin.left - hourlyMaxMargin.right;
const hourlyMaxHeight = hourlyMaxSvgHeight - hourlyMaxMargin.top - hourlyMaxMargin.bottom;
let hourlyMaxNeighborhoodChoices = ["Bayview Hunters Point", "Financial District/South Beach", "Mission", "South of Market", "Tenderloin"]
let hourlyMaxHourOptionsList = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10","11","12","13","14","15","16","17","18","19","20","21","22","23"]



function getNextHour(CurHour){
    // first create a list of months, which we will locate the provided month in, then get the next one
    
    //get index of current month
    hourIndex = hourlyMaxHourOptionsList.indexOf(CurHour)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newHourIndex = Math.min(hourIndex+1, hourlyMaxHourOptionsList.length -1 )
    return hourlyMaxHourOptionsList[newHourIndex]

}

const hourlyMaxSvg = d3.select("#chart-container-hourlyMax")
    .append("svg")
    .attr("id", "hourlyChartMax")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243
    .attr("viewBox", `0 0 ${hourlyMaxSvgWidth} ${hourlyMaxSvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${hourlyMaxMargin.left},${hourlyMaxMargin.top})`);

// a function that takes a neighborhood, and gives out either the neighborhood if it is in the list of saved neighborhoods, or other
function locRange(i){
    neighborhoodChoices = hourlyMaxNeighborhoodChoices;
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
        .domain( hourlyMaxNeighborhoodChoices)
        .range([ 0, -hourlyMaxHeight])
        //.padding(0.1);

    // scale band instead of time, since it reduces annoyance later hopefully
    const x = d3.scaleBand()
        .domain(hourlyMaxHourOptionsList)
        .range([ 0, hourlyMaxWidth]);
    
    
    var colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateBlues)
        .nice()
        .domain( [d3.min(hourTmp, D1 => d3.min(D1[1], d=>d[1])),d3.max(hourTmp, D1 => d3.max(D1[1], d=>d[1]))])


        

    // Add X and Y axes
    
    hourlyMaxSvg.append("g")
        .attr("class", "axis axis-x")
        // ${x(d3.timeParse("%y")(72)-d3.timeParse("%y")(71))/2} shifts axis label for year to middle of year box
        .attr("transform", `translate(0, ${hourlyMaxHeight})`)
        .call(d3.axisBottom(x).ticks(24));

        hourlyMaxSvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${hourlyMaxHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars


    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    hourList = d3.map(d3.groups(data,d=>d.hour),D=>D[0])
    // remove none from hourlist, see  https://stackoverflow.com/a/5767357
    hourList.splice(hourList.indexOf("none"), 1)
    console.log(hourList)
    neighborhoodList = hourlyMaxNeighborhoodChoices
    bandheight = Math.abs(y(hourlyMaxNeighborhoodChoices[1])-y(hourlyMaxNeighborhoodChoices[0]))
    console.log(bandheight)
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(hourlyMaxHourOptionsList,neighborhoodList))
    dataSpots = d3.cross(hourlyMaxHourOptionsList,neighborhoodList)

    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")


    bars =  hourlyMaxSvg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(hours.get("23").get("Mission"))

    maxVals = {"Mission":18,"South of Market":17,"Bayview Hunters Point":17,"Financial District/South Beach":17,"Tenderloin":15}
    // tooltips will be implemented using https://mappingwithd3.com/tutorials/basics/tooltip/
    bars.append("rect")
        .attr("test", d => `${(d[0],d[1])}`)
        .attr("x", d => x(d[0]))
        .attr("y", d => y(d[1]))
        .attr("width", d => x(getNextHour("00"))-x("00"))
        .attr("height", d => bandheight)
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        // ternary to highlight maxxes in a different color
        // if cond is true, then not a max, so use colorScale(hours.get(d[0]).get(d[1]))
        // if false, then max, so use green
        // maxVals will be list of (hour, loc) of max values
        // then condition is if not (maxVal[d[1]] == d[0])
        // so (!(maxVal[d[1]] == d[0]) ? colorScale(hours.get(d[0]).get(d[1])): "green")
        .attr("fill", d=>(!(maxVals[d[1]] == d[0]) ? colorScale(hours.get(d[0]).get(d[1])): "green"))
        .attr("transform", `translate(0, ${hourlyMaxHeight})`)// translate points down to match with axis
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


    ]
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        
        .annotations(annotations)
    d3.select("#hourlyChartMax")
        .append("g")
        .attr("transform", ` translate(${hourlyMaxMargin.left},${hourlyMaxMargin.top}) `)
        .call(makeAnnotations);
  
    d3.selectAll(".axis").attr("font-size","17px");

    hourlyMaxSvg.append("text")
        .attr("class","axisLabelY")
        .text("neighborhood")
        .attr("x", -3*hourlyMaxMargin.left/4)
        .attr("y", hourlyMaxHeight/2)
        
    hourlyMaxSvg.append("text")
        .attr("class","axisLabelX")
        .text("hour")
        .attr("x", hourlyMaxSvgWidth/2 - hourlyMaxMargin.left)
        .attr("y", hourlyMaxHeight+50)

    hourlyMaxSvg.append("text")
    
        .text("heatmap of the accidents each hour for different neighborhoods")
        .attr("class", "title")
        .attr("x", (hourlyMaxWidth-hourlyMaxMargin.left)/2-hourlyMaxMargin.right)
        .attr("y", -hourlyMaxMargin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: Number of Crashes")
		.titleWidth(100)
        .cells(7) // change the number of cells during demo 
        .scale(colorScale);
		

    hourlyMaxSvg.append("g")
        .attr("transform", `translate(${hourlyMaxWidth+hourlyMaxMargin.right/4},0)`)
        .call(legend);
});