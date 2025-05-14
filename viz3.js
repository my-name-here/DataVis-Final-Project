// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up initial values
const weeklySvgWidth = 1200;
const weeklySvgHeight = 1000;
const weeklyMargin = { top: 50, right: 150, bottom: 70, left: 180 };
const weeklyWidth = weeklySvgWidth - weeklyMargin.left - weeklyMargin.right;
const weeklyHeight = weeklySvgHeight - weeklyMargin.top - weeklyMargin.bottom;
const daysListMain = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


const weeklySvg = d3.select("#chart-container-weekly")
    .append("svg")
    // give the chart an id, so we can reference it when adding annotations
    .attr("id", "weeklyChart")
    // need to use viewBox instead of width and height see https://css-tricks.com/scale-svg/#aa-the-svg-scaling-toolbox for more detail
    // can also look at https://stackoverflow.com/a/63156174 and https://stackoverflow.com/a/73498243
    .attr("viewBox", `0 0 ${weeklySvgWidth} ${weeklySvgHeight}`)
    
    .append("g")
    .attr("transform", `translate(${weeklyMargin.left},${weeklyMargin.top}) `);

// a function that takes a day of the week, and returns it, left for consistnecy with other charts
function dayOfWeek(i){
    return i;
}
   

// since months are not numbers like years, but strings, we need a function to get the next month from the current one, and it should end in december
// this replaces the max(d[0]+1, maxMonth) in the x2 and y2 of the lines
function getNextDay(CurDay){
    //get index of current day
    dayIndex = daysListMain.indexOf(CurDay)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newDayIndex = Math.min(dayIndex+1, daysListMain.length -1 )
    return daysListMain[newDayIndex]

}
// Read data from CSV
d3.csv("./data/trafficClean.csv").then(function (data) {

    // extract data
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.weekday = d.day_of_week;
    });

    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const days = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.weekday);
    // remove data with no day
    days.delete("");
    // for easier access in the y scale
    // removing last element based on https://stackoverflow.com/questions/19544452/remove-last-item-from-array#comment84683867_19544452

    const daysTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.weekday).slice(0,-1);


    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([0, d3.max(daysTmp,  d=>d[1])+2])
        .nice()
        .range([ 0, -weeklyHeight])

    // use scaleBand instead of scale time, see https://stackoverflow.com/a/38820431
    const x = d3.scaleBand()
        .domain(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        .range([ 0, weeklyWidth]);
    

    // Add X and Y axes
    weeklySvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${weeklyHeight})`)
        .call(d3.axisBottom(x).ticks(10)
    );

    weeklySvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${weeklyHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxDay = d3.max(data, d => d.weekday)

    // bar width for sizing when adding bars
    barWidth = x("Monday")-x("Sunday")




    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")

    bars =  weeklySvg.selectAll(".bar")
        .data(daysListMain)
        .enter()
        .append("g")

    bars.append("rect")
        .attr("x", d=>x(d))
        .attr("y", d=>weeklyHeight+y(days.get(d)))
        .attr("width", barWidth)
        .attr("height", d=>-y(days.get(d)))
        .attr("fill","lightblue")
        .attr("stroke", "black")
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
                .html(`Day of the week: ${d}<br>Crashes:
                    ${days.get(d)}`)
                .style("opacity", 1)
                .style("left", `${event.pageX+15}px`)
                .style("top", `${event.pageY+15}px`)
            }
        )


        

    const annotations = [
        {
            note: {
                label: "Friday has the most crashes of any day of the week.",
                title: "Friday peak"
            },
            type: d3.annotationCalloutLabel,
            x: x("Friday")+x.step()/2,
            y: weeklyHeight+y(days.get("Friday")),
            dx: -70,
            dy: 50,
            color: "#AA4A44"
        },
        {
            note: {
                label: "The weekend, especially Sunday, have lower crash rates than most weekdays. ",
                title: "Weekend dip"
            },
            type: d3.annotationCalloutLabel,
            x: x("Sunday")+x.step()/2,
            y: weeklyHeight+y(days.get("Sunday")),
            dx: 65,
            dy: 75,
            color: "#AA4A44"
        },
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    d3.select("#weeklyChart")
        .append("g")
        .attr("transform", ` translate(${weeklyMargin.left},${weeklyMargin.top}) `)
        .call(makeAnnotations);
    // scale axis tick label text
    d3.selectAll(".axis").attr("font-size","17px");

    weeklySvg.append("text")
        .text("accident count")
        .attr("x", -weeklyMargin.left)
        .attr("y", weeklyHeight/2)
        
    weeklySvg.append("text")
        .text("day of the week")
        .attr("x", weeklySvgWidth/2-weeklyMargin.left)
        .attr("y", weeklyHeight+2*weeklyMargin.bottom/3)

    weeklySvg.append("text")
        .text("bar chart of the number of crashes per weekday")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -weeklyMargin.top/2)


});