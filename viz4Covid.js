// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const hourlyCovidSvgWidth = 1200;
const hourlyCovidSvgHeight = 1000;
const hourlyCovidMargin = { top: 50, right: 150, bottom: 70, left: 170 };
const hourlyCovidWidth = hourlyCovidSvgWidth - hourlyCovidMargin.left - hourlyCovidMargin.right;
const hourlyCovidHeight = hourlyCovidSvgHeight - hourlyCovidMargin.top - hourlyCovidMargin.bottom;


let hourOptions = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10","11","12","13","14","15","16","17","18","19","20","21","22","23"]


const hourlyCovidSvg = d3.select("#chart-container-hourlyCovid")
    .append("svg")
    .attr("id", "hourlyCovidChart")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${hourlyCovidSvgWidth} ${hourlyCovidSvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${hourlyCovidMargin.left},${hourlyCovidMargin.top}) `);

// a function that takes a displacement, and converts it to a string representing the range
function CovCat(i){
    if (i >= 2020){
        return "post-Covid";
    }
    else{
        return "pre-Covid"
    }
    
}
// since months are not numbers like years, but strings, we need a function to get the next month from the current one, and it should end in december
// this replaces the max(d[0]+1, maxMonth) in the x2 and y2 of the lines
function getNextHour(CurMonth){
    // first create a list of months, which we will locate the provided month in, then get the next one
    var monthList = hourOptions
    //get index of current month
    monthIndex = monthList.indexOf(CurMonth)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newMonthIndex = Math.min(monthIndex+1, monthList.length -1 )
    return monthList[newMonthIndex]

}


// console.log(getNextHour("December"))


// getting band from value using https://stackoverflow.com/a/38746923
function getBandFromValue(value, scale){

    index = Math.round(value/scale.step())
    return scale.domain()[index]
}



function hourFromTime(time){
    if (time.length>=2){// make sure not empty hour
        return time.substring(0,2)
    }
    else{
        return "none"
    }
}

// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.month = d.month;
        d.hour = hourFromTime(d.collision_time);
        d.lighting = d.lighting;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    var months = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.hour, d => CovCat(d.year));
    months.forEach(function(value, key){
        value.set("pre-Covid", value.get("pre-Covid")/15)
        value.set("post-Covid", value.get("post-Covid")/5)

    })
    // for easier access in the y scale
    var monthsTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.hour, d => CovCat(d.year));
    monthsTmp.forEach(function(element){
        element[1][0][1] /= (element[1][0][0] == "pre-Covid" ? 15:5)
        element[1][1][1] /= (element[1][1][0] == "pre-Covid" ? 15:5)
    })
    console.log(months)
    console.log(d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1])))
    console.log(d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1])))
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -hourlyCovidHeight])
        //.padding(0.1);

    const x = d3.scaleBand()
        .domain(hourOptions)
        .range([ 0, hourlyCovidWidth]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["pre-Covid", "post-Covid"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02"])

        

    // Add X and Y axes
    hourlyCovidSvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${hourlyCovidHeight})`)
        // see https://stackoverflow.com/a/45407965 for fixing january showing as 1900 instead of as january
        .call(d3.axisBottom(x).ticks(12)
    );

    hourlyCovidSvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${hourlyCovidHeight})`)
        .call(d3.axisLeft(y).ticks(20));


    hourlyCovidSvg.append("line")

        .attr("class", "lineMarkerHourlyCovid")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", hourlyCovidHeight)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxMonth = d3.max(data, d => d.month)
    console.log(maxMonth)

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    monthsList = hourOptions
    console.log(monthsList)
    dispRangeList = ["pre-Covid", "post-Covid"]
    // see https://d3js.org/d3-array/transform for cross
    console.log(d3.cross(monthsList,dispRangeList))
    dataSpots = d3.cross(monthsList,dispRangeList)

    bandwidth = x("01")- x("00")
    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    
    bars =  hourlyCovidSvg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")
    console.log(months.get("January"))
    console.log(dataSpots)
    bars.append("line")
        .attr("test", d => `${d}`)
        .attr("x1", d => x(d[0])+bandwidth/2)
        .attr("y1", d => y(months.get(d[0]).get(d[1])))
        .attr("x2", d => x(getNextHour(d[0]))+bandwidth/2)
        .attr("y2", d => y(months.get(getNextHour(d[0])).get(d[1])))
        .attr("stroke-width", 2)
        .attr("stroke", d=>colorScale(d[1]))

        .attr("transform", `translate(0, ${hourlyCovidHeight})`)// translate points down to match with axis

    // bars.append("text")
    //     .attr("class", "barLabel")
    //     .text(d => `mpg: ${(d["economy (mpg)"])}`)
    //     .attr("y", d => y(d.name)+15)
    //     .attr("x", d => 25)
        
    
    console.log(x(d3.timeParse("%Y")("2024")))
    console.log(x(2009))
    console.log(getBandFromValue(x(2009),x))
    hourlyCovidSvg.append("rect")
        .attr("x", -10)
        .attr("y", -hourlyCovidMargin.top)
        .attr("width", hourlyCovidWidth+10)
        .attr("height", hourlyCovidSvgHeight)
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
        d3.select(".lineMarkerHourlyCovid")
            // d3.pointer(event) from https://d3js.org/d3-selection/events

            .attr("x1", `${d3.pointer(event)[0]}`)
            .attr("x2", `${d3.pointer(event)[0]}`)
            .attr("y1", -hourlyCovidMargin.top)
            .attr("y2", hourlyCovidHeight)
            .attr("style", "opacity:1")
        d3.select(".tooltip")

            .html(`hour:${getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)}<br>post-Covid crashes per year: ${months.get(getBandFromValue((d3.pointer(event)[0]- bandwidth/2), x)).get("post-Covid")} <br>pre-Covid crashes per year: ${months.get(getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)).get("pre-Covid")}`)
            .style("opacity", 1)
            .style("left", `${event.pageX+15}px`)
            .style("top", `${event.pageY+15}px`)
        
        }
    )
    
    const annotations = [
 
        {
            note: {
                label: "There is a significant reduction in crashes on weekdays post Covid, possibly indicating a still ongoing increase in remote work.",
                title: "Reduced weekday crashes"
            },
            type: d3.annotationCalloutRect,
            x: x("08") - 150,
            y: hourlyCovidHeight+(y(months.get("08").get("post-Covid")))-100,
            dx: -50,
            dy: -40,
            subject:{
                width: 500,
                height: 200
            },
            color: "#AA4A44"
            
    
        },
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        
        .annotations(annotations)
    d3.select("#hourlyCovidChart")
        .append("g")
        .attr("transform", ` translate(${hourlyCovidMargin.left},${hourlyCovidMargin.top}) `)
        .call(makeAnnotations);
    d3.selectAll(".axis").attr("font-size","17px");
    hourlyCovidSvg.append("text")
        .text("accident count")
        .attr("x", -hourlyCovidMargin.left)
        .attr("y", hourlyCovidHeight/2)
        
    hourlyCovidSvg.append("text")
        .text("hour")
        .attr("x", hourlyCovidSvgWidth/2-hourlyCovidMargin.left)
        .attr("y", hourlyCovidHeight+2*hourlyCovidMargin.bottom/3)

    hourlyCovidSvg.append("text")
    
        .text("line plot of the number of crashes per hour, colored by pre or post Covid")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -hourlyCovidMargin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: pre or post Covid")
		.titleWidth(100)
        .cells(11) // change the number of cells during demo 
        .scale(colorScale);
		

    hourlyCovidSvg.append("g")
        .attr("transform", `translate(${hourlyCovidWidth+10},0)`)
        .call(legend);
    
});