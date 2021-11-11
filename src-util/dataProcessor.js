// This script converts the text data file into a valid CSV file.
//
// By Curran Kelleher 2/24/2014

var fs = require("fs"),
  inputFile = "./MFRED_Aggregates_15min_2019Q1-Q4.csv",
  outputFile = "./processed_MFRED_Aggregates_hourly_2019Q1-Q4.csv";
//firstRow = '"Country","Christian","Muslim","Unaffiliated","Hindu","Buddhist","Folk Religions","Other Religions","Jewish"';

fs.readFile(inputFile, "utf8", function (err, data) {
  var lines = data.split("\r\n"),
    rows = lines.map(function (line, index) {
      if (index === 0) {
        return line;
      }

      // Each line is comma-delimited, so split by tabs.
      return line
        .split(",")
        .map(function (entry, i) {
          // Remove the commas delimiting thousands from all the
          // numeric fields (field i == 0 is the country).
          //   if(i !== 0) {
          //     entry = entry.replace(/,/g,'');
          //   }

          // Put quotes around each entry to make it valid CSV.
          return '"' + entry + '"';

          // Join entries for a row into a single line
          // by adding commas between each entry.
        })
        .join(",");
    }),
    //csv = firstRow + '\n' + rows.join('\n');
    csv = rows.join("\n");

  fs.writeFile(outputFile, csv, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Wrote '" + outputFile + "'!");
    }
  });
});
