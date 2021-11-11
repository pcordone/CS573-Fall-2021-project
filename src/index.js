import { select, csv, format } from "d3";
import { barChart } from "./barChart.js";
import { contextChart } from "./contextChart.js";
import { menu } from "./menu";

const width = 500;
const height = 500;
const contextWidth = 200;
const contextHeight = 100;

let accountNumber = "3333333333";
// TODO need to fix this hack
let dateRange = [2019, 2021];

//const svg = select('body');
//   .append('svg')
//   .attr('width', width)
//   .attr('height', height)
//   .append('svg')
//   .attr('width', width)
//   .attr('height', height)

const svg = select("#focus")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const menuContainer = select("#menu");

const options = [
  {
    value: "1111111111",
    text: "1111111111",
  },
  {
    value: "2222222222",
    text: "2222222222",
  },
  {
    value: "3333333333",
    text: "3333333333",
  },
];

const context = select("#context")
  .append("svg")
  .attr("width", contextWidth)
  .attr("height", contextHeight);

const csvUrl = [
  "https://gist.githubusercontent.com/",
  "pcordone/", // User
  "93039d5d909fbf42838c5167219d6ed4/", // Id of the Gist
  "raw/c60b15781b63168a096404fa4be4ac2a252ee0c1/", // commit
  "electricAccountsData.csv", // File name
].join("");

const parseRow = (d) => {
  d.readDate = new Date(d.readDate);
  d.readDays = +d.readDays;
  d.totalKwh = +d.totalKwh;
  d.utilityCharges = +d.utilityCharges;
  d.supplierCharges = +d.supplierCharges;
  d.totalCharges = +d.totalCharges;
  d.avgDailyUsage = +d.avgDailyUsage;
  d.readFromDate = new Date(d.readFromDate);
  d.readToDate = new Date(d.readToDate);
  d.relativeMonthBillDate = new Date(d.relativeMonthBillDate);
  d.relativeMonthBillYear = d.relativeMonthBillDate.getFullYear();
  d.relativeMonthBillQtr = Math.floor(
    (d.relativeMonthBillDate.getMonth() + 3) / 3
  );
  d.timestamp = new Date(d.timestamp);
  d.netMeterCredits = +d.netMeterCredits;
  return d;
};

const main = async () => {
  const dateFormatterMMMYY = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  });
  const dateFormatterMMM = new Intl.DateTimeFormat("en-US", {
    month: "short",
  });
  const dateFormatterQtr = (d) =>
    Math.floor((d.relativeMonthBillDate.getMonth() + 3) / 3);

  const legendTitleAccounts = "Accounts";
  const legendTitleYear = "Bill Year";

  let data = await csv(csvUrl, parseRow);

  const yValue = (d) => d.totalKwh;
  const yValueFormatter = format(",");

  menuContainer.call(
    menu()
      .id("account-menu")
      .labelText("Account:")
      .options(options)
      .on("change", (column) => {
        accountNumber = column;
        svg.call(plot.data(filterData(accountNumber, dateRange)));
      })
  );

  const filterData = (actNum, dteRng) => {
    accountNumber = actNum;
    dateRange = dteRng;
    return data.filter(
      (d) =>
        d.accountNumber === accountNumber &&
        d.relativeMonthBillYear >= dateRange[0] &&
        d.relativeMonthBillYear <= dateRange[1]
    );
  };

  const contextPlot = contextChart()
    .width(contextWidth)
    .height(contextHeight)
    .data(data)
    .stackValue((d) => d.relativeMonthBillYear)
    .xValue((d) => dateFormatterMMM.format(d.relativeMonthBillDate))
    .yValue((d) => yValue(d))
    .filterData((dateRange) => {
      svg.call(plot.data(filterData(accountNumber, dateRange)));
    });

  const plot = barChart()
    .width(width)
    .height(height)
    .data(filterData(accountNumber, dateRange))
    .xValue((d) => dateFormatterMMM.format(d.relativeMonthBillDate))
    .xLabel("Month")
    .yValue((d) => yValue(d))
    .yLabel("Electricy Usage kWH")
    .yValueFormatter(yValueFormatter)
    .hoverText((d, i, groupedData) => {
      const barTotal = groupedData
        .get(d.data.xEntry)
        .reduce((acc, d) => acc + yValue(d), 0);
      return `Usage: ${yValueFormatter(d[1] - d[0])} kWH
Total:    ${yValueFormatter(barTotal)} kWH`;
    })
    .stackValue((d) => d.relativeMonthBillYear)
    .margin({
      top: 50,
      right: 50,
      bottom: 50,
      left: 75,
    })
    .title("Personal Electric Consumption By Account")
    .legendTitle(legendTitleYear);
  svg.call(plot);
  context.call(contextPlot);
};
main();
