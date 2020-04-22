//states abbrev. to state names

const states = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District Of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

const colors = [
  "#EFDFDF",
  "#CF9F9F",
  "#B06060",
  "#902020",
  "#700000",
  "#500000",
  "#300000",
  "#100000",
];

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

const tooltip = d3
  .select(".visHolder")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

//import data including json to converst state abbreviation to name

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

    const colorScale = d3.scaleThreshold().domain(thresholdArray).range(colors);

    const legendXScale = d3
      .scaleLinear()
      .domain([d3.min(edArray), d3.max(edArray)])
      .range([0, 320]);

    const legendAxis = d3
      .axisBottom(legendXScale)
      .tickValues(thresholdArray)
      .tickFormat(d3.format(".1f"));

    const legend = svgContainer.append("g").attr("id", "legend");

    legend
      .append("g")
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 40)
      .attr("y", 0)
      .attr("width", 40)
      .attr("height", 30)
      .attr("fill", (d) => d)
      .style("stroke", "white")
      .style("stroke-width", 0.5);

    legend.append("g").attr("id", "legendAxis").call(legendAxis);

    //constants used to visualize counties with colors and tooltip

    const geoGenerator = d3.geoPath();
    const getCountyName = (d) => {
      let countyName = educationFile.filter((x) => {
        return x.fips === d.id;
      });
      if (countyName[0]) {
        return countyName[0].area_name;
      } else {
        console.log("error at: " + d.id);
        return "--";
      }
    };
    const getStateName = (d) => {
      let stateName = educationFile.filter((x) => {
        return x.fips === d.id;
      });
      if (stateName[0]) {
        return states[stateName[0].state];
      } else {
        console.log("error at: " + d.id);
        return "--";
      }
    };
    const getEducationData = (d) => {
      let education = educationFile.filter((x) => {
        return x.fips === d.id;
      });
      if (education[0]) {
        return education[0].bachelorsOrHigher;
      } else {
        console.log("error at: " + d.id);
        return 0;
      }
    };
    const textContent = (d) => {
      return (
        getCountyName(d) +
        ", " +
        getStateName(d) +
        "<br>" +
        getEducationData(d) +
        "%"
      );
    };
    //visualize counties

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
        return getEducationData(d);
      })
      .attr("fill", (d) => {
        return colorScale(getEducationData(d));
      })
      .attr("d", geoGenerator)
      .on("mouseover", (d) => {
        tooltip
          .style("opacity", 0.8)
          .style("top", d3.event.pageY - 150 + "px")
          .style("left", d3.event.pageX - 50 + "px")
          .attr("data-education", getEducationData(d))
          .html(textContent(d));
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    //visualize states

    svgContainer
      .append("path")
      .datum(topojson.mesh(usFile, usFile.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("class", "state")
      .attr("d", geoGenerator);
  });
