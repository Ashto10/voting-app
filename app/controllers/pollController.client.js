'use strict';

(function () {
  
  function buildPieChart(data) {
    
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    
    var width = 300,
        height = 300,
        radius = Math.min(width,height) / 2;
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);
    var labelArc = d3.arc()
      .outerRadius(radius / 4)
      .innerRadius(radius - 40);
    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.count; });
    
    var options = d3.select('.optionsContainer')
      .selectAll('.optionColor')
        .data(data)
        .style('background-color', function(d,i) { return color(i) } );
    
    var svg = d3.select('.svg-container')
      .append('svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height)
        .classed("svg-content-responsive", true)
      .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    var g = svg.selectAll('.arc')
        .data(pie(data))
      .enter().append('g')
        .attr('class', 'arc');
    g.append("path")
        .attr("d", arc)
        .style("fill", function(d,i) { return color(i); })
        .style("stroke", function(d) { return 'black'; });
  }
  
  var apiUrl = appUrl + '/api' + window.location.pathname;
  ajaxFunctions.ready(function() {
    var pollData = JSON.parse($("#poll").attr('data-graph'));
    buildPieChart(pollData);
  });
})();