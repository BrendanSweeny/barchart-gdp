const margin = {top: 60, right: 50, bottom: 60, left: 80},
      width = 960 - margin.left - margin.right, //810
      height = 500 - margin.top - margin.bottom; //400

//blue: rgb(66, 244, 170), green: rgb(66, 244, 66)
const blue = 170;
const green = 66;

let barColor = d3.scaleLinear()
                 .range([blue, green]);

let x = d3.scaleBand()
          .rangeRound([0, width])
          .padding(0.5);

let y = d3.scaleLinear()
          .range([height, 0]);

// Time format used for x-Axis
let formatTime = d3.timeFormat("%Y");
let tipFormatTime = d3.timeFormat("%b %Y");

let xAxis = d3.axisBottom()
              .scale(x)
              .tickFormat((d) => { return formatTime(d); });

let yAxis = d3.axisLeft()
              .scale(y);

// Defines the inner chart area based on the defined margins
let chart = d3.select(".chart")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let toolTip = d3.select("body").append("div").attr("id", "toolTip");

// Creates Date object based on raw data format
let parseTime = d3.timeParse("%Y-%m-%d");

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json", (error, json) => {
  if (error) throw error;

  // Extracts source URL and displays it on page
  let sourceUrl = json.description.match(/(http(\W+|\w+)+\b)/g)
  d3.select("#source")
    .attr("href", sourceUrl[0])
    .text(sourceUrl[0]);

  // Parses the time entry into a JS Date object
  json.data.forEach((entry) => {
    entry[0] = parseTime(entry[0]);
    entry[1] = entry[1] / 1000;
  })

  // Defines the domain of the x-axis as the range of string values in the json
  x.domain(json.data.map((d) => { return d[0]; }));
  // Defines the domain of the y-axis as the range of values for GDP
  y.domain([0, d3.max(json.data, (d) => { return d[1]; })]);
  // Defines the domain of the amount of blue in each bar as the range of values for GDP
  barColor.domain([0, d3.max(json.data, (d) => {return d[1]; })]);

  // x-Axis
  chart.append("g")
       .attr("class", "x-axis axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis.tickValues(x.domain().filter((d) => { return d.getMonth() === 0 && !(d.getYear() % 5); })))
       .append("text")
       .attr("class", "label")
       .attr("y", margin.bottom)
       .attr("x", width / 2)
       .attr("fill", "#000")
       .style("text-anchor", "middle")
       .text("Year");

  // y-Axis
  chart.append("g")
       .attr("class", "y-axis axis")
       .call(yAxis)
       .append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - (margin.left / 1.5))
       .attr("x", 0 - (height / 2))
       .attr("dy", "1em")
       .attr("fill", "#000")
       .style("text-anchor", "middle")
       .text("US Dollars (Trillions)");

  // Chart Title
  chart.append("g").append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("fill", "#000")
      .style("text-anchor", "middle")
      .text("Growth of the United States Nominal Gross Domestic Product");

  // Data mapped to chart SVG
  chart.selectAll(".bar")
       .data(json.data)
       .enter().append("rect")
       .attr("class", "bar")
       .attr("x", (d) => { return x(d[0]); })
       .attr("y", (d) => { return y(d[1]); })
       .attr("height", (d) => { return height - y(d[1]); })
       .attr("width", x.bandwidth())
       .property("data-date", (d) => { return d[0]; })
       .property("data-gdp", (d) => { return d[1]; })
       .style("fill", (d) => { return "rgb(66, 244, " + Math.floor(barColor(d[1])) + ")";})
       .on("mouseover", function(d) {
         toolTip
          .style("left", d3.event.pageX - 66 + "px")
          .style("top", d3.event.pageY - 80 + "px")
          .style("display", "block")
          .html(tipFormatTime(d[0]) + "<br>" + "$" + (d[1]).toPrecision(4) + " Trillion");
       })
       .on("mouseout", () => {
         toolTip.style("display", "none");
       });

   // Chart Border
   chart.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", width)
      .style("stroke", "black")
      .style("stroke-width", "0.2em")
      .style("fill", "none")
      .style("shape-rendering", "crispEdges");
})
