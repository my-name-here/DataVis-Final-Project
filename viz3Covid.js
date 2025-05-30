// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const weeklyCovidSvgWidth = 1200;
const weeklyCovidSvgHeight = 1000;
const weeklyCovidMargin = { top: 50, right: 150, bottom: 70, left: 170 };
const weeklyCovidWidth = weeklyCovidSvgWidth - weeklyCovidMargin.left - weeklyCovidMargin.right;
const weeklyCovidHeight = weeklyCovidSvgHeight - weeklyCovidMargin.top - weeklyCovidMargin.bottom;

let DayOptionsCovid = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


const weeklyCovidSvg = d3.select("#chart-container-weeklyCovid")
    .append("svg")
    .attr("id", "weeklyCovidChart")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243
    .attr("viewBox", `0 0 ${weeklyCovidSvgWidth} ${weeklyCovidSvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${weeklyCovidMargin.left},${weeklyCovidMargin.top}) `);

// a function that takes a displacement, and converts it to a string representing the range
function CovCat(i){
    if (i >= 2020){
        return "post-Covid";
    }
    else{
        return "pre-Covid"
    }
    
}
//from viz3.js
function getNextDay(CurDay){
    //get index of current day
    dayIndex = DayOptionsCovid.indexOf(CurDay)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newDayIndex = Math.min(dayIndex+1, DayOptionsCovid.length -1 )
    return DayOptionsCovid[newDayIndex]
}




// getting band from value using https://stackoverflow.com/a/38746923
// used for getting value for a position
function getBandFromValue(value, scale){
    index = Math.round(value/scale.step())
    return scale.domain()[index]
}
// Read data from CSV
d3.csv("./data/trafficClean.csv").then(function (data) {

    // extract values
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.weekday = d.day_of_week;
    });

    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    var weeks = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.weekday, d => CovCat(d.year));
    // normalize data
    weeks.forEach(function(value, key){
        value.set("pre-Covid", value.get("pre-Covid")/15)
        value.set("post-Covid", value.get("post-Covid")/5)

    })
    // for easier access in the y scale
    var weeksTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.weekday, d => CovCat(d.year));
    // remove the last element that is null("") (see https://stackoverflow.com/a/19544524)
    weeksTmp = weeksTmp.slice(0,-1)
    weeksTmp.forEach(function(element){
        element[1][0][1] /= (element[1][0][0] == "pre-Covid" ? 15:5)
        element[1][1][1] /= (element[1][1][0] == "pre-Covid" ? 15:5)
    })
   
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(weeksTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(weeksTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -weeklyCovidHeight])

    const x = d3.scaleBand()
        .domain(DayOptionsCovid)
        .range([ 0, weeklyCovidWidth]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["pre-Covid", "post-Covid"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02"])

        

    // Add X and Y axes
    weeklyCovidSvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${weeklyCovidHeight})`)
        .call(d3.axisBottom(x).ticks(12));

    weeklyCovidSvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${weeklyCovidHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // tooltip line
    weeklyCovidSvg.append("line")
        .attr("class", "lineMarkerWeeklyCovid")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", weeklyCovidHeight)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")

    // Add bars



    dispRangeList = ["pre-Covid", "post-Covid"]
    // see https://d3js.org/d3-array/transform for cross
    dataSpots = d3.cross(DayOptionsCovid,dispRangeList)
    // used for positioning
    bandwidth = x("Monday")- x("Sunday")
    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    
    bars =  weeklyCovidSvg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")

    bars.append("line")
        .attr("x1", d => x(d[0])+bandwidth/2)
        .attr("y1", d => y(weeks.get(d[0]).get(d[1])))
        .attr("x2", d => x(getNextDay(d[0]))+bandwidth/2)
        .attr("y2", d => y(weeks.get(getNextDay(d[0])).get(d[1])))
        .attr("stroke-width", 2)
        .attr("stroke", d=>colorScale(d[1]))
        .attr("transform", `translate(0, ${weeklyCovidHeight})`)// translate points down to match with axis

        
    weeklyCovidSvg.append("rect")
        .attr("x", -10)
        .attr("y", -weeklyCovidMargin.top)
        .attr("width", weeklyCovidWidth+10)
        .attr("height", weeklyCovidSvgHeight)
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
        d3.select(".lineMarkerWeeklyCovid")
            // d3.pointer(event) from https://d3js.org/d3-selection/events

            .attr("x1", `${d3.pointer(event)[0]}`)
            .attr("x2", `${d3.pointer(event)[0]}`)
            .attr("y1", -weeklyCovidMargin.top)
            .attr("y2", weeklyCovidHeight)
            .attr("style", "opacity:1")
        d3.select(".tooltip")
            .html(`day of week:${getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)}<br>post-Covid crashes per year: ${weeks.get(getBandFromValue((d3.pointer(event)[0]- bandwidth/2), x)).get("post-Covid")} <br>pre-Covid crashes per year: ${weeks.get(getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)).get("pre-Covid")}`)
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
            x: x("Wednesday") - 150,
            y: weeklyCovidHeight+(y(weeks.get("Wednesday").get("post-Covid")))-100,
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
    d3.select("#weeklyCovidChart")
        .append("g")
        .attr("transform", ` translate(${weeklyCovidMargin.left},${weeklyCovidMargin.top}) `)
        .call(makeAnnotations);
    // scale axis tick label text
    d3.selectAll(".axis").attr("font-size","17px");

    weeklyCovidSvg.append("text")
        .text("accident count")
        .attr("x", -weeklyCovidMargin.left)
        .attr("y", weeklyCovidHeight/2)
        
    weeklyCovidSvg.append("text")
        .text("day of week")
        .attr("x",  weeklyCovidSvgWidth/2-weeklyCovidMargin.left)
        .attr("y", weeklyCovidHeight+2*weeklyCovidMargin.bottom/3)

    weeklyCovidSvg.append("text")
    
        .text("line plot of the number of crashes each day of the week, colored by whether it is pre or post covid")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -weeklyCovidMargin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: pre or post covid")
		.titleWidth(100)
        .cells(11) // change the number of cells during demo 
        .scale(colorScale);
		

    weeklyCovidSvg.append("g")
        .attr("transform", `translate(${weeklyCovidWidth+10},0)`)
        .call(legend);
});