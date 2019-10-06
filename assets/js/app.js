var svgWidth = 800;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(riskData, chosenXAxis) {
  // create x scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(riskData, d => d[chosenXAxis]) * 0.8,
      d3.max(riskData, d => d[chosenXAxis]) * 1.1])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(riskData, chosenYAxis) {
  // create y scales
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(riskData, d => d[chosenYAxis]) * 1.1])
    .range([height, 0]);

return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group and its labels (labelGroup)
// with a transition to new circles after an X axis change
function renderXCircles(circlesGroup, labelCircleGp, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXaxis]));

  labelCircleGp.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXaxis]));

  return circlesGroup;
}

// function used for updating circles group and its labels (labelGroup)
// with a transition to new circles after an Y axis change
function renderYCircles(circlesGroup, labelCircleGp, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYaxis]));

  labelCircleGp.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYaxis])+3);

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

  switch(chosenXAxis) {
    case "poverty":
      var xlabel = "Poverty:";
      break;
    case "age":
      var xlabel = "Age:";
      break;
    case "income":
      var xlabel = "H.Income:";
      break;  
  } 
  switch(chosenYAxis) {
    case "healthcare":
      var ylabel = "NoHCare:";
      break;
    case "smokes":
      var ylabel = "Smokes:";
      break;
    case "obesity":
      var ylabel = "Obesity:";
      break;
  } 

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(riskData, err) {
  if (err) throw err;

  // parse data
  riskData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale and yLinearScale functions
  var xLinearScale = xScale(riskData, chosenXAxis);
  var yLinearScale = yScale(riskData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  var plotGroup = chartGroup.append("g")
    .classed("plot_class", true);

  var circlesGroup = plotGroup.selectAll("circle")
    .data(riskData)   
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("opacity", ".7");

  var labelCircleGp = plotGroup.selectAll("text")
    .data(riskData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.healthcare)+3)
    .text(d => d.abbr);

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 43)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 66)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)"); 


  // Create group for  3 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthLabel = ylabelsGroup.append("text")    
    .attr("y", 0 - (margin.left - 40))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")    
    .attr("y", 0 - (margin.left - 20))
    .attr("x", 0 - (height / 1.89))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");
  
  var obesityLabel = ylabelsGroup.append("text")    
    .attr("y", 0 - (margin.left))
    .attr("x", 0 - (height / 1.89))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity (%)");

  // handlers for the article sections
  var povertyArticleSct = d3.select(".poverty_art").classed("poverty_art_act", true);
  var ageArticleSct = d3.select(".age_art").classed("age_art_ict", true);
  var incomeArticleSct = d3.select(".income_art").classed("income_art_ict", true);
  
  magu = ageArticleSct.select("h4").text();
  console.log(magu);

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

  // x axis labels event listener
  xlabelsGroup.selectAll("text").on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(riskData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = renderXCircles(circlesGroup, labelCircleGp, xLinearScale, chosenXAxis);

      // updates tooltips with new info ***
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      switch(chosenXAxis) {
        case "poverty":
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyArticleSct
            .classed("poverty_art_act", true)
            .classed("poverty_art_ict", false);
          ageArticleSct
            .classed("age_art_act", false)
            .classed("age_art_ict", true);
          incomeArticleSct
            .classed("income_art_act", false)
            .classed("income_art_ict", true);
          break;
        case "age":
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyArticleSct
            .classed("poverty_art_act", false)
            .classed("poverty_art_ict", true);
          ageArticleSct
            .classed("age_art_act", true)
            .classed("age_art_ict", false);
          incomeArticleSct
            .classed("income_art_act", false)
            .classed("income_art_ict", true);
          break;
        case "income":
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyArticleSct
            .classed("poverty_art_act", false)
            .classed("poverty_art_ict", true);
          ageArticleSct
            .classed("age_art_act", false)
            .classed("age_art_ict", true);
          incomeArticleSct
            .classed("income_art_act", true)
            .classed("income_art_ict", false);
          break;
      }
    }
  });

  // y axis labels event listener
  ylabelsGroup.selectAll("text").on("click", function() {
    // get value of selection
    
    var value = d3.select(this).attr("value");

    if (value !== chosenYAxis) {
      // replaces chosenYAxis with value
      chosenYAxis = value;

      
      // functions here found above csv import
      // updates y scale for new data
      yLinearScale = yScale(riskData, chosenYAxis);

      // updates y axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles with new y values
      circlesGroup = renderYCircles(circlesGroup, labelCircleGp, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

      // changes classes to change bold text
      switch(chosenYAxis) {
        case "healthcare":
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        break;
        case "smokes":
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          break;
        case "obesity":
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          break;
      }
    }
  });

}).catch(function(error) {
  console.log(error);
});

