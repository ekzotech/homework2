import "babel-polyfill";
import Chart from "chart.js";

const meteoURL = "/xml.meteoservice.ru/export/gismeteo/point/140.xml";

async function loadWeather() {
  const response = await fetch(meteoURL);
  const xmlTest = await response.text();
  const parser = new DOMParser();
  const weatherData = parser.parseFromString(xmlTest, "text/xml");
  return weatherData;
}

async function getWeatherDays(weatherData) {
  const forecast = weatherData.querySelectorAll("FORECAST");

  const days = [];
  forecast.forEach(el => {
    const day = `${el.getAttribute("hour")}:00, ${el.getAttribute(
      "day"
    )}.${el.getAttribute("month")}.${el.getAttribute("year")}`;
    days.push(day);
  });
  return days;
}

async function getDaysTemperature(weatherData) {
  const temp = weatherData.querySelectorAll("TEMPERATURE");
  const minTemp = [];
  const maxTemp = [];

  temp.forEach(t => {
    minTemp.push(t.getAttribute("min"));
    maxTemp.push(t.getAttribute("max"));
  });

  const graphs = [
    {
      label: "Минимальная температура (шкала слева)",
      backgroundColor: "rgb(20, 20, 255)",
      borderColor: "rgb(0, 0, 180)",
      data: minTemp,
      fill: false,
      yAxisID: "min"
    },
    {
      label: "Максимальная температура (шкала справа)",
      backgroundColor: "rgb(255, 20, 20)",
      borderColor: "rgb(180, 0, 0)",
      data: maxTemp,
      fill: false,
      yAxisID: "max"
    }
  ];

  return graphs;
}

const buttonBuild = document.getElementById("btn");
const canvasCtx = document.getElementById("out").getContext("2d");
buttonBuild.addEventListener("click", async function() {
  const weatherData = await loadWeather();
  const weatherDays = await getWeatherDays(weatherData);
  const daysTemperature = await getDaysTemperature(weatherData);

  const chartConfig = {
    type: "line",

    data: {
      labels: weatherDays,
      datasets: daysTemperature
    },
    options: {
      hoverMode: "index",
      stacked: false,
      title: {
        display: true,
        text: "График температуры"
      },
      scales: {
        yAxes: [
          {
            type: "linear",
            display: true,
            position: "left",
            id: "min"
          },
          {
            type: "linear",
            display: true,
            position: "right",
            id: "max",
            gridLines: {
              drawOnChartArea: false
            }
          }
        ]
      }
    }
  };

  if (window.chart) {
    chart.data.labels = chartConfig.data.labels;
    chart.data.datasets[0].data = chartConfig.data.datasets[0].data;
    chart.update({
      duration: 800,
      easing: "easeOutBounce"
    });
  } else {
    window.chart = new Chart(canvasCtx, chartConfig);
  }
});
