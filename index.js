//define svg area

const width = 1000,
  height = 700;

const svgContainer = d3
  .select(".visHolder")
  .append("svg")
  .attr("id", "svg")
  .attr("width", width)
  .attr("height", height);

//define tooltip

const tooltip = svgContainer
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

//define legend

const legend = svgContainer.append("g").attr("id", "legend");

//import data

const COUNTIES_FILE =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const EDUCATION_FILE =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

d3.queue()
  .defer(d3.json, COUNTIES_FILE)
  .defer(d3.json, EDUCATION_FILE)
  .await((error, usFile, educationFile) => {
    if (error) throw error;

    //visualize counties

    path = d3.geoPath();

    svgContainer
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(usFile, usFile.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        let education = educationFile.filter((x) => {
          return x.fips === d.id;
        });
        if (education[0]) {
          return education[0].bachelorsOrHigher;
        } else {
          console.log("error at: " + d.id);
          return 0;
        }
      })
      .attr("fill", "white")
      .attr("d", path);
  });
