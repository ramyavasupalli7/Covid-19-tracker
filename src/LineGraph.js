import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import {CategoryScale} from 'chart.js'; 
import Chart from 'chart.js/auto';
Chart.register(CategoryScale);

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxis: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxis: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
    let chartData = [];
    let lastDataPoint;
  
    for (let date in data[casesType]) {
      if (data[casesType].hasOwnProperty(date)) {
        if (lastDataPoint) {
          let newDataPoint = {
            x: date,
            y: data[casesType][date] - lastDataPoint,
          };
          chartData.push(newDataPoint);
        }
        lastDataPoint = data[casesType][date];
      }
    }
  
    return chartData;
  };
  

function LineGraph({ casesType = "cases", ...props }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120");
        const responseData = await response.json();
        console.log("API Response Data:", responseData,casesType);
  
        if (responseData && responseData.cases) {
          let chartData = buildChartData(responseData, casesType);
          console.log("Chart Data:", chartData);
          setData(chartData.slice(0,10));
        } else {
          console.error("Invalid API response format.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [casesType]);
  

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default LineGraph;