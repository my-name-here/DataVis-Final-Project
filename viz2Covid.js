// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up initial values
const monthlyCovidSvgWidth = 1350;
const monthlyCovidSvgHeight = 1000;
const monthlyCovidMargin = { top: 50, right: 150, bottom: 70, left: 200 };
const monthlyCovidWidth = monthlySvgWidth - monthlyMargin.left - monthlyMargin.right;
const monthlyCovidHeight = monthlySvgHeight - monthlyMargin.top - monthlyMargin.bottom;



let monthOptionsCovid = ["January", "February","March","April","May", "June","July","August","September","October","November","December"]


const monthlyCovidSvg = d3.select("#chart-container-monthlyCovid")
    .append("svg")
    // give it an id so we can reference it when adding annotation
    .attr("id", "monthlyCovidChart")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243
    .attr("viewBox", `0 0 ${monthlyCovidSvgWidth} ${monthlyCovidSvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${monthlyCovidMargin.left},${monthlyCovidMargin.top}) `);

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
function getNextMonth(CurMonth){
    // first create a list of months, which we will locate the provided month in, then get the next one
    var monthList = monthOptionsCovid
    //get index of current month
    monthIndex = monthList.indexOf(CurMonth)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newMonthIndex = Math.min(monthIndex+1, monthList.length -1 )
    return monthList[newMonthIndex]

}




// getting band from value using https://stackoverflow.com/a/38746923
// used to get value from pos for tooltip
function getBandFromValue(value, scale){

    index = Math.round(value/scale.step())
    return scale.domain()[index]
}
// Read data from CSV
d3.csv("./data/trafficClean.csv").then(function (data) {

    // extract values
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.month = d.month;
        d.lighting = d.lighting;
    });

    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    var months = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.month, d => CovCat(d.year));
    // normalize to avg per year
    months.forEach(function(value, key){
        value.set("pre-Covid", value.get("pre-Covid")/15)
        value.set("post-Covid", value.get("post-Covid")/5)

    })
    
    // for easier access in the y scale
    var monthsTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.month, d => CovCat(d.year));
    // normalize to avg per year

    monthsTmp.forEach(function(element){
        element[1][0][1] /= (element[1][0][0] == "pre-Covid" ? 15:5)
        element[1][1][1] /= (element[1][1][0] == "pre-Covid" ? 15:5)
    })
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(monthsTmp, D1 => d3.min(D1[1], d=>d[1]))-2, d3.max(monthsTmp, D1 => d3.max(D1[1], d=>d[1]))+2])
        .nice()
        .range([ 0, -monthlyCovidHeight])

    const x = d3.scaleBand()
        .domain(monthOptions)
        .range([ 0, monthlyCovidWidth]);
    
    // ordinal scale, see https://d3js.org/d3-scale/ordinal
    var colorScale = d3.scaleOrdinal()
        .domain( ["pre-Covid", "post-Covid"])

        // colors from colorbrewer
        .range(["#1b9e77", "#d95f02"])

        

    // Add X and Y axes
    monthlyCovidSvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${monthlyCovidHeight})`)
        .call(d3.axisBottom(x).ticks(12));

    monthlyCovidSvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${monthlyCovidHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // line for the tooltip
    monthlyCovidSvg.append("line")
        .attr("class", "lineMarkerMonthCovid")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", monthlyCovidHeight)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxMonth = d3.max(data, d => d.month)

    dispRangeList = ["pre-Covid", "post-Covid"]
    // see https://d3js.org/d3-array/transform for cross
    dataSpots = d3.cross(monthOptionsCovid,dispRangeList)

    // bandwidth for positioning things
    bandwidth = x("February")- x("January")
    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    
    bars =  monthlyCovidSvg.selectAll(".bar")
        .data(dataSpots)
        .enter()
        .append("g")

    bars.append("line")
        .attr("x1", d => x(d[0])+bandwidth/2)
        .attr("y1", d => y(months.get(d[0]).get(d[1])))
        .attr("x2", d => x(getNextMonth(d[0]))+bandwidth/2)
        .attr("y2", d => y(months.get(getNextMonth(d[0])).get(d[1])))
        .attr("stroke-width", 2)
        .attr("stroke", d=>colorScale(d[1]))
        .attr("transform", `translate(0, ${monthlyCovidHeight})`)// translate points down to match with axis


    

    monthlyCovidSvg.append("rect")
        .attr("x", -10)
        .attr("y", -monthlyCovidMargin.top)
        .attr("width", monthlyCovidWidth+10)
        .attr("height", monthlyCovidSvgHeight)
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
        d3.select(".lineMarkerMonthCovid")
            // d3.pointer(event) from https://d3js.org/d3-selection/events
            .attr("x1", `${d3.pointer(event)[0]}`)
            .attr("x2", `${d3.pointer(event)[0]}`)
            .attr("y1", -monthlyCovidMargin.top)
            .attr("y2", monthlyCovidHeight)
            .attr("style", "opacity:1")
        d3.select(".tooltip")
            .html(`month:${getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)}<br>post-Covid crashes per year: ${months.get(getBandFromValue((d3.pointer(event)[0]- bandwidth/2), x)).get("post-Covid")} <br>pre-Covid crashes per year: ${months.get(getBandFromValue((d3.pointer(event)[0]-bandwidth/2), x)).get("pre-Covid")}`)
            .style("opacity", 1)
            .style("left", `${event.pageX+15}px`)
            .style("top", `${event.pageY+15}px`)
        
        }
    )
    
    const annotations = [
        {
            note: {
                label: "There seems to be similar monthly trends pre and post Covid, with reduced values post Covid",
                title: "Similar trends"
            },
            type: d3.annotationCalloutRect,
            x: x("October")- 150,
            y: monthlyCovidHeight+(y(months.get("October").get("pre-Covid")))-30,
            dx: -100,
            dy: 100,
            subject:{
                width: 300,
                height: 200
            },
            color: "#AA4A44"
        },
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    d3.select("#monthlyCovidChart")
        .append("g")
        .attr("transform", ` translate(${monthlyCovidMargin.left},${monthlyCovidMargin.top}) `)
        .call(makeAnnotations);
    // scale axis tick label text
    d3.selectAll(".axis").attr("font-size","17px");
    monthlyCovidSvg.append("text")
        .text("accident count")
        .attr("x", -9*monthlyCovidMargin.left/10)
        .attr("y", monthlyCovidHeight/2)
        
    monthlyCovidSvg.append("text")
        .text("month")
        .attr("x", monthlyCovidSvgWidth/2-monthlyCovidMargin.left)
        .attr("y", monthlyCovidHeight+2*monthlyCovidMargin.bottom/3)

    monthlyCovidSvg.append("text")
        .text("line plot of the number of crashes per month, colored by whether it is pre or post Covid")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -monthlyCovidMargin.top/2)
        .attr("font-size", "20px")
    var legend = d3.legendColor()
		.title("Color Legend: pre or post Covid")
		.titleWidth(100)
        .cells(11) // change the number of cells during demo 
        .scale(colorScale);
		

    monthlyCovidSvg.append("g")
        .attr("transform", `translate(${monthlyCovidWidth+10},0)`)
        .call(legend);
});