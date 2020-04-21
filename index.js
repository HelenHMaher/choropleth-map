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

    //define legend
    const edArray = educationFile.map((d) => d.bachelorsOrHigher);
    const step = (d3.max(edArray) - d3.min(edArray)) / 8;
    const thresholdArray = [];
    const stepThreshold = () => {
      for (let i = 1; i < 8; i++) {
        thresholdArray.push(d3.min(edArray) + i * step);
      }
    };
    stepThreshold();

    const colorScale = d3
      .scaleThreshold()
      .domain(thresholdArray)
      .range([1, 2, 3, 4, 5, 6, 7, 8]);

    const legend = svgContainer.append("g").attr("id", "legend");

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
      .attr("fill", (d) => {
        let education = educationFile.filter((x) => {
          return x.fips === d.id;
        });
        if (education[0]) {
          return "#" + colorScale(education[0].bachelorsOrHigher) + "00000";
        } else {
          return "#" + colorScale(0) + "00000";
        }
      })
      .attr("d", path);
  });
