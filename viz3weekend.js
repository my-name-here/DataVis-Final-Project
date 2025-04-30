// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container

const weeklyGropuedSvgWidth = 1200;
const weeklyGropuedSvgHeight = 1000;
const weeklyGropuedMargin = { top: 50, right: 150, bottom: 70, left: 150 };
const weeklyGropuedWidth = weeklyGropuedSvgWidth - weeklyGropuedMargin.left - weeklyGropuedMargin.right;
const weeklyGropuedHeight = weeklyGropuedSvgHeight - weeklyGropuedMargin.top - weeklyGropuedMargin.bottom;


const weeklyGropuedSvg = d3.select("#chart-container-weeklyGrouped")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${weeklyGropuedSvgWidth} ${weeklyGropuedSvgHeight}`)
    
    
    .append("g")
    .attr("transform", `translate(${weeklyGropuedMargin.left},${weeklyGropuedMargin.top}) `);

// a function that takes a day of the week, and returns it
function dayOfWeekCat(i){
    if (i=="Saturday" || i=="Sunday"){
        return "weekend"
    }
    else{
        return "weekday"
    }
}

   

// since months are not numbers like years, but strings, we need a function to get the next month from the current one, and it should end in december
// this replaces the max(d[0]+1, maxMonth) in the x2 and y2 of the lines
function getNextCat(CurCat){
    // first create a list of months, which we will locate the provided month in, then get the next one
    var daysList = ["weekday", "weekend"]
    //get index of current month
    dayIndex = daysList.indexOf(CurCat)
    // new index is either the cur index + 1, or if that is greater than list length, the length of the list
    newDayIndex = Math.min(dayIndex+1, daysList.length -1 )
    return daysList[newDayIndex]
}

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
    var days = d3.rollup(data, (D) => d3.count(D, d=>d.year), d => dayOfWeekCat(d.weekday));
    days.set("weekday", days.get("weekday")/5) // avg crash per weekday
    days.set("weekend", days.get("weekend")/2) //avg crash per weekend
    // for easier access in the y scale
    // removing last element based on https://stackoverflow.com/questions/19544452/remove-last-item-from-array#comment84683867_19544452

    var daysTmp = d3.rollups(data, (D) => d3.count(D, d=>d.year), d => dayOfWeekCat(d.weekday));
    daysTmp[0][1] = daysTmp[0][1]/5 //avg crashes per weekday
    daysTmp[1][1] = daysTmp[1][1]/2 //avg crashes per weekend

    console.log(days)
    console.log(daysTmp)

    console.log(d3.min(daysTmp, d=>d[1]))
    console.log(d3.max(daysTmp,  d=>d[1]))
    // Define X and Y scales
    const y = d3.scaleLinear()
        .domain([0, d3.max(daysTmp,  d=>d[1])+2])
        .nice()
        .range([ 0, -weeklyGropuedHeight])
        //.padding(0.1);

    // use scaleBand instead of scale time, see https://stackoverflow.com/a/38820431
    const x = d3.scaleBand()
        .domain(["weekday", "weekend"])
        .range([ 0, weeklyGropuedWidth]);
    


    // Add X and Y axes
    weeklyGropuedSvg.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0, ${weeklyGropuedHeight})`)
        // see https://stackoverflow.com/a/45407965 for fixing january showing as 1900 instead of as january
        .call(d3.axisBottom(x).ticks(10)
    );

    weeklyGropuedSvg.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", `translate(0, ${weeklyGropuedHeight})`)
        .call(d3.axisLeft(y).ticks(20));

    // Add bars
    // adding multiple elements on same level with groups based on https://stackoverflow.com/questions/65434376/append-two-elements-in-svg-at-the-same-level
    let maxDay = d3.max(data, d => d.weekday)
    console.log(maxDay)

    // see https://d3js.org/d3-array/group and https://d3js.org/d3-array/transform
    // remove last element again
    daysList = ["weekday","weekend"];
    console.log(daysList)

    // see https://d3js.org/d3-array/transform for cross
    barWidth = x("weekend")-x("weekday")


    console.log(barWidth)



    // new div for our tooltip, based on https://mappingwithd3.com/tutorials/basics/tooltip/
    d3.select("body")
        .append("div")
        .attr('id', 'tooltip')
        .attr("class", "tooltip")



    bars =  weeklyGropuedSvg.selectAll(".bar")
        .data(daysList)
        .enter()
        .append("g")



    
    bars.append("rect")
        .attr("test", d=>y(days.get(d)))

        .attr("x", d=>x(d))
        .attr("y", d=>weeklyGropuedHeight+y(days.get(d)))
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
                
                .html(`weekend or weekday: ${d}<br>Avg crashes per day:
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

    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        
        .annotations(annotations)
    d3.select("svg")
        .append("g")
        .attr("transform", ` translate(${weeklyGropuedMargin.left},${weeklyGropuedMargin.top}) `)
        .call(makeAnnotations);
  


    weeklyGropuedSvg.append("text")
        .text("accident count")
        .attr("x", -150)
        .attr("y", weeklyGropuedHeight/2)
        
    weeklyGropuedSvg.append("text")
        .text("weekend or weekday")
        .attr("x", weeklyGropuedWidth/2)
        .attr("y", weeklyGropuedHeight+weeklyGropuedMargin.bottom/2)

    weeklyGropuedSvg.append("text")
    
        .text("bar chart of the number of crashes on weekends vs weekdays")
        .attr("class", "title")
        .attr("x", 0)
        .attr("y", -weeklyGropuedMargin.top/2)



});