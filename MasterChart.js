// basic framework from class example, edited to work for my needs
// started with a copy of my bar chart, and edited
// Set up the SVG container
const yearlySvgWidth = 1000;
const yearlySvgHeight = 1000;
const yearlyMargin = { top: 50, right: 20, bottom: 70, left: 100 };
const yearlyWidth = yearlySvgWidth - yearlyMargin.left - yearlyMargin.right;
const yearlyheight = yearlySvgHeight - yearlyMargin.top - yearlyMargin.bottom;

const monthlySvgWidth = 1200;
const monthlySvgHeight = 1000;
const monthlyMargin = { top: 50, right: 150, bottom: 70, left: 150 };
const monthlyWidth = monthlySvgWidth - monthlyMargin.left - monthlyMargin.right;
const monthlyHeight = monthlySvgHeight - monthlyMargin.top - monthlyMargin.bottom;


const weeklySvgWidth = 1200;
const weeklySvgHeight = 1000;
const weeklyMargin = { top: 50, right: 150, bottom: 70, left: 150 };
const weeklyWidth = weeklySvgWidth - weeklyMargin.left - weeklyMargin.right;
const weeklyHeight = weeklySvgHeight - weeklyMargin.top - weeklyMargin.bottom;

const hourlySvgWidth = 1000;
const hourlySvgHeight = 600;
const hourlyMargin = { top: 50, right: 220, bottom: 350, left: 150 };
const hourlyWidth = hourlySvgWidth - hourlyMargin.left - hourlyMargin.right;
const hourlyHeight = hourlySvgHeight - hourlyMargin.top - hourlyMargin.bottom;

const hourlyCovidSvgWidth = 1200;
const hourlyCovidSvgHeight = 1000;
const hourlyCovidMargin = { top: 50, right: 150, bottom: 70, left: 150 };
const hourlyCovidWidth = hourlyCovidSvgWidth - hourlyCovidMargin.left - hourlyCovidMargin.right;
const hourlyCovidHeight = hourlyCovidSvgHeight - hourlyCovidMargin.top - hourlyCovidMargin.bottom;

let yearChoices = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
let monthOptions = ["January", "February","March","April","May", "June","July","August","September","October","November","December"]
let DayOptions = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
let hourOptions = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10","11","12","13","14","15","16","17","18","19","20","21","22","23"]
let neighborhoodChoices = ["Bayview Hunters Point", "Financial District/South Beach", "Mission", "South of Market", "Tenderloin"]

let years
let months
let monthsCovid
let weeks
let weeksGrouped
let weeksCovid
let hours
let hoursCovid

const yearlySvg = d3.select("#yearly")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);



const monthlySvg = d3.select("#monthly")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);


const monthlyCovidSvg = d3.select("#monthlyCovid")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);


const weeklySvg = d3.select("#weekly")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);


const weeklyGroupedSvg = d3.select("#weeklyGrouped")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);



const weeklyCovidSvg = d3.select("#weeklyCovid")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);


const hourlySvg = d3.select("#hourly")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);


const hourlyCovidSvg = d3.select("#hourlyCovid")
    .append("svg")
    // using viewbox instead of width and height since viewbox makes responsive (see https://stackoverflow.com/a/63156174
    .attr("viewBox", `0 0 ${yearlySvgWidth} ${yearlySvgHeight}`)
    .append("g")
    .attr("transform", ` translate(${yearlyMargin.left},${yearlyMargin.top}) `);