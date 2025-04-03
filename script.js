async function drawChart() {

us =  await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json');

//console.log(us);

data = topojson.feature(us, us.objects.states).features;

const svg = d3.select("#map"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  // Map and projection
  const projection = d3.geoAlbers().scale(1300).translate([487.5, 305])

// const svg = DOM.svg(960, 600);
  
 
  // Use the path to plot the US map based on the geometry data.
  svg
    .append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr("d", d3.geoPath().projection(projection))
    .style("stroke", "black")
    .style("fill", "white")
    .style("opacity", 0.5);


  

// took these 2 functions from an llm
    function isPointInUS(lat, lng) {
        // Simplified US boundary (excluding territories)
        // For higher accuracy, use a detailed GeoJSON or shapefile
        const usBounds = {
          minLat: 24.0, // Approximate southern boundary
          maxLat: 49.0, // Approximate northern boundary
          minLng: -125.0, // Approximate western boundary
          maxLng: -67.0,  // Approximate eastern boundary
        };
      
        return (
          lat >= usBounds.minLat &&
          lat <= usBounds.maxLat &&
          lng >= usBounds.minLng &&
          lng <= usBounds.maxLng
        );
      }

      function isPointInAlaska(latitude, longitude) {
        // Alaska's bounding box (approximate)
        const minLat = 51.0;  // Southernmost point
        const maxLat = 71.0;  // Northernmost point
        const minLon = -179.0; // Westernmost point
        const maxLon = -129.0; // Easternmost point
      
        return (
          latitude >= minLat &&
          latitude <= maxLat &&
          longitude >= minLon &&
          longitude <= maxLon
        );
      }


    const today = new Date();
    var date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const tomorrow  = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var tom = `${tomorrow.getFullYear()}-${tomorrow.getMonth() + 1}-${tomorrow.getDate()}`

      // now plot each earthquake 
    d3.json("https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime="+date+"&endtime="+tom+"&minlatitude=20&maxlongitude=-60").then(function (earthquakes){

        const e_data = earthquakes.features.map((d) => ({
            long:  d.geometry.coordinates[0],
            lat: d.geometry.coordinates[1],
            mag: d.properties.mag, 
            place: d.properties.place
        }));
    
        const filtered = e_data.filter((d) => isPointInUS(d.lat, d.long));
        var max;
        for (var i=0 ; i<filtered.length ; i++) {
            if (max == null || parseInt(filtered[i].mag) > parseInt(max.mag))
                max = filtered[i];
        }
        console.log(max)

        const radiusScale = d3.scaleLinear()
                                .domain([0, 10])
                                .range([0, 50]);


        try {

        var div = d3.select("body").append("div")
            .attr("class", "tooltip-donut")
            .style("opacity", 0);

        
        var circles = svg.selectAll("myCircles")
            .data(filtered)
            .enter()
            .append("circle")
            .attr("cx", (d) => projection([+d.long, +d.lat])[0])
            .attr("cy", (d) => projection([+d.long, +d.lat])[1])
            .attr("r", (d) => {return radiusScale(Math.abs(d.mag))})
            .attr("class", "circle")
            .style("fill", "#EE4B2B")
            .attr("stroke", "#EE4B2B")
            .attr("stroke-width", 1)
            .attr("fill-opacity", 0.4);

        circles.transition()
            .duration(1000)
            .attr("r", 1)
            .transition()
            .duration(1000)
            .attr("r", (d) => radiusScale(Math.abs(d.mag)))
            .transition()
            .duration(1000)
            .attr("r", 1)
            .transition()
            .duration(1000)
            .attr("r", (d) => radiusScale(Math.abs(d.mag)));
            
        circles.on("mouseover", function(event, d) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.7');

                div.transition()
                    .duration(50)
                    .style("opacity", 1);

                div.html(filtered[d].mag)
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1');

                div.transition()
                    .duration('50')
                    .style("opacity", 0);
            });;
        }
        catch (error) {
            console.error("An error occurred:", error.message);
        }
            
        // add max value
        const max2 = d3.select("#max"),
                mwidth = +svg.attr("width"),
                mheight = +svg.attr("height");

        max2.append("text")
            .attr("x", 50) // Adjust as needed
            .attr("y", 50) // Adjust as needed
            .attr("class", "right-text")
            .text("Largest:");

        max2.append("text")
            .attr("x", 50)
            .attr("y", 70)
            .attr("class", "right-text")
            .text(max.mag + "");

        max2.append("text")
            .attr("x", 50)
            .attr("y", 90)
            .attr("class", "right-text")
            .text(max.place);

        max2.append("text")
            .attr("x", 50)
            .attr("y", 110)
            .attr("class", "right-text")
            .text("Coordinates: " + max.lat + " , "+ max.long);

    });

}


drawChart();