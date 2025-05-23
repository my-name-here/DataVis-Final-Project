// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// set up initial values
const yearlySvgWidth = 1200;
const yearlySvgHeight = 1000;
const yearlyMargin = { top: 50, right: 20, bottom: 70, left: 150 };
const yearlyWidth = yearlySvgWidth - yearlyMargin.left - yearlyMargin.right;
const yearlyheight = yearlySvgHeight - yearlyMargin.top - yearlyMargin.bottom;


let yearChoices = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

const yearlySvg = d3.select("#chart-container-yearly")
    .append("svg")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243

    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);

// get the next year from the current year.
function nextYear(year){
    yearIndex = yearChoices.indexOf(year)

    newYearIndex = Math.min(yearIndex+1, yearChoices.length-1 )

    return yearChoices[newYearIndex]
}

// getting band from value using https://stackoverflow.com/a/38746923
// used to get the value from position in tooltips
function getBandFromValue(value, scale){
    index = Math.round(value/scale.step())
    return scale.domain()[index]
}

// Read data from CSV
d3.csv("./data/trafficClean.csv").then(function (data) {
    // extract the data we want
    data.forEach(function (d) {
        d.year = +d.accident_year
    });

    // rollup code based on https://observablehq.com/@d3/d3-group
    const years = d3.rollup(data, v => d3.count(v, d => d.year), d => d.year);
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([d3.min(years, d => d[1])-2, d3.max(years, d => d[1])+2])
        .nice()
        .range([ 0, -yearlyheight]);

    const x = d3.scaleBand()
        .domain(yearChoices)
        .range([ 0, yearlyWidth]);
    



    
    // Add X and Y axes
    yearlySvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${yearlyheight})`)
        .call(d3.axisBottom(x).ticks(20));

    yearlySvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${yearlyheight})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxYear = d3.max(data, d => d["year"])
    
    // line for the tooltip
    yearlySvg.append("line")
        .attr("class", "lineMarker")
        .attr("x1", 300)
        .attr("y1", 0)
        .attr("x2", 300)
        .attr("y2", yearlyheight)
        .attr("strokewidth", 2)
        .attr("stroke","black")
        .attr("style", "opacity: 0")

    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    bars =  yearlySvg.selectAll(".bar")
        .data(years)
        .enter()
        .append("g")
        
    // define bandwidth, for positioning
    bandwidth = x(2006)- x(2005)
    bars.append("line")
        .attr("x1", d => x(d[0])+ bandwidth/2)
        .attr("y1", d => y(years.get(d[0])))
        .attr("x2", d => x(nextYear(d[0]))+ bandwidth/2)
        .attr("y2", d => y(years.get(nextYear(d[0]))))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("transform", `translate(0, ${yearlyheight})`)// translate points down to match with axis

    bars.append("circle")
        .attr("cx", d => x(d[0])+ bandwidth/2)
        .attr("cy", d => y(years.get(d[0])))
        .attr("r", 3)
        .attr("transform", `translate(0, ${yearlyheight})`)// translate points down to match with axis

    yearlySvg.append("rect")
        .attr("x", -10)
        .attr("y", -yearlyMargin.top)
        .attr("width", yearlyWidth+10)
        .attr("height", yearlySvgHeight)
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
            // d3.pointer(event) from https://d3js.org/d3-selection/events
            .attr("x1", `${d3.pointer(event)[0] }`)
            .attr("x2", `${d3.pointer(event)[0] }`)
            .attr("y1", -yearlyMargin.top)
            .attr("y2", yearlyheight)
            .attr("style", "opacity:1")
        d3.select(".tooltip")
            .html(`year:${getBandFromValue((d3.pointer(event)[0] -bandwidth/2), x)}<br>crashes: ${years.get(getBandFromValue((d3.pointer(event)[0] - bandwidth/2), x))}`)
            .style("opacity", 1)
            .style("left", `${event.pageX+15}px`)
            .style("top", `${event.pageY+15}px`)
        }
    )

    // annotation code based on https://d3-graph-gallery.com/graph/custom_annotation.html
    // Features of the annotation

    const annotations = [
        {
        note: {
            label: "The number of crashes fell in 2020, presumably due to Covid",
            title: "2020 Dip"
        },
        type: d3.annotationCalloutCircle,
        x: x(2020)+bandwidth/2,
        y: yearlyheight+y(years.get(2020)),
        dx: 100,
        dy: -100,
        subject:{
            radius: 30,
        },
        color: "#AA4A44"
        },
        {
            note: {
                label: "The number of crashes in 2019 were similar to in previous years, though was on the higher side.",
                title: "2019 levels"
            },
            type: d3.annotationCalloutCircle,
            x: x(2019)+bandwidth/2,
            y: yearlyheight+y(years.get(2019)),
            dx: 100,
            dy: 100,
            subject:{
                radius: 30,
            },
            color: "#AA4A44"
        },
        {
            note: {
                label: "The number of crashes in 2024 is in the lower end of pre-2020 levels, indicating that they have still not fully returned to pre-pandemic levels",
                title: "2024 levels"
            },
            type: d3.annotationCalloutCircle,
            x: x(2024)+bandwidth/2,
            y: yearlyheight+y(years.get(2024)),
            dx: -240,
            dy:20,
            subject:{
                radius: 30,
            },
            color: "#AA4A44"
        }
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    d3.select("svg")
        .append("g")
        .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `)
        .call(makeAnnotations);
    
    // scale axis tick label text
    d3.selectAll(".axis").attr("font-size","17px");
    yearlySvg.append("text")
        .text("accidents")
        .attr("x", -yearlyMargin.left)
        .attr("y", yearlyheight/2)
        
    yearlySvg.append("text")
        .text("year")
        .attr("x", yearlySvgWidth/2 - yearlyMargin.left)
        .attr("y", yearlyheight+yearlyMargin.bottom/2)

    yearlySvg.append("text")
        .text("line plot of the number of accidents per year")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -yearlyMargin.top/2)
});