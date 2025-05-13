// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up initial vals
const monthlySvgWidth = 1350;
const monthlySvgHeight = 1000;
const monthlyMargin = { top: 50, right: 150, bottom: 70, left: 200 };
const monthlyWidth = monthlySvgWidth - monthlyMargin.left - monthlyMargin.right;
const monthlyHeight = monthlySvgHeight - monthlyMargin.top - monthlyMargin.bottom;


let monthOptions = ["January", "February","March","April","May", "June","July","August","September","October","November","December"]

const monthlySvg = d3.select("#chart-container-monthly")
    .append("svg")
    // so we add the annotations to the correct chart
    .attr("id", "monthlyChart")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243

    .attr("viewBox", `0 0 ${monthlySvgWidth} ${monthlySvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${monthlyMargin.left},${monthlyMargin.top}) `);

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
    var monthList = monthOptions
    //get index of current month
    monthIndex = monthList.indexOf(CurMonth)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newMonthIndex = Math.min(monthIndex+1, monthList.length -1 )
    return monthList[newMonthIndex]

}




// getting band from value using https://stackoverflow.com/a/38746923
// used for getting value from pos for tooltip
function getBandFromValue(value, scale){
    index = Math.round(value/scale.step())
    return scale.domain()[index]
}
// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // extract the values
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.month = d.month;
        d.lighting = d.lighting;
    });

    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const months = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.month, d => lightCat(d.lighting));
    // for easier access in the y scale
    const monthsTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.month, d => lightCat(d.lighting));

    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -monthlyHeight])
        //.padding(0.1);

    const x = d3.scaleBand()
        .domain(monthOptions)
        .range([ 0, monthlyWidth]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["day", "night"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02"])

        

    // Add X and Y axes
    monthlySvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${monthlyHeight})`)
        // see https://stackoverflow.com/a/45407965 for fixing january showing as 1900 instead of as january
        .call(d3.axisBottom(x).ticks(12));

    monthlySvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${monthlyHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // line for tooltip
    monthlySvg.append("line")
        .attr("class", "lineMarkerMonthly")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", monthlyHeight)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxMonth = d3.max(data, d => d.month)

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    dispRangeList = ["day", "night"]
    // see https://d3js.org/d3-array/transform for cross
    monthlyDataSpots = d3.cross(monthOptions,dispRangeList)
    //bandwidth for positioning
    bandwidth = x("February")- x("January")
    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    
    bars =  monthlySvg.selectAll(".bar")
        .data(monthlyDataSpots)
        .enter()
        .append("g")

    bars.append("line")
        .attr("x1", d => x(d[0])+bandwidth/2)
        .attr("y1", d => y(months.get(d[0]).get(d[1])))
        .attr("x2", d => x(getNextMonth(d[0]))+bandwidth/2)
        .attr("y2", d => y(months.get(getNextMonth(d[0])).get(d[1])))
        .attr("stroke-width", 2)
        .attr("stroke", d=>colorScale(d[1]))

        .attr("transform", `translate(0, ${monthlyHeight})`)// translate points down to match with axis

    // bars.append("text")
    //     .attr("class", "barLabel")
    //     .text(d => `mpg: ${(d["economy (mpg)"])}`)
    //     .attr("y", d => y(d.name)+15)
    //     .attr("x", d => 25)
        
    

    monthlySvg.append("rect")
        .attr("x", -10)
        .attr("y", -monthlyMargin.top)
        .attr("width", monthlyWidth+10)
        .attr("height", monthlySvgHeight)
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
        d3.select(".lineMarkerMonthly")
            // d3.pointer(event) from https://d3js.org/d3-selection/events

            .attr("x1", `${d3.pointer(event)[0] }`)
            .attr("x2", `${d3.pointer(event)[0] }`)
            .attr("y1", -monthlyMargin.top)
            .attr("y2", monthlyHeight)
            .attr("style", "opacity:1")
        d3.select(".tooltip")

            .html(`month:${getBandFromValue((d3.pointer(event)[0] -bandwidth/2), x)}<br>day crashes: ${months.get(getBandFromValue((d3.pointer(event)[0] - bandwidth/2), x)).get("day")} <br>night crashes: ${months.get(getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)).get("night")}`)
            .style("opacity", 1)
            .style("left", `${event.pageX+15}px`)
            .style("top", `${event.pageY+15}px`)
        
        }
    )

    const annotations = [
        {
        note: {
            label: "The number of crashes during the day and during the night are closer in the Winter, with night even surpassing day at times.",
            title: "Winter similarity"
        },
        type: d3.annotationCalloutCircle,
        x: x("December")+bandwidth/2,
        y: monthlyHeight+(y(months.get("December").get("day"))+y(months.get("December").get("night")))/2,
        dx: -150,
        dy: -10,
        subject:{
            radius: 30,
        },
        color: "#AA4A44"
        },
        {
            note: {
                label: "During the Summer, there is a lot more crashes during the day compared to at night.",
                title: "Summer difference"
            },
            type: d3.annotationCalloutRect,
            x: x("May")+bandwidth/2,
            y: monthlyHeight+y(months.get("May").get("day"))-30,
            dx: 100,
            dy: 100,
            subject:{
                width: 300,
                height: 60
            },
            color: "#AA4A44"
        },
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    d3.select("#monthlyChart")
        .append("g")
        .attr("transform", ` translate(${monthlyMargin.left},${monthlyMargin.top}) `)
        .call(makeAnnotations);
    d3.selectAll(".axis").attr("font-size","17px");

    monthlySvg.append("text")
        .text("accident count")
        .attr("x", -9*monthlyMargin.left/10)
        .attr("y", monthlyHeight/2)
        
    monthlySvg.append("text")
        .text("month")
        .attr("x", monthlySvgWidth/2-monthlyMargin.left)
        .attr("y", monthlyHeight+2*monthlyMargin.bottom/3)

    monthlySvg.append("text")
        .text("line plot of the number of crashes per month, colored by whether it happened at day or night")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -monthlyMargin.top/2)
    var legend = d3.legendColor()
		.title("Color Legend: time of day")
		.titleWidth(100)
        .cells(11) // change the number of cells during demo 
        .scale(colorScale);
		
    monthlySvg.append("g")
        .attr("transform", `translate(${monthlyWidth+10},0)`)
        .call(legend);
});