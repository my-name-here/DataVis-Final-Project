// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const svgWidth = 1200;
const svgHeight = 1000;
const margin = { top: 50, right: 150, bottom: 70, left: 150 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const minSize = 1
const maxSize = 6
let months
const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top}) `);

// a function that takes a day of the week, and returns it
function dayOfWeek(i){
    return i;
}
   

// since months are not numbers like years, but strings, we need a function to get the next month from the current one, and it should end in december
// this replaces the max(d[0]+1, maxMonth) in the x2 and y2 of the lines
function getNextDay(CurDay){
    // first create a list of months, which we will locate the provided month in, then get the next one
    var daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    //get index of current month
    dayIndex = daysList.indexOf(CurDay)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newDayIndex = Math.min(dayIndex+1, daysList.length -1 )
    return daysList[newDayIndex]

}
console.log(getNextDay("Saturday"))
// Read data from CSV
d3.csv("https://raw.githubusercontent.com/my-name-here/DataVis-Final-Project/refs/heads/main/trafficClean.csv").then(function (data) {

    // Convert string values to numbers
    data.forEach(function (d) {
        d.year = +d.accident_year
        d.weekday = d.day_of_week;
    });

    data.sort((a,b) => a.name>b.name);
    console.log(data);
    // rollup code based on https://d3js.org/d3-array/group and https://observablehq.com/@d3/d3-group
    // using a function as a key is something we do all the time in attributes
    const days = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => d.weekday);
    days.delete("");
    // for easier access in the y scale
    // removing last element based on https://stackoverflow.com/questions/19544452/remove-last-item-from-array#comment84683867_19544452

    const daysTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => d.weekday).slice(0,-1);


    console.log(days)
    console.log(daysTmp)

    console.log(d3.min(daysTmp, d=>d[1]))
    console.log(d3.max(daysTmp,  d=>d[1]))
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([0, d3.max(daysTmp,  d=>d[1])+2])
        .nice()
        .range([ 0, -height])
        //.padding(0.1);

    // use scaleBand instead of scale time, see https://stackoverflow.com/a/38820431
    const x = d3.scaleBand()
        .domain(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
        .range([ 0, width]);
    
console.log(x("Monday"))

    // Add X and Y axes
    svg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${height})`)
        // see https://stackoverflow.com/a/45407965 for fixing january showing as 1900 instead of as january
        .call(d3.axisBottom(x).ticks(10)
    );

    svg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxDay = d3.max(data, d => d.weekday)
    console.log(maxDay)

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    // remove last element again
    daysList = d3.map(d3.groups(data,d=>d.weekday),D=>D[0]).slice(0,-1);
    console.log(daysList)

    // see https://d3js.org/d3-array/transform for cross
    barWidth = x("Monday")-x("Sunday")
    console.log(x("Wednesday"))
    console.log(days.get("Wednesday"))
    console.log(y(days.get("Wednesday")))

    console.log(barWidth)



    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")



    bars =  svg.selectAll(".bar")
        .data(daysList)
        .enter()
        .append("g")



    
    bars.append("rect")
        .attr("test", d=>y(days.get(d)))

        .attr("x", d=>x(d))
        .attr("y", d=>height+y(days.get(d)))
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
                    ${days.get(d)}
                    `)
                .style("opacity", 1)
                .style("left", `${event.pageX+15}px`)
                .style("top", `${event.pageY+15}px`)
            }
        )
        //.attr("transform", `translate(0, ${height})`)// translate points down to match with axis

    // bars.append("text")
    //     .attr("class", "barLabel")
    //     .text(d => `mpg: ${(d["economy (mpg)"])}`)
    //     .attr("y", d => y(d.name)+15)
    //     .attr("x", d => 25)
        

    const annotations = [
        {
            note: {
                label: "Friday has the most crashes of any day of the week, with most other weekdays having around 500 less crashes.",
                title: "Friday peak"
            },
            type: d3.annotationCalloutLabel,
            x: x("Friday")+x.step()/2,
            y: height+y(days.get("Friday")),
            dx: -70,
            dy: 100,

    
        },
        {
            note: {
                label: "The weekend, especially Sunday, have lower crash rates than most weekdays. The exception to this is Monday, which has a similar crash rate to Saturday",
                title: "Weekend dip"
            },
            type: d3.annotationCalloutLabel,
            x: x("Sunday")+x.step()/2,
            y: height+y(days.get("Sunday")),
            dx: 50,
            dy: -65,

    
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
        .text("accident count")
        .attr("x", -150)
        .attr("y", height/2)
        
    svg.append("text")
        .text("day of the week")
        .attr("x", width/2)
        .attr("y", height+margin.bottom/2)

    svg.append("text")
    
        .text("bar chart of the number of crashes per weekday")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -margin.top/2)



});