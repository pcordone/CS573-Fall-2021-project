(function (d3$1) {
  'use strict';

  var BrowserText = (function () {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');

    /**
     * Measures the rendered width of arbitrary text given the font size and font face
     **/
    function getWidth(text, selector) {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      context.font = style.fontSize + ' ' + style.fontFamily;
      return context.measureText(text).width;
    }

    /**
     * Measures the rendered width of arbitrary text given the font size and font face
     **/
    function getHeight(selector) {
      console.log(selector);
      const element = document.querySelector(selector);
  console.log(document);
  console.log(element);
      const style = getComputedStyle(element);
      return Number(style.fontSize.replace(/px$/, ''));
    }

    return {
      getWidth: getWidth,
      getHeight: getHeight,
    };
  })();

  const barChart = () => {
    let width;
    let height;
    let data;
    let xValue;
    let xLabel;
    let yValue;
    let yLabel;
    let stackValue;
    let margin;
    let yValueFormatter;
    let hoverText;
    let title;
    let legendTitle;

    const my = (selection) => {
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const innerRadius = 100;
      // the outerRadius goes from the middle of the SVG area to the border
      const outerRadius =
        Math.min(innerWidth, innerHeight) / 2;

      const dataGroupedByXValue = d3.group(data, (d) =>
        xValue(d)
      );

      //     const dataGroupedByStackValue = d3.group(data, (d) => stackValue(d));
      // console.log(dataGroupedByStackValue);

      const domain = Array.from(dataGroupedByXValue.keys());

      const stackSet = [
        ...new Set(data.map((d) => stackValue(d))),
      ];

      let maxGroupTotal = 0;
      let rowTotal;
      const transformedData = [];

      // loop on the map that has the key of x value and entries of data rows with that value
      for (const [xEntry, value] of dataGroupedByXValue) {
        const row = { xEntry };
        rowTotal = 0;
        const foundSet = new Set();
        for (const d of value) {
          row[stackValue(d)] = yValue(d);
          foundSet.add(stackValue(d));
          rowTotal += row[stackValue(d)];
        }
        const missingStackEntries = new Set(
          [...stackSet].filter((x) => !foundSet.has(x))
        );
        // if we are missing an entry for hte stack set, then add one with value 0
        for (let item of missingStackEntries) {
          row[item] = 0;
        }
        maxGroupTotal = Math.max(maxGroupTotal, rowTotal);
        transformedData.push(row);
      }

      const stackedData = d3.stack().keys(stackSet)(
        transformedData
      );

      const xScale = d3$1.scaleBand()
        .domain(domain)
        .range([0, 2 * Math.PI])
        .align(0)
        .padding(0.1);

      const yScale = d3$1.scaleRadial()
        .domain([0, maxGroupTotal])
        .range([innerRadius, outerRadius]);

      const color = d3$1.scaleOrdinal()
        .domain(stackSet)
        .range(d3.schemeCategory10);

      const t = d3$1.transition().duration(1000);

      const wedge = d3$1.arc()
        .innerRadius((d) => yScale(d[0]))
        .outerRadius((d) => yScale(d[1]))
        .startAngle((d) => xScale(d.data.xEntry))
        .endAngle(
          (d) => xScale(d.data.xEntry) + xScale.bandwidth()
        )
        .padAngle(0.05)
        .padRadius(innerRadius);

      const barchart = selection
        .selectAll('#barchart-area')
        .data([null])
        .join('g')
        .attr('id', 'barchart-area')
        .attr(
          'transform',
          `translate(${width / 2},${height / 2})`
        );

      //const fontHeight = BrowserText.getHeight('text');
      const fontHeight = 10;

      const stacksG = barchart
        .selectAll('#stacks-group')
        .data([null])
        .join('g')
        .attr('id', 'stacks-group');

      const legendG = barchart
        .selectAll('#legend-group')
        .data([null])
        .join('g')
        .attr('id', 'legend-group');
      

      legendG
      	.selectAll('.legend-title')
      	.data([null])
        .join('text')
        .attr('text-anchor', 'right')
        .attr('x', 0)
        .attr('y', -fontHeight)
        .style('text-decoration', 'underline')
        .text(legendTitle);

      legendG
        .selectAll('legenddots')
        .data(stackSet)
        .join('rect')
        .attr('x', 0)
        .attr('y', function (d, i) {
          return 0 + i * (fontHeight + fontHeight / 2);
        })
        .attr('width', fontHeight)
        .attr('height', fontHeight)
        .style('fill', function (d) {
          return color(d);
        });

      legendG
        .selectAll('legendlabels')
        .data(stackSet)
        .join('text')
        .attr('class', '.legendtext')
        //.attr('x', innerWidth - textWidth - 10)
        .attr('x', 15)
        .attr('y', function (d, i) {
          return (
            i * (fontHeight + fontHeight / 2) + fontHeight
          );
        })
        .style('fill', function (d) {
          return color(d);
        })
        .text(function (d) {
          return d;
        })
        .attr('text-anchor', 'left')
        .style('alignment-baseline', 'middle');

      const xAxisLabels = (g) =>
        g
          .attr('transform', (d) =>
            (xScale(d) +
              xScale.bandwidth() / 2 +
              Math.PI / 2) %
              (2 * Math.PI) <
            Math.PI
              ? 'rotate(90)translate(0,16)'
              : 'rotate(-90)translate(0,-9)'
          )
          .text((d) => d);

      const xAxisRotate = (g) => {
        g.attr(
          'transform',
          (d) => `
            rotate(${
              ((xScale(d) + xScale.bandwidth() / 2) * 180) /
                Math.PI -
              90
            })
            translate(${innerRadius},0)
          `
        );
      };

      const xAxisG = barchart
        .selectAll('#x-axis')
        .data([null])
        .join('g')
        .attr('id', 'x-axis')
        .selectAll('.x-axis-entry')
        .data(xScale.domain(), (d) => JSON.stringify(d))
        .join('g')
        .attr('text-anchor', 'middle')
        .attr('class', 'x-axis-entry')
        .call(xAxisRotate);

      xAxisG
        .selectAll('.x-axis-label')
        .data((d) => [d])
        .join('text')
        .attr('class', 'x-axis-label')
        .call(xAxisLabels);

      xAxisG
        .selectAll('.x-axis-lines')
        .data((d) => [d])
        .join('line')
        .attr('class', 'x-axis-lines')
        .attr('x2', -5)
        .attr('stroke', '#000');

      // Enter in the stack data = loop key per key = group per group
      const stackOuter = stacksG
        .selectAll('.stack-outer')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData, (d) => JSON.stringify(d))
        .join('g')
        .attr('fill', (d) => color(d.key))
        .attr('class', 'stack-outer')
        .selectAll('stack-inner');

      // enter a second time = loop subgroup per subgroup to add all rectangles
      stackOuter
        .data((d) => d)
        .join(
          (enter) =>
            enter
              .append('path')
              .attr('class', 'stack-inner')
              .attr('d', wedge)
              .on('mouseover', function (d) {
                //d3.select(this).attr('opacity', 0.75);
                d3.select(this).attr('stroke', '#000');
                d3.select(this).attr('stroke-width', '2');
              })
              .on('mouseout', function (d) {
                d3.select(this).transition().duration(250);
                d3.select(this).attr('stroke', 'none');
              })
              .append('title')
              .text((d, i) =>
                hoverText(d, i, dataGroupedByXValue)
              ),
          (update) =>
            update
              .attr('d', wedge)
              .append('title')
              .text((d, i) =>
                hoverText(d, i, dataGroupedByXValue)
              ),
          (exit) => exit.remove()
        );

      const yAxisG = barchart
        .selectAll('#y-axis')
        .data([null])
        .join('g')
        .attr('id', 'y-axis');

      yAxisG
        .selectAll('#y-axis-title')
        .data([-yScale(yScale.ticks(5).pop())])
        .join('text')
        .attr('id', 'y-axis-title')
        .attr('text-anchor', 'middle')
        .attr('y', (d) => d)
        .attr('dy', '-2em')
        .text(yLabel);

      const yAxisEntries = yAxisG
        .selectAll('.y-axis-entry')
        .data(yScale.ticks(5).slice(1), (d) =>
          JSON.stringify(d)
        )
        .join('g')
        .attr('class', 'y-axis-entry')
        .attr('text-anchor', 'middle')
        .attr('fill', 'none');

      yAxisEntries
        .selectAll('.y-axis-circle')
        .data((d) => [d])
        .join('circle')
        .attr('class', 'y-axis-circle')
        .attr('stroke', '#000')
        .attr('stroke-opacity', 0.5)
        .attr('r', yScale);

      yAxisEntries
        .selectAll('.y-axis-labels')
        .data((d) => [d])
        .join('text')
        .attr('class', 'y-axis-labels')
        .attr('y', (d) => -yScale(d))
        .attr('dy', '0.35em')
        .attr('stroke', '#fff')
        .attr('stroke-width', 5)
        .text(yScale.tickFormat(5, 's'))
        .clone(true)
        .attr('fill', '#000')
        .attr('stroke', 'none');
    };

    my.width = function (_) {
      return arguments.length ? ((width = +_), my) : width;
    };

    my.height = function (_) {
      return arguments.length ? ((height = +_), my) : height;
    };

    my.data = function (_) {
      return arguments.length ? ((data = _), my) : data;
    };

    my.xValue = function (_) {
      return arguments.length ? ((xValue = _), my) : xValue;
    };

    my.xLabel = function (_) {
      return arguments.length ? ((xLabel = _), my) : xLabel;
    };

    my.yValue = function (_) {
      return arguments.length ? ((yValue = _), my) : yValue;
    };

    my.yLabel = function (_) {
      return arguments.length ? ((yLabel = _), my) : yLabel;
    };

    my.xValue = function (_) {
      return arguments.length ? ((xValue = _), my) : xValue;
    };

    my.stackValue = function (_) {
      return arguments.length
        ? ((stackValue = _), my)
        : stackValue;
    };

    my.margin = function (_) {
      return arguments.length ? ((margin = _), my) : margin;
    };

    my.yValueFormatter = function (_) {
      return arguments.length
        ? ((yValueFormatter = _), my)
        : yValueFormatter;
    };

    my.hoverText = function (_) {
      return arguments.length
        ? ((hoverText = _), my)
        : hoverText;
    };

    my.title = function (_) {
      return arguments.length ? ((title = _), my) : title;
    };

    my.legendTitle = function (_) {
      return arguments.length
        ? ((legendTitle = _), my)
        : legendTitle;
    };

    return my;
  };

  const contextChart = () => {
    let width;
    let height;
    let data;
    let stackValue;
    let xValue;
    let yValue;
    let filterData;

    const paddingInner = 0.05;

    const my = (selection) => {
      const barHeight = height - 20;

      const contextchart = selection
        .selectAll('#contextchart-area')
        .data([null])
        .join('g')
        .attr('id', 'contextchart-area');
      // .attr(
      //   'transform',
      //   `translate(${0}, ${0})`
      // );

      const stackSetTotals = [];

      function StackTotal(stackValue) {
        (this.stackValue = stackValue), (this.total = 0);
      }

      const dataGroupedByXValue = d3.group(data, (d) =>
        xValue(d)
      );

      const stackSet = [
        ...new Set(data.map((d) => stackValue(d))),
      ];
      let rowTotal;
      const transformedData = [];

      // loop on the map that has the key of x value and entries of data rows with that value
      for (const [xEntry, value] of dataGroupedByXValue) {
        const row = { xEntry };
        rowTotal = 0;
        const foundSet = new Set();
        for (const d of value) {
          row[stackValue(d)] = yValue(d);
          foundSet.add(stackValue(d));
          rowTotal += row[stackValue(d)];
        }
        const missingStackEntries = new Set(
          [...stackSet].filter((x) => !foundSet.has(x))
        );
        // if we are missing an entry for hte stack set, then add one with value 0
        for (let item of missingStackEntries) {
          row[item] = 0;
        }
        transformedData.push(row);
      }

      stackSet.forEach((s) => {
        const entry = new StackTotal(s);
        stackSetTotals.push(entry);
      });

      stackSet.forEach((s, i) => {
        transformedData.forEach((d) => {
          stackSetTotals[i].total += d[s];
        });
      });

      const xScaleContext = d3$1.scaleBand()
        .domain(stackSet)
        .range([0, width])
        .paddingInner(paddingInner);

      const max = d3.max(stackSetTotals, (d) => d.total);

      const yScaleContext = d3$1.scaleLinear()
        .domain([0, max])
        .range([0, height]);

      contextchart
        .selectAll('.contextchart-x-axis')
        .data([null])
        .join('g')
        .attr('transform', `translate(0, ${barHeight})`)
        .attr('class', 'contextchart-x-axis')
        .call(d3$1.axisBottom(xScaleContext));

      contextchart
        .selectAll('.contextchart-bars')
        .data(stackSetTotals)
        .join('rect')
        .attr('class', 'contextchart-bars')
        .attr('x', (d, i) => {
          return xScaleContext(d.stackValue);
        })
        .attr('y', (d) => {
          return barHeight - yScaleContext(d.total);
        })
        .attr('width', xScaleContext.bandwidth())
        .attr('height', (d) => yScaleContext(d.total))
        .attr('fill', '#7ED26D')
        .attr('fill', '#7ED26D');

      let brush = d3$1.brushX()
        .extent([
          [0, 0],
          [width, barHeight],
        ])
        .on('brush end', brushed);

      function brushed(event) {
        const yearLow = Math.floor(
          // TODO put this calculation in a function
          event.selection[0] /
            (xScaleContext.bandwidth() +
              paddingInner *
                xScaleContext.bandwidth() *
                (stackSet.length - 1))
        );
        const yearHigh = Math.floor(
          event.selection[1] /
            (xScaleContext.bandwidth() +
              paddingInner *
                xScaleContext.bandwidth() *
                (stackSet.length - 1))
        );
        const dateRange = [
          stackSet[yearLow],
          stackSet[yearHigh],
        ];
        filterData(dateRange);
      }

      contextchart
        .append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, xScaleContext.range());
    };

    my.width = function (_) {
      return arguments.length ? ((width = +_), my) : width;
    };

    my.height = function (_) {
      return arguments.length ? ((height = +_), my) : height;
    };

    my.data = function (_) {
      return arguments.length ? ((data = _), my) : data;
    };

    my.xValue = function (_) {
      return arguments.length ? ((xValue = _), my) : xValue;
    };

    my.yValue = function (_) {
      return arguments.length ? ((yValue = _), my) : yValue;
    };

    my.stackValue = function (_) {
      return arguments.length
        ? ((stackValue = _), my)
        : stackValue;
    };

    my.filterData = function (_) {
      return arguments.length
        ? ((filterData = _), my)
        : filterData;
    };

    return my;
  };

  const menu = () => {
    let id;
    let labelText;
    let options;
    const listeners = d3$1.dispatch('change');
    // <label for="cars">Choose a car:</label>

    // <select name="cars" id="cars">
    //   <option value="volvo">Volvo</option>
    //   <option value="saab">Saab</option>
    //   <option value="mercedes">Mercedes</option>
    //   <option value="audi">Audi</option>
    // </select>
    const my = (selection) => {
      selection
        .selectAll('label')
        .data([null])
        .join('label')
        .attr('for', id)
        .text(labelText);

      selection
        .selectAll('select')
        .data([null])
        .join('select')
        .attr('id', id)
        .on('change', (event) => {
          listeners.call('change', null, event.target.value);
        })
        .selectAll('option')
        .data(options)
        .join('option')
        .attr('value', (d) => d.value)
        .text((d) => d.text);
    };

    my.id = function (_) {
      return arguments.length ? ((id = _), my) : id;
    };

    my.labelText = function (_) {
      return arguments.length
        ? ((labelText = _), my)
        : labelText;
    };

    my.options = function (_) {
      return arguments.length ? ((options = _), my) : options;
    };

    my.on = function () {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? my : value;
    };

    return my;
  };

  const width = 500;
  const height = 500;
  const contextWidth = 200;
  const contextHeight = 100;

  let accountNumber = '2222222222';
  // TODO need to fix this hack
  let dateRange = [2019, 2021];

  //const svg = select('body');
  //   .append('svg')
  //   .attr('width', width)
  //   .attr('height', height)
  //   .append('svg')
  //   .attr('width', width)
  //   .attr('height', height)

  const svg = d3$1.select('#focus')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const menuContainer = d3$1.select('#menu');

  const options = [
    {
      value: '1111111111',
      text: '1111111111',
    },
    {
      value: '2222222222',
      text: '2222222222',
    },
    {
      value: '3333333333',
      text: '3333333333',
    },
  ];

  const context = d3$1.select('#context')
    .append('svg')
    .attr('width', contextWidth)
    .attr('height', contextHeight);

  const csvUrl = [
    'https://gist.githubusercontent.com/',
    'pcordone/', // User
    '93039d5d909fbf42838c5167219d6ed4/', // Id of the Gist
    'raw/c60b15781b63168a096404fa4be4ac2a252ee0c1/', // commit
    'electricAccountsData.csv', // File name
  ].join('');

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
    d.relativeMonthBillDate = new Date(
      d.relativeMonthBillDate
    );
    d.relativeMonthBillYear = d.relativeMonthBillDate.getFullYear();
    d.relativeMonthBillQtr = Math.floor(
      (d.relativeMonthBillDate.getMonth() + 3) / 3
    );
    d.timestamp = new Date(d.timestamp);
    d.netMeterCredits = +d.netMeterCredits;
    return d;
  };

  const main = async () => {
    const dateFormatterMMM = new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
      }
    );
    const legendTitleYear = 'Bill Year';

    let data = await d3$1.csv(csvUrl, parseRow);

    const yValue = (d) => d.totalKwh;
    const yValueFormatter = d3$1.format(',');

    menuContainer.call(
      menu()
        .id('account-menu')
        .labelText('Account:')
        .options(options)
        .on('change', (column) => {
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
      .xValue((d) =>
        dateFormatterMMM.format(d.relativeMonthBillDate)
      )
      .yValue((d) => yValue(d))
      .filterData((dateRange) => {
        svg.call(plot.data(filterData(accountNumber, dateRange)));
      });

    const plot = barChart()
      .width(width)
      .height(height)
      .data(filterData(accountNumber, dateRange))
      .xValue((d) =>
        dateFormatterMMM.format(d.relativeMonthBillDate)
      )
      .xLabel('Month')
      .yValue((d) => yValue(d))
      .yLabel('Electricy Usage kWH')
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
      .title('Personal Electric Consumption By Account')
      .legendTitle(legendTitleYear);
    svg.call(plot);
    context.call(contextPlot);
  };
  main();

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImJyb3dzZXJUZXh0LmpzIiwiYmFyQ2hhcnQuanMiLCJjb250ZXh0Q2hhcnQuanMiLCJtZW51LmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHZhciBCcm93c2VyVGV4dCA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgLyoqXG4gICAqIE1lYXN1cmVzIHRoZSByZW5kZXJlZCB3aWR0aCBvZiBhcmJpdHJhcnkgdGV4dCBnaXZlbiB0aGUgZm9udCBzaXplIGFuZCBmb250IGZhY2VcbiAgICoqL1xuICBmdW5jdGlvbiBnZXRXaWR0aCh0ZXh0LCBzZWxlY3Rvcikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG4gICAgY29udGV4dC5mb250ID0gc3R5bGUuZm9udFNpemUgKyAnICcgKyBzdHlsZS5mb250RmFtaWx5O1xuICAgIHJldHVybiBjb250ZXh0Lm1lYXN1cmVUZXh0KHRleHQpLndpZHRoO1xuICB9XG5cbiAgLyoqXG4gICAqIE1lYXN1cmVzIHRoZSByZW5kZXJlZCB3aWR0aCBvZiBhcmJpdHJhcnkgdGV4dCBnaXZlbiB0aGUgZm9udCBzaXplIGFuZCBmb250IGZhY2VcbiAgICoqL1xuICBmdW5jdGlvbiBnZXRIZWlnaHQoc2VsZWN0b3IpIHtcbiAgICBjb25zb2xlLmxvZyhzZWxlY3Rvcik7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuY29uc29sZS5sb2coZG9jdW1lbnQpO1xuY29uc29sZS5sb2coZWxlbWVudCk7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgIHJldHVybiBOdW1iZXIoc3R5bGUuZm9udFNpemUucmVwbGFjZSgvcHgkLywgJycpKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0V2lkdGg6IGdldFdpZHRoLFxuICAgIGdldEhlaWdodDogZ2V0SGVpZ2h0LFxuICB9O1xufSkoKTsiLCJpbXBvcnQgeyBCcm93c2VyVGV4dCB9IGZyb20gJy4vYnJvd3NlclRleHQnO1xuaW1wb3J0IHtcbiAgc2NhbGVMaW5lYXIsXG4gIHNjYWxlQmFuZCxcbiAgc2NhbGVUaW1lLFxuICBzY2FsZVJhZGlhbCxcbiAgc2NhbGVPcmRpbmFsLFxuICBtYXgsXG4gIGF4aXNMZWZ0LFxuICBheGlzQm90dG9tLFxuICB0cmFuc2l0aW9uLFxuICBhcmMsXG4gIGJydXNoLFxufSBmcm9tICdkMyc7XG5cbmV4cG9ydCBjb25zdCBiYXJDaGFydCA9ICgpID0+IHtcbiAgbGV0IHdpZHRoO1xuICBsZXQgaGVpZ2h0O1xuICBsZXQgZGF0YTtcbiAgbGV0IHhWYWx1ZTtcbiAgbGV0IHhMYWJlbDtcbiAgbGV0IHlWYWx1ZTtcbiAgbGV0IHlMYWJlbDtcbiAgbGV0IHN0YWNrVmFsdWU7XG4gIGxldCBtYXJnaW47XG4gIGxldCB5VmFsdWVGb3JtYXR0ZXI7XG4gIGxldCBob3ZlclRleHQ7XG4gIGxldCB0aXRsZTtcbiAgbGV0IGxlZ2VuZFRpdGxlO1xuXG4gIGNvbnN0IG15ID0gKHNlbGVjdGlvbikgPT4ge1xuICAgIGNvbnN0IGlubmVyV2lkdGggPSB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xuICAgIGNvbnN0IGlubmVySGVpZ2h0ID0gaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbiAgICBjb25zdCBpbm5lclJhZGl1cyA9IDEwMDtcbiAgICAvLyB0aGUgb3V0ZXJSYWRpdXMgZ29lcyBmcm9tIHRoZSBtaWRkbGUgb2YgdGhlIFNWRyBhcmVhIHRvIHRoZSBib3JkZXJcbiAgICBjb25zdCBvdXRlclJhZGl1cyA9XG4gICAgICBNYXRoLm1pbihpbm5lcldpZHRoLCBpbm5lckhlaWdodCkgLyAyO1xuXG4gICAgY29uc3QgZGF0YUdyb3VwZWRCeVhWYWx1ZSA9IGQzLmdyb3VwKGRhdGEsIChkKSA9PlxuICAgICAgeFZhbHVlKGQpXG4gICAgKTtcblxuICAgIC8vICAgICBjb25zdCBkYXRhR3JvdXBlZEJ5U3RhY2tWYWx1ZSA9IGQzLmdyb3VwKGRhdGEsIChkKSA9PiBzdGFja1ZhbHVlKGQpKTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRhR3JvdXBlZEJ5U3RhY2tWYWx1ZSk7XG5cbiAgICBjb25zdCBkb21haW4gPSBBcnJheS5mcm9tKGRhdGFHcm91cGVkQnlYVmFsdWUua2V5cygpKTtcblxuICAgIGNvbnN0IHN0YWNrU2V0ID0gW1xuICAgICAgLi4ubmV3IFNldChkYXRhLm1hcCgoZCkgPT4gc3RhY2tWYWx1ZShkKSkpLFxuICAgIF07XG5cbiAgICBsZXQgbWF4R3JvdXBUb3RhbCA9IDA7XG4gICAgbGV0IHJvd1RvdGFsO1xuICAgIGNvbnN0IHRyYW5zZm9ybWVkRGF0YSA9IFtdO1xuXG4gICAgLy8gbG9vcCBvbiB0aGUgbWFwIHRoYXQgaGFzIHRoZSBrZXkgb2YgeCB2YWx1ZSBhbmQgZW50cmllcyBvZiBkYXRhIHJvd3Mgd2l0aCB0aGF0IHZhbHVlXG4gICAgZm9yIChjb25zdCBbeEVudHJ5LCB2YWx1ZV0gb2YgZGF0YUdyb3VwZWRCeVhWYWx1ZSkge1xuICAgICAgY29uc3Qgcm93ID0geyB4RW50cnkgfTtcbiAgICAgIHJvd1RvdGFsID0gMDtcbiAgICAgIGNvbnN0IGZvdW5kU2V0ID0gbmV3IFNldCgpO1xuICAgICAgZm9yIChjb25zdCBkIG9mIHZhbHVlKSB7XG4gICAgICAgIHJvd1tzdGFja1ZhbHVlKGQpXSA9IHlWYWx1ZShkKTtcbiAgICAgICAgZm91bmRTZXQuYWRkKHN0YWNrVmFsdWUoZCkpO1xuICAgICAgICByb3dUb3RhbCArPSByb3dbc3RhY2tWYWx1ZShkKV07XG4gICAgICB9XG4gICAgICBjb25zdCBtaXNzaW5nU3RhY2tFbnRyaWVzID0gbmV3IFNldChcbiAgICAgICAgWy4uLnN0YWNrU2V0XS5maWx0ZXIoKHgpID0+ICFmb3VuZFNldC5oYXMoeCkpXG4gICAgICApO1xuICAgICAgLy8gaWYgd2UgYXJlIG1pc3NpbmcgYW4gZW50cnkgZm9yIGh0ZSBzdGFjayBzZXQsIHRoZW4gYWRkIG9uZSB3aXRoIHZhbHVlIDBcbiAgICAgIGZvciAobGV0IGl0ZW0gb2YgbWlzc2luZ1N0YWNrRW50cmllcykge1xuICAgICAgICByb3dbaXRlbV0gPSAwO1xuICAgICAgfVxuICAgICAgbWF4R3JvdXBUb3RhbCA9IE1hdGgubWF4KG1heEdyb3VwVG90YWwsIHJvd1RvdGFsKTtcbiAgICAgIHRyYW5zZm9ybWVkRGF0YS5wdXNoKHJvdyk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhY2tlZERhdGEgPSBkMy5zdGFjaygpLmtleXMoc3RhY2tTZXQpKFxuICAgICAgdHJhbnNmb3JtZWREYXRhXG4gICAgKTtcblxuICAgIGNvbnN0IHhTY2FsZSA9IHNjYWxlQmFuZCgpXG4gICAgICAuZG9tYWluKGRvbWFpbilcbiAgICAgIC5yYW5nZShbMCwgMiAqIE1hdGguUEldKVxuICAgICAgLmFsaWduKDApXG4gICAgICAucGFkZGluZygwLjEpO1xuXG4gICAgY29uc3QgeVNjYWxlID0gc2NhbGVSYWRpYWwoKVxuICAgICAgLmRvbWFpbihbMCwgbWF4R3JvdXBUb3RhbF0pXG4gICAgICAucmFuZ2UoW2lubmVyUmFkaXVzLCBvdXRlclJhZGl1c10pO1xuXG4gICAgY29uc3QgY29sb3IgPSBzY2FsZU9yZGluYWwoKVxuICAgICAgLmRvbWFpbihzdGFja1NldClcbiAgICAgIC5yYW5nZShkMy5zY2hlbWVDYXRlZ29yeTEwKTtcblxuICAgIGNvbnN0IHQgPSB0cmFuc2l0aW9uKCkuZHVyYXRpb24oMTAwMCk7XG5cbiAgICBjb25zdCB3ZWRnZSA9IGFyYygpXG4gICAgICAuaW5uZXJSYWRpdXMoKGQpID0+IHlTY2FsZShkWzBdKSlcbiAgICAgIC5vdXRlclJhZGl1cygoZCkgPT4geVNjYWxlKGRbMV0pKVxuICAgICAgLnN0YXJ0QW5nbGUoKGQpID0+IHhTY2FsZShkLmRhdGEueEVudHJ5KSlcbiAgICAgIC5lbmRBbmdsZShcbiAgICAgICAgKGQpID0+IHhTY2FsZShkLmRhdGEueEVudHJ5KSArIHhTY2FsZS5iYW5kd2lkdGgoKVxuICAgICAgKVxuICAgICAgLnBhZEFuZ2xlKDAuMDUpXG4gICAgICAucGFkUmFkaXVzKGlubmVyUmFkaXVzKTtcblxuICAgIGNvbnN0IGJhcmNoYXJ0ID0gc2VsZWN0aW9uXG4gICAgICAuc2VsZWN0QWxsKCcjYmFyY2hhcnQtYXJlYScpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignZycpXG4gICAgICAuYXR0cignaWQnLCAnYmFyY2hhcnQtYXJlYScpXG4gICAgICAuYXR0cihcbiAgICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICAgIGB0cmFuc2xhdGUoJHt3aWR0aCAvIDJ9LCR7aGVpZ2h0IC8gMn0pYFxuICAgICAgKTtcblxuICAgIC8vY29uc3QgZm9udEhlaWdodCA9IEJyb3dzZXJUZXh0LmdldEhlaWdodCgndGV4dCcpO1xuICAgIGNvbnN0IGZvbnRIZWlnaHQgPSAxMDtcblxuICAgIGNvbnN0IHN0YWNrc0cgPSBiYXJjaGFydFxuICAgICAgLnNlbGVjdEFsbCgnI3N0YWNrcy1ncm91cCcpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignZycpXG4gICAgICAuYXR0cignaWQnLCAnc3RhY2tzLWdyb3VwJyk7XG5cbiAgICBjb25zdCBsZWdlbmRHID0gYmFyY2hhcnRcbiAgICAgIC5zZWxlY3RBbGwoJyNsZWdlbmQtZ3JvdXAnKVxuICAgICAgLmRhdGEoW251bGxdKVxuICAgICAgLmpvaW4oJ2cnKVxuICAgICAgLmF0dHIoJ2lkJywgJ2xlZ2VuZC1ncm91cCcpO1xuICAgIFxuXG4gICAgbGVnZW5kR1xuICAgIFx0LnNlbGVjdEFsbCgnLmxlZ2VuZC10aXRsZScpXG4gICAgXHQuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbigndGV4dCcpXG4gICAgICAuYXR0cigndGV4dC1hbmNob3InLCAncmlnaHQnKVxuICAgICAgLmF0dHIoJ3gnLCAwKVxuICAgICAgLmF0dHIoJ3knLCAtZm9udEhlaWdodClcbiAgICAgIC5zdHlsZSgndGV4dC1kZWNvcmF0aW9uJywgJ3VuZGVybGluZScpXG4gICAgICAudGV4dChsZWdlbmRUaXRsZSk7XG5cbiAgICBsZWdlbmRHXG4gICAgICAuc2VsZWN0QWxsKCdsZWdlbmRkb3RzJylcbiAgICAgIC5kYXRhKHN0YWNrU2V0KVxuICAgICAgLmpvaW4oJ3JlY3QnKVxuICAgICAgLmF0dHIoJ3gnLCAwKVxuICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbiAoZCwgaSkge1xuICAgICAgICByZXR1cm4gMCArIGkgKiAoZm9udEhlaWdodCArIGZvbnRIZWlnaHQgLyAyKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignd2lkdGgnLCBmb250SGVpZ2h0KVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIGZvbnRIZWlnaHQpXG4gICAgICAuc3R5bGUoJ2ZpbGwnLCBmdW5jdGlvbiAoZCkge1xuICAgICAgICByZXR1cm4gY29sb3IoZCk7XG4gICAgICB9KTtcblxuICAgIGxlZ2VuZEdcbiAgICAgIC5zZWxlY3RBbGwoJ2xlZ2VuZGxhYmVscycpXG4gICAgICAuZGF0YShzdGFja1NldClcbiAgICAgIC5qb2luKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICcubGVnZW5kdGV4dCcpXG4gICAgICAvLy5hdHRyKCd4JywgaW5uZXJXaWR0aCAtIHRleHRXaWR0aCAtIDEwKVxuICAgICAgLmF0dHIoJ3gnLCAxNSlcbiAgICAgIC5hdHRyKCd5JywgZnVuY3Rpb24gKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBpICogKGZvbnRIZWlnaHQgKyBmb250SGVpZ2h0IC8gMikgKyBmb250SGVpZ2h0XG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnN0eWxlKCdmaWxsJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGNvbG9yKGQpO1xuICAgICAgfSlcbiAgICAgIC50ZXh0KGZ1bmN0aW9uIChkKSB7XG4gICAgICAgIHJldHVybiBkO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdsZWZ0JylcbiAgICAgIC5zdHlsZSgnYWxpZ25tZW50LWJhc2VsaW5lJywgJ21pZGRsZScpO1xuXG4gICAgY29uc3QgeEF4aXNMYWJlbHMgPSAoZykgPT5cbiAgICAgIGdcbiAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIChkKSA9PlxuICAgICAgICAgICh4U2NhbGUoZCkgK1xuICAgICAgICAgICAgeFNjYWxlLmJhbmR3aWR0aCgpIC8gMiArXG4gICAgICAgICAgICBNYXRoLlBJIC8gMikgJVxuICAgICAgICAgICAgKDIgKiBNYXRoLlBJKSA8XG4gICAgICAgICAgTWF0aC5QSVxuICAgICAgICAgICAgPyAncm90YXRlKDkwKXRyYW5zbGF0ZSgwLDE2KSdcbiAgICAgICAgICAgIDogJ3JvdGF0ZSgtOTApdHJhbnNsYXRlKDAsLTkpJ1xuICAgICAgICApXG4gICAgICAgIC50ZXh0KChkKSA9PiBkKTtcblxuICAgIGNvbnN0IHhBeGlzUm90YXRlID0gKGcpID0+IHtcbiAgICAgIGcuYXR0cihcbiAgICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICAgIChkKSA9PiBgXG4gICAgICAgICAgICByb3RhdGUoJHtcbiAgICAgICAgICAgICAgKCh4U2NhbGUoZCkgKyB4U2NhbGUuYmFuZHdpZHRoKCkgLyAyKSAqIDE4MCkgL1xuICAgICAgICAgICAgICAgIE1hdGguUEkgLVxuICAgICAgICAgICAgICA5MFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRyYW5zbGF0ZSgke2lubmVyUmFkaXVzfSwwKVxuICAgICAgICAgIGBcbiAgICAgICk7XG4gICAgfTtcblxuICAgIGNvbnN0IHhBeGlzRyA9IGJhcmNoYXJ0XG4gICAgICAuc2VsZWN0QWxsKCcjeC1heGlzJylcbiAgICAgIC5kYXRhKFtudWxsXSlcbiAgICAgIC5qb2luKCdnJylcbiAgICAgIC5hdHRyKCdpZCcsICd4LWF4aXMnKVxuICAgICAgLnNlbGVjdEFsbCgnLngtYXhpcy1lbnRyeScpXG4gICAgICAuZGF0YSh4U2NhbGUuZG9tYWluKCksIChkKSA9PiBKU09OLnN0cmluZ2lmeShkKSlcbiAgICAgIC5qb2luKCdnJylcbiAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3gtYXhpcy1lbnRyeScpXG4gICAgICAuY2FsbCh4QXhpc1JvdGF0ZSk7XG5cbiAgICB4QXhpc0dcbiAgICAgIC5zZWxlY3RBbGwoJy54LWF4aXMtbGFiZWwnKVxuICAgICAgLmRhdGEoKGQpID0+IFtkXSlcbiAgICAgIC5qb2luKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd4LWF4aXMtbGFiZWwnKVxuICAgICAgLmNhbGwoeEF4aXNMYWJlbHMpO1xuXG4gICAgeEF4aXNHXG4gICAgICAuc2VsZWN0QWxsKCcueC1heGlzLWxpbmVzJylcbiAgICAgIC5kYXRhKChkKSA9PiBbZF0pXG4gICAgICAuam9pbignbGluZScpXG4gICAgICAuYXR0cignY2xhc3MnLCAneC1heGlzLWxpbmVzJylcbiAgICAgIC5hdHRyKCd4MicsIC01KVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICcjMDAwJyk7XG5cbiAgICAvLyBFbnRlciBpbiB0aGUgc3RhY2sgZGF0YSA9IGxvb3Aga2V5IHBlciBrZXkgPSBncm91cCBwZXIgZ3JvdXBcbiAgICBjb25zdCBzdGFja091dGVyID0gc3RhY2tzR1xuICAgICAgLnNlbGVjdEFsbCgnLnN0YWNrLW91dGVyJylcbiAgICAgIC8vIEVudGVyIGluIHRoZSBzdGFjayBkYXRhID0gbG9vcCBrZXkgcGVyIGtleSA9IGdyb3VwIHBlciBncm91cFxuICAgICAgLmRhdGEoc3RhY2tlZERhdGEsIChkKSA9PiBKU09OLnN0cmluZ2lmeShkKSlcbiAgICAgIC5qb2luKCdnJylcbiAgICAgIC5hdHRyKCdmaWxsJywgKGQpID0+IGNvbG9yKGQua2V5KSlcbiAgICAgIC5hdHRyKCdjbGFzcycsICdzdGFjay1vdXRlcicpXG4gICAgICAuc2VsZWN0QWxsKCdzdGFjay1pbm5lcicpO1xuXG4gICAgLy8gZW50ZXIgYSBzZWNvbmQgdGltZSA9IGxvb3Agc3ViZ3JvdXAgcGVyIHN1Ymdyb3VwIHRvIGFkZCBhbGwgcmVjdGFuZ2xlc1xuICAgIHN0YWNrT3V0ZXJcbiAgICAgIC5kYXRhKChkKSA9PiBkKVxuICAgICAgLmpvaW4oXG4gICAgICAgIChlbnRlcikgPT5cbiAgICAgICAgICBlbnRlclxuICAgICAgICAgICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnc3RhY2staW5uZXInKVxuICAgICAgICAgICAgLmF0dHIoJ2QnLCB3ZWRnZSlcbiAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgLy9kMy5zZWxlY3QodGhpcykuYXR0cignb3BhY2l0eScsIDAuNzUpO1xuICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcykuYXR0cignc3Ryb2tlJywgJyMwMDAnKTtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3N0cm9rZS13aWR0aCcsICcyJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjUwKTtcbiAgICAgICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3N0cm9rZScsICdub25lJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmFwcGVuZCgndGl0bGUnKVxuICAgICAgICAgICAgLnRleHQoKGQsIGkpID0+XG4gICAgICAgICAgICAgIGhvdmVyVGV4dChkLCBpLCBkYXRhR3JvdXBlZEJ5WFZhbHVlKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgKHVwZGF0ZSkgPT5cbiAgICAgICAgICB1cGRhdGVcbiAgICAgICAgICAgIC5hdHRyKCdkJywgd2VkZ2UpXG4gICAgICAgICAgICAuYXBwZW5kKCd0aXRsZScpXG4gICAgICAgICAgICAudGV4dCgoZCwgaSkgPT5cbiAgICAgICAgICAgICAgaG92ZXJUZXh0KGQsIGksIGRhdGFHcm91cGVkQnlYVmFsdWUpXG4gICAgICAgICAgICApLFxuICAgICAgICAoZXhpdCkgPT4gZXhpdC5yZW1vdmUoKVxuICAgICAgKTtcblxuICAgIGNvbnN0IHlBeGlzRyA9IGJhcmNoYXJ0XG4gICAgICAuc2VsZWN0QWxsKCcjeS1heGlzJylcbiAgICAgIC5kYXRhKFtudWxsXSlcbiAgICAgIC5qb2luKCdnJylcbiAgICAgIC5hdHRyKCdpZCcsICd5LWF4aXMnKTtcblxuICAgIHlBeGlzR1xuICAgICAgLnNlbGVjdEFsbCgnI3ktYXhpcy10aXRsZScpXG4gICAgICAuZGF0YShbLXlTY2FsZSh5U2NhbGUudGlja3MoNSkucG9wKCkpXSlcbiAgICAgIC5qb2luKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdpZCcsICd5LWF4aXMtdGl0bGUnKVxuICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAuYXR0cigneScsIChkKSA9PiBkKVxuICAgICAgLmF0dHIoJ2R5JywgJy0yZW0nKVxuICAgICAgLnRleHQoeUxhYmVsKTtcblxuICAgIGNvbnN0IHlBeGlzRW50cmllcyA9IHlBeGlzR1xuICAgICAgLnNlbGVjdEFsbCgnLnktYXhpcy1lbnRyeScpXG4gICAgICAuZGF0YSh5U2NhbGUudGlja3MoNSkuc2xpY2UoMSksIChkKSA9PlxuICAgICAgICBKU09OLnN0cmluZ2lmeShkKVxuICAgICAgKVxuICAgICAgLmpvaW4oJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3ktYXhpcy1lbnRyeScpXG4gICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAgIC5hdHRyKCdmaWxsJywgJ25vbmUnKTtcblxuICAgIHlBeGlzRW50cmllc1xuICAgICAgLnNlbGVjdEFsbCgnLnktYXhpcy1jaXJjbGUnKVxuICAgICAgLmRhdGEoKGQpID0+IFtkXSlcbiAgICAgIC5qb2luKCdjaXJjbGUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3ktYXhpcy1jaXJjbGUnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICcjMDAwJylcbiAgICAgIC5hdHRyKCdzdHJva2Utb3BhY2l0eScsIDAuNSlcbiAgICAgIC5hdHRyKCdyJywgeVNjYWxlKTtcblxuICAgIHlBeGlzRW50cmllc1xuICAgICAgLnNlbGVjdEFsbCgnLnktYXhpcy1sYWJlbHMnKVxuICAgICAgLmRhdGEoKGQpID0+IFtkXSlcbiAgICAgIC5qb2luKCd0ZXh0JylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd5LWF4aXMtbGFiZWxzJylcbiAgICAgIC5hdHRyKCd5JywgKGQpID0+IC15U2NhbGUoZCkpXG4gICAgICAuYXR0cignZHknLCAnMC4zNWVtJylcbiAgICAgIC5hdHRyKCdzdHJva2UnLCAnI2ZmZicpXG4gICAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgNSlcbiAgICAgIC50ZXh0KHlTY2FsZS50aWNrRm9ybWF0KDUsICdzJykpXG4gICAgICAuY2xvbmUodHJ1ZSlcbiAgICAgIC5hdHRyKCdmaWxsJywgJyMwMDAnKVxuICAgICAgLmF0dHIoJ3N0cm9rZScsICdub25lJyk7XG4gIH07XG5cbiAgbXkud2lkdGggPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKCh3aWR0aCA9ICtfKSwgbXkpIDogd2lkdGg7XG4gIH07XG5cbiAgbXkuaGVpZ2h0ID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoaGVpZ2h0ID0gK18pLCBteSkgOiBoZWlnaHQ7XG4gIH07XG5cbiAgbXkuZGF0YSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKGRhdGEgPSBfKSwgbXkpIDogZGF0YTtcbiAgfTtcblxuICBteS54VmFsdWUgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKCh4VmFsdWUgPSBfKSwgbXkpIDogeFZhbHVlO1xuICB9O1xuXG4gIG15LnhMYWJlbCA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKHhMYWJlbCA9IF8pLCBteSkgOiB4TGFiZWw7XG4gIH07XG5cbiAgbXkueVZhbHVlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoeVZhbHVlID0gXyksIG15KSA6IHlWYWx1ZTtcbiAgfTtcblxuICBteS55TGFiZWwgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKCh5TGFiZWwgPSBfKSwgbXkpIDogeUxhYmVsO1xuICB9O1xuXG4gIG15LnhWYWx1ZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKHhWYWx1ZSA9IF8pLCBteSkgOiB4VmFsdWU7XG4gIH07XG5cbiAgbXkuc3RhY2tWYWx1ZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gKChzdGFja1ZhbHVlID0gXyksIG15KVxuICAgICAgOiBzdGFja1ZhbHVlO1xuICB9O1xuXG4gIG15Lm1hcmdpbiA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKG1hcmdpbiA9IF8pLCBteSkgOiBtYXJnaW47XG4gIH07XG5cbiAgbXkueVZhbHVlRm9ybWF0dGVyID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKHlWYWx1ZUZvcm1hdHRlciA9IF8pLCBteSlcbiAgICAgIDogeVZhbHVlRm9ybWF0dGVyO1xuICB9O1xuXG4gIG15LmhvdmVyVGV4dCA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gKChob3ZlclRleHQgPSBfKSwgbXkpXG4gICAgICA6IGhvdmVyVGV4dDtcbiAgfTtcblxuICBteS50aXRsZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKHRpdGxlID0gXyksIG15KSA6IHRpdGxlO1xuICB9O1xuXG4gIG15LmxlZ2VuZFRpdGxlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKGxlZ2VuZFRpdGxlID0gXyksIG15KVxuICAgICAgOiBsZWdlbmRUaXRsZTtcbiAgfTtcblxuICByZXR1cm4gbXk7XG59O1xuIiwiaW1wb3J0IHtcbiAgc2NhbGVMaW5lYXIsXG4gIHNjYWxlQmFuZCxcbiAgc2NhbGVUaW1lLFxuICBzY2FsZVJhZGlhbCxcbiAgc2NhbGVPcmRpbmFsLFxuICBtYXgsXG4gIGF4aXNMZWZ0LFxuICBheGlzQm90dG9tLFxuICB0cmFuc2l0aW9uLFxuICBhcmMsXG4gIGJydXNoLFxuICBicnVzaFgsXG59IGZyb20gJ2QzJztcblxuZXhwb3J0IGNvbnN0IGNvbnRleHRDaGFydCA9ICgpID0+IHtcbiAgbGV0IHdpZHRoO1xuICBsZXQgaGVpZ2h0O1xuICBsZXQgZGF0YTtcbiAgbGV0IHN0YWNrVmFsdWU7XG4gIGxldCB4VmFsdWU7XG4gIGxldCB5VmFsdWU7XG4gIGxldCBmaWx0ZXJEYXRhO1xuXG4gIGNvbnN0IHBhZGRpbmdJbm5lciA9IDAuMDU7XG5cbiAgY29uc3QgbXkgPSAoc2VsZWN0aW9uKSA9PiB7XG4gICAgY29uc3QgYmFySGVpZ2h0ID0gaGVpZ2h0IC0gMjA7XG5cbiAgICBjb25zdCBjb250ZXh0Y2hhcnQgPSBzZWxlY3Rpb25cbiAgICAgIC5zZWxlY3RBbGwoJyNjb250ZXh0Y2hhcnQtYXJlYScpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignZycpXG4gICAgICAuYXR0cignaWQnLCAnY29udGV4dGNoYXJ0LWFyZWEnKTtcbiAgICAvLyAuYXR0cihcbiAgICAvLyAgICd0cmFuc2Zvcm0nLFxuICAgIC8vICAgYHRyYW5zbGF0ZSgkezB9LCAkezB9KWBcbiAgICAvLyApO1xuXG4gICAgY29uc3Qgc3RhY2tTZXRUb3RhbHMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIFN0YWNrVG90YWwoc3RhY2tWYWx1ZSkge1xuICAgICAgKHRoaXMuc3RhY2tWYWx1ZSA9IHN0YWNrVmFsdWUpLCAodGhpcy50b3RhbCA9IDApO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGFHcm91cGVkQnlYVmFsdWUgPSBkMy5ncm91cChkYXRhLCAoZCkgPT5cbiAgICAgIHhWYWx1ZShkKVxuICAgICk7XG5cbiAgICBjb25zdCBzdGFja1NldCA9IFtcbiAgICAgIC4uLm5ldyBTZXQoZGF0YS5tYXAoKGQpID0+IHN0YWNrVmFsdWUoZCkpKSxcbiAgICBdO1xuXG4gICAgLy8gSSBuZWVkIHRvIHB1dCBjYWxjdWxhdGlvbiBvZiB0cmFuc2Zvcm1lZERhdGEgaW4gYSBjb21tb24gcGxhY2Ugd2hlcmUgYm90aCBjb250ZXh0Q2hhcnQgYW5kIGJhckNoYXJ0IGNhbiBjYWxsIGl0LlxuICAgIGxldCBtYXhHcm91cFRvdGFsID0gMDtcbiAgICBsZXQgcm93VG90YWw7XG4gICAgY29uc3QgdHJhbnNmb3JtZWREYXRhID0gW107XG5cbiAgICAvLyBsb29wIG9uIHRoZSBtYXAgdGhhdCBoYXMgdGhlIGtleSBvZiB4IHZhbHVlIGFuZCBlbnRyaWVzIG9mIGRhdGEgcm93cyB3aXRoIHRoYXQgdmFsdWVcbiAgICBmb3IgKGNvbnN0IFt4RW50cnksIHZhbHVlXSBvZiBkYXRhR3JvdXBlZEJ5WFZhbHVlKSB7XG4gICAgICBjb25zdCByb3cgPSB7IHhFbnRyeSB9O1xuICAgICAgcm93VG90YWwgPSAwO1xuICAgICAgY29uc3QgZm91bmRTZXQgPSBuZXcgU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IGQgb2YgdmFsdWUpIHtcbiAgICAgICAgcm93W3N0YWNrVmFsdWUoZCldID0geVZhbHVlKGQpO1xuICAgICAgICBmb3VuZFNldC5hZGQoc3RhY2tWYWx1ZShkKSk7XG4gICAgICAgIHJvd1RvdGFsICs9IHJvd1tzdGFja1ZhbHVlKGQpXTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1pc3NpbmdTdGFja0VudHJpZXMgPSBuZXcgU2V0KFxuICAgICAgICBbLi4uc3RhY2tTZXRdLmZpbHRlcigoeCkgPT4gIWZvdW5kU2V0Lmhhcyh4KSlcbiAgICAgICk7XG4gICAgICAvLyBpZiB3ZSBhcmUgbWlzc2luZyBhbiBlbnRyeSBmb3IgaHRlIHN0YWNrIHNldCwgdGhlbiBhZGQgb25lIHdpdGggdmFsdWUgMFxuICAgICAgZm9yIChsZXQgaXRlbSBvZiBtaXNzaW5nU3RhY2tFbnRyaWVzKSB7XG4gICAgICAgIHJvd1tpdGVtXSA9IDA7XG4gICAgICB9XG4gICAgICBtYXhHcm91cFRvdGFsID0gTWF0aC5tYXgobWF4R3JvdXBUb3RhbCwgcm93VG90YWwpO1xuICAgICAgdHJhbnNmb3JtZWREYXRhLnB1c2gocm93KTtcbiAgICB9XG5cbiAgICBzdGFja1NldC5mb3JFYWNoKChzKSA9PiB7XG4gICAgICBjb25zdCBlbnRyeSA9IG5ldyBTdGFja1RvdGFsKHMpO1xuICAgICAgc3RhY2tTZXRUb3RhbHMucHVzaChlbnRyeSk7XG4gICAgfSk7XG5cbiAgICBzdGFja1NldC5mb3JFYWNoKChzLCBpKSA9PiB7XG4gICAgICB0cmFuc2Zvcm1lZERhdGEuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICBzdGFja1NldFRvdGFsc1tpXS50b3RhbCArPSBkW3NdO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCB4U2NhbGVDb250ZXh0ID0gc2NhbGVCYW5kKClcbiAgICAgIC5kb21haW4oc3RhY2tTZXQpXG4gICAgICAucmFuZ2UoWzAsIHdpZHRoXSlcbiAgICAgIC5wYWRkaW5nSW5uZXIocGFkZGluZ0lubmVyKTtcblxuICAgIGNvbnN0IG1heCA9IGQzLm1heChzdGFja1NldFRvdGFscywgKGQpID0+IGQudG90YWwpO1xuXG4gICAgY29uc3QgeVNjYWxlQ29udGV4dCA9IHNjYWxlTGluZWFyKClcbiAgICAgIC5kb21haW4oWzAsIG1heF0pXG4gICAgICAucmFuZ2UoWzAsIGhlaWdodF0pO1xuXG4gICAgY29udGV4dGNoYXJ0XG4gICAgICAuc2VsZWN0QWxsKCcuY29udGV4dGNoYXJ0LXgtYXhpcycpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignZycpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgwLCAke2JhckhlaWdodH0pYClcbiAgICAgIC5hdHRyKCdjbGFzcycsICdjb250ZXh0Y2hhcnQteC1heGlzJylcbiAgICAgIC5jYWxsKGF4aXNCb3R0b20oeFNjYWxlQ29udGV4dCkpO1xuXG4gICAgY29udGV4dGNoYXJ0XG4gICAgICAuc2VsZWN0QWxsKCcuY29udGV4dGNoYXJ0LWJhcnMnKVxuICAgICAgLmRhdGEoc3RhY2tTZXRUb3RhbHMpXG4gICAgICAuam9pbigncmVjdCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAnY29udGV4dGNoYXJ0LWJhcnMnKVxuICAgICAgLmF0dHIoJ3gnLCAoZCwgaSkgPT4ge1xuICAgICAgICByZXR1cm4geFNjYWxlQ29udGV4dChkLnN0YWNrVmFsdWUpO1xuICAgICAgfSlcbiAgICAgIC5hdHRyKCd5JywgKGQpID0+IHtcbiAgICAgICAgcmV0dXJuIGJhckhlaWdodCAtIHlTY2FsZUNvbnRleHQoZC50b3RhbCk7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ3dpZHRoJywgeFNjYWxlQ29udGV4dC5iYW5kd2lkdGgoKSlcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCAoZCkgPT4geVNjYWxlQ29udGV4dChkLnRvdGFsKSlcbiAgICAgIC5hdHRyKCdmaWxsJywgJyM3RUQyNkQnKVxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnIzdFRDI2RCcpO1xuXG4gICAgbGV0IGJydXNoID0gYnJ1c2hYKClcbiAgICAgIC5leHRlbnQoW1xuICAgICAgICBbMCwgMF0sXG4gICAgICAgIFt3aWR0aCwgYmFySGVpZ2h0XSxcbiAgICAgIF0pXG4gICAgICAub24oJ2JydXNoIGVuZCcsIGJydXNoZWQpO1xuXG4gICAgZnVuY3Rpb24gYnJ1c2hlZChldmVudCkge1xuICAgICAgY29uc3QgeWVhckxvdyA9IE1hdGguZmxvb3IoXG4gICAgICAgIC8vIFRPRE8gcHV0IHRoaXMgY2FsY3VsYXRpb24gaW4gYSBmdW5jdGlvblxuICAgICAgICBldmVudC5zZWxlY3Rpb25bMF0gL1xuICAgICAgICAgICh4U2NhbGVDb250ZXh0LmJhbmR3aWR0aCgpICtcbiAgICAgICAgICAgIHBhZGRpbmdJbm5lciAqXG4gICAgICAgICAgICAgIHhTY2FsZUNvbnRleHQuYmFuZHdpZHRoKCkgKlxuICAgICAgICAgICAgICAoc3RhY2tTZXQubGVuZ3RoIC0gMSkpXG4gICAgICApO1xuICAgICAgY29uc3QgeWVhckhpZ2ggPSBNYXRoLmZsb29yKFxuICAgICAgICBldmVudC5zZWxlY3Rpb25bMV0gL1xuICAgICAgICAgICh4U2NhbGVDb250ZXh0LmJhbmR3aWR0aCgpICtcbiAgICAgICAgICAgIHBhZGRpbmdJbm5lciAqXG4gICAgICAgICAgICAgIHhTY2FsZUNvbnRleHQuYmFuZHdpZHRoKCkgKlxuICAgICAgICAgICAgICAoc3RhY2tTZXQubGVuZ3RoIC0gMSkpXG4gICAgICApO1xuICAgICAgY29uc3QgZGF0ZVJhbmdlID0gW1xuICAgICAgICBzdGFja1NldFt5ZWFyTG93XSxcbiAgICAgICAgc3RhY2tTZXRbeWVhckhpZ2hdLFxuICAgICAgXTtcbiAgICAgIGZpbHRlckRhdGEoZGF0ZVJhbmdlKTtcbiAgICB9XG5cbiAgICBjb250ZXh0Y2hhcnRcbiAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2JydXNoJylcbiAgICAgIC5jYWxsKGJydXNoKVxuICAgICAgLmNhbGwoYnJ1c2gubW92ZSwgeFNjYWxlQ29udGV4dC5yYW5nZSgpKTtcbiAgfTtcblxuICBteS53aWR0aCA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKHdpZHRoID0gK18pLCBteSkgOiB3aWR0aDtcbiAgfTtcblxuICBteS5oZWlnaHQgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKChoZWlnaHQgPSArXyksIG15KSA6IGhlaWdodDtcbiAgfTtcblxuICBteS5kYXRhID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoZGF0YSA9IF8pLCBteSkgOiBkYXRhO1xuICB9O1xuXG4gIG15LnhWYWx1ZSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKHhWYWx1ZSA9IF8pLCBteSkgOiB4VmFsdWU7XG4gIH07XG5cbiAgbXkueVZhbHVlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoeVZhbHVlID0gXyksIG15KSA6IHlWYWx1ZTtcbiAgfTtcblxuICBteS5zdGFja1ZhbHVlID0gZnVuY3Rpb24gKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyAoKHN0YWNrVmFsdWUgPSBfKSwgbXkpXG4gICAgICA6IHN0YWNrVmFsdWU7XG4gIH07XG5cbiAgbXkuZmlsdGVyRGF0YSA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gKChmaWx0ZXJEYXRhID0gXyksIG15KVxuICAgICAgOiBmaWx0ZXJEYXRhO1xuICB9O1xuXG4gIHJldHVybiBteTtcbn07XG4iLCJpbXBvcnQgeyBkaXNwYXRjaCB9IGZyb20gJ2QzJztcbmV4cG9ydCBjb25zdCBtZW51ID0gKCkgPT4ge1xuICBsZXQgaWQ7XG4gIGxldCBsYWJlbFRleHQ7XG4gIGxldCBvcHRpb25zO1xuICBjb25zdCBsaXN0ZW5lcnMgPSBkaXNwYXRjaCgnY2hhbmdlJyk7XG4gIC8vIDxsYWJlbCBmb3I9XCJjYXJzXCI+Q2hvb3NlIGEgY2FyOjwvbGFiZWw+XG5cbiAgLy8gPHNlbGVjdCBuYW1lPVwiY2Fyc1wiIGlkPVwiY2Fyc1wiPlxuICAvLyAgIDxvcHRpb24gdmFsdWU9XCJ2b2x2b1wiPlZvbHZvPC9vcHRpb24+XG4gIC8vICAgPG9wdGlvbiB2YWx1ZT1cInNhYWJcIj5TYWFiPC9vcHRpb24+XG4gIC8vICAgPG9wdGlvbiB2YWx1ZT1cIm1lcmNlZGVzXCI+TWVyY2VkZXM8L29wdGlvbj5cbiAgLy8gICA8b3B0aW9uIHZhbHVlPVwiYXVkaVwiPkF1ZGk8L29wdGlvbj5cbiAgLy8gPC9zZWxlY3Q+XG4gIGNvbnN0IG15ID0gKHNlbGVjdGlvbikgPT4ge1xuICAgIHNlbGVjdGlvblxuICAgICAgLnNlbGVjdEFsbCgnbGFiZWwnKVxuICAgICAgLmRhdGEoW251bGxdKVxuICAgICAgLmpvaW4oJ2xhYmVsJylcbiAgICAgIC5hdHRyKCdmb3InLCBpZClcbiAgICAgIC50ZXh0KGxhYmVsVGV4dCk7XG5cbiAgICBzZWxlY3Rpb25cbiAgICAgIC5zZWxlY3RBbGwoJ3NlbGVjdCcpXG4gICAgICAuZGF0YShbbnVsbF0pXG4gICAgICAuam9pbignc2VsZWN0JylcbiAgICAgIC5hdHRyKCdpZCcsIGlkKVxuICAgICAgLm9uKCdjaGFuZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgbGlzdGVuZXJzLmNhbGwoJ2NoYW5nZScsIG51bGwsIGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICB9KVxuICAgICAgLnNlbGVjdEFsbCgnb3B0aW9uJylcbiAgICAgIC5kYXRhKG9wdGlvbnMpXG4gICAgICAuam9pbignb3B0aW9uJylcbiAgICAgIC5hdHRyKCd2YWx1ZScsIChkKSA9PiBkLnZhbHVlKVxuICAgICAgLnRleHQoKGQpID0+IGQudGV4dCk7XG4gIH07XG5cbiAgbXkuaWQgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKChpZCA9IF8pLCBteSkgOiBpZDtcbiAgfTtcblxuICBteS5sYWJlbFRleHQgPSBmdW5jdGlvbiAoXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/ICgobGFiZWxUZXh0ID0gXyksIG15KVxuICAgICAgOiBsYWJlbFRleHQ7XG4gIH07XG5cbiAgbXkub3B0aW9ucyA9IGZ1bmN0aW9uIChfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoKG9wdGlvbnMgPSBfKSwgbXkpIDogb3B0aW9ucztcbiAgfTtcblxuICBteS5vbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdmFsdWUgPSBsaXN0ZW5lcnMub24uYXBwbHkobGlzdGVuZXJzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbGlzdGVuZXJzID8gbXkgOiB2YWx1ZTtcbiAgfTtcblxuICByZXR1cm4gbXk7XG59O1xuIiwiaW1wb3J0IHsgc2VsZWN0LCBjc3YsIGZvcm1hdCB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGJhckNoYXJ0IH0gZnJvbSAnLi9iYXJDaGFydC5qcyc7XG5pbXBvcnQgeyBjb250ZXh0Q2hhcnQgfSBmcm9tICcuL2NvbnRleHRDaGFydC5qcyc7XG5pbXBvcnQgeyBtZW51IH0gZnJvbSAnLi9tZW51JztcblxuY29uc3Qgd2lkdGggPSA1MDA7XG5jb25zdCBoZWlnaHQgPSA1MDA7XG5jb25zdCBjb250ZXh0V2lkdGggPSAyMDA7XG5jb25zdCBjb250ZXh0SGVpZ2h0ID0gMTAwO1xuXG5sZXQgYWNjb3VudE51bWJlciA9ICcyMjIyMjIyMjIyJztcbi8vIFRPRE8gbmVlZCB0byBmaXggdGhpcyBoYWNrXG5sZXQgZGF0ZVJhbmdlID0gWzIwMTksIDIwMjFdO1xuXG4vL2NvbnN0IHN2ZyA9IHNlbGVjdCgnYm9keScpO1xuLy8gICAuYXBwZW5kKCdzdmcnKVxuLy8gICAuYXR0cignd2lkdGgnLCB3aWR0aClcbi8vICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbi8vICAgLmFwcGVuZCgnc3ZnJylcbi8vICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4vLyAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpXG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnI2ZvY3VzJylcbiAgLmFwcGVuZCgnc3ZnJylcbiAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG5jb25zdCBtZW51Q29udGFpbmVyID0gc2VsZWN0KCcjbWVudScpO1xuXG5jb25zdCBvcHRpb25zID0gW1xuICB7XG4gICAgdmFsdWU6ICcxMTExMTExMTExJyxcbiAgICB0ZXh0OiAnMTExMTExMTExMScsXG4gIH0sXG4gIHtcbiAgICB2YWx1ZTogJzIyMjIyMjIyMjInLFxuICAgIHRleHQ6ICcyMjIyMjIyMjIyJyxcbiAgfSxcbiAge1xuICAgIHZhbHVlOiAnMzMzMzMzMzMzMycsXG4gICAgdGV4dDogJzMzMzMzMzMzMzMnLFxuICB9LFxuXTtcblxuY29uc3QgY29udGV4dCA9IHNlbGVjdCgnI2NvbnRleHQnKVxuICAuYXBwZW5kKCdzdmcnKVxuICAuYXR0cignd2lkdGgnLCBjb250ZXh0V2lkdGgpXG4gIC5hdHRyKCdoZWlnaHQnLCBjb250ZXh0SGVpZ2h0KTtcblxuY29uc3QgY3N2VXJsID0gW1xuICAnaHR0cHM6Ly9naXN0LmdpdGh1YnVzZXJjb250ZW50LmNvbS8nLFxuICAncGNvcmRvbmUvJywgLy8gVXNlclxuICAnOTMwMzlkNWQ5MDlmYmY0MjgzOGM1MTY3MjE5ZDZlZDQvJywgLy8gSWQgb2YgdGhlIEdpc3RcbiAgJ3Jhdy9jNjBiMTU3ODFiNjMxNjhhMDk2NDA0ZmE0YmU0YWMyYTI1MmVlMGMxLycsIC8vIGNvbW1pdFxuICAnZWxlY3RyaWNBY2NvdW50c0RhdGEuY3N2JywgLy8gRmlsZSBuYW1lXG5dLmpvaW4oJycpO1xuXG5jb25zdCBwYXJzZVJvdyA9IChkKSA9PiB7XG4gIGQucmVhZERhdGUgPSBuZXcgRGF0ZShkLnJlYWREYXRlKTtcbiAgZC5yZWFkRGF5cyA9ICtkLnJlYWREYXlzO1xuICBkLnRvdGFsS3doID0gK2QudG90YWxLd2g7XG4gIGQudXRpbGl0eUNoYXJnZXMgPSArZC51dGlsaXR5Q2hhcmdlcztcbiAgZC5zdXBwbGllckNoYXJnZXMgPSArZC5zdXBwbGllckNoYXJnZXM7XG4gIGQudG90YWxDaGFyZ2VzID0gK2QudG90YWxDaGFyZ2VzO1xuICBkLmF2Z0RhaWx5VXNhZ2UgPSArZC5hdmdEYWlseVVzYWdlO1xuICBkLnJlYWRGcm9tRGF0ZSA9IG5ldyBEYXRlKGQucmVhZEZyb21EYXRlKTtcbiAgZC5yZWFkVG9EYXRlID0gbmV3IERhdGUoZC5yZWFkVG9EYXRlKTtcbiAgZC5yZWxhdGl2ZU1vbnRoQmlsbERhdGUgPSBuZXcgRGF0ZShcbiAgICBkLnJlbGF0aXZlTW9udGhCaWxsRGF0ZVxuICApO1xuICBkLnJlbGF0aXZlTW9udGhCaWxsWWVhciA9IGQucmVsYXRpdmVNb250aEJpbGxEYXRlLmdldEZ1bGxZZWFyKCk7XG4gIGQucmVsYXRpdmVNb250aEJpbGxRdHIgPSBNYXRoLmZsb29yKFxuICAgIChkLnJlbGF0aXZlTW9udGhCaWxsRGF0ZS5nZXRNb250aCgpICsgMykgLyAzXG4gICk7XG4gIGQudGltZXN0YW1wID0gbmV3IERhdGUoZC50aW1lc3RhbXApO1xuICBkLm5ldE1ldGVyQ3JlZGl0cyA9ICtkLm5ldE1ldGVyQ3JlZGl0cztcbiAgcmV0dXJuIGQ7XG59O1xuXG5jb25zdCBtYWluID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBkYXRlRm9ybWF0dGVyTU1NWVkgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcbiAgICAnZW4tVVMnLFxuICAgIHtcbiAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgeWVhcjogJzItZGlnaXQnLFxuICAgIH1cbiAgKTtcbiAgY29uc3QgZGF0ZUZvcm1hdHRlck1NTSA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KFxuICAgICdlbi1VUycsXG4gICAge1xuICAgICAgbW9udGg6ICdzaG9ydCcsXG4gICAgfVxuICApO1xuICBjb25zdCBkYXRlRm9ybWF0dGVyUXRyID0gKGQpID0+XG4gICAgTWF0aC5mbG9vcihcbiAgICAgIChkLnJlbGF0aXZlTW9udGhCaWxsRGF0ZS5nZXRNb250aCgpICsgMykgLyAzXG4gICAgKTtcblxuICBjb25zdCBsZWdlbmRUaXRsZUFjY291bnRzID0gJ0FjY291bnRzJztcbiAgY29uc3QgbGVnZW5kVGl0bGVZZWFyID0gJ0JpbGwgWWVhcic7XG5cbiAgbGV0IGRhdGEgPSBhd2FpdCBjc3YoY3N2VXJsLCBwYXJzZVJvdyk7XG5cbiAgY29uc3QgeVZhbHVlID0gKGQpID0+IGQudG90YWxLd2g7XG4gIGNvbnN0IHlWYWx1ZUZvcm1hdHRlciA9IGZvcm1hdCgnLCcpO1xuXG4gIG1lbnVDb250YWluZXIuY2FsbChcbiAgICBtZW51KClcbiAgICAgIC5pZCgnYWNjb3VudC1tZW51JylcbiAgICAgIC5sYWJlbFRleHQoJ0FjY291bnQ6JylcbiAgICAgIC5vcHRpb25zKG9wdGlvbnMpXG4gICAgICAub24oJ2NoYW5nZScsIChjb2x1bW4pID0+IHtcbiAgICAgICAgYWNjb3VudE51bWJlciA9IGNvbHVtbjtcbiAgICAgICAgc3ZnLmNhbGwocGxvdC5kYXRhKGZpbHRlckRhdGEoYWNjb3VudE51bWJlciwgZGF0ZVJhbmdlKSkpO1xuICAgICAgfSlcbiAgKTtcblxuICBjb25zdCBmaWx0ZXJEYXRhID0gKGFjdE51bSwgZHRlUm5nKSA9PiB7XG4gICAgYWNjb3VudE51bWJlciA9IGFjdE51bTtcbiAgICBkYXRlUmFuZ2UgPSBkdGVSbmc7XG4gICAgcmV0dXJuIGRhdGEuZmlsdGVyKFxuICAgICAgKGQpID0+XG4gICAgICAgIGQuYWNjb3VudE51bWJlciA9PT0gYWNjb3VudE51bWJlciAmJlxuICAgICAgICBkLnJlbGF0aXZlTW9udGhCaWxsWWVhciA+PSBkYXRlUmFuZ2VbMF0gJiZcbiAgICAgICAgZC5yZWxhdGl2ZU1vbnRoQmlsbFllYXIgPD0gZGF0ZVJhbmdlWzFdXG4gICAgKTtcbiAgfTtcblxuICBjb25zdCBjb250ZXh0UGxvdCA9IGNvbnRleHRDaGFydCgpXG4gICAgLndpZHRoKGNvbnRleHRXaWR0aClcbiAgICAuaGVpZ2h0KGNvbnRleHRIZWlnaHQpXG4gICAgLmRhdGEoZGF0YSlcbiAgICAuc3RhY2tWYWx1ZSgoZCkgPT4gZC5yZWxhdGl2ZU1vbnRoQmlsbFllYXIpXG4gICAgLnhWYWx1ZSgoZCkgPT5cbiAgICAgIGRhdGVGb3JtYXR0ZXJNTU0uZm9ybWF0KGQucmVsYXRpdmVNb250aEJpbGxEYXRlKVxuICAgIClcbiAgICAueVZhbHVlKChkKSA9PiB5VmFsdWUoZCkpXG4gICAgLmZpbHRlckRhdGEoKGRhdGVSYW5nZSkgPT4ge1xuICAgICAgc3ZnLmNhbGwocGxvdC5kYXRhKGZpbHRlckRhdGEoYWNjb3VudE51bWJlciwgZGF0ZVJhbmdlKSkpO1xuICAgIH0pO1xuXG4gIGNvbnN0IHBsb3QgPSBiYXJDaGFydCgpXG4gICAgLndpZHRoKHdpZHRoKVxuICAgIC5oZWlnaHQoaGVpZ2h0KVxuICAgIC5kYXRhKGZpbHRlckRhdGEoYWNjb3VudE51bWJlciwgZGF0ZVJhbmdlKSlcbiAgICAueFZhbHVlKChkKSA9PlxuICAgICAgZGF0ZUZvcm1hdHRlck1NTS5mb3JtYXQoZC5yZWxhdGl2ZU1vbnRoQmlsbERhdGUpXG4gICAgKVxuICAgIC54TGFiZWwoJ01vbnRoJylcbiAgICAueVZhbHVlKChkKSA9PiB5VmFsdWUoZCkpXG4gICAgLnlMYWJlbCgnRWxlY3RyaWN5IFVzYWdlIGtXSCcpXG4gICAgLnlWYWx1ZUZvcm1hdHRlcih5VmFsdWVGb3JtYXR0ZXIpXG4gICAgLmhvdmVyVGV4dCgoZCwgaSwgZ3JvdXBlZERhdGEpID0+IHtcbiAgICAgIGNvbnN0IGJhclRvdGFsID0gZ3JvdXBlZERhdGFcbiAgICAgICAgLmdldChkLmRhdGEueEVudHJ5KVxuICAgICAgICAucmVkdWNlKChhY2MsIGQpID0+IGFjYyArIHlWYWx1ZShkKSwgMCk7XG4gICAgICByZXR1cm4gYFVzYWdlOiAke3lWYWx1ZUZvcm1hdHRlcihkWzFdIC0gZFswXSl9IGtXSFxuVG90YWw6ICAgICR7eVZhbHVlRm9ybWF0dGVyKGJhclRvdGFsKX0ga1dIYDtcbiAgICB9KVxuICAgIC5zdGFja1ZhbHVlKChkKSA9PiBkLnJlbGF0aXZlTW9udGhCaWxsWWVhcilcbiAgICAubWFyZ2luKHtcbiAgICAgIHRvcDogNTAsXG4gICAgICByaWdodDogNTAsXG4gICAgICBib3R0b206IDUwLFxuICAgICAgbGVmdDogNzUsXG4gICAgfSlcbiAgICAudGl0bGUoJ1BlcnNvbmFsIEVsZWN0cmljIENvbnN1bXB0aW9uIEJ5IEFjY291bnQnKVxuICAgIC5sZWdlbmRUaXRsZShsZWdlbmRUaXRsZVllYXIpO1xuICBzdmcuY2FsbChwbG90KTtcbiAgY29udGV4dC5jYWxsKGNvbnRleHRQbG90KTtcbn07XG5tYWluKCk7XG4iXSwibmFtZXMiOlsic2NhbGVCYW5kIiwic2NhbGVSYWRpYWwiLCJzY2FsZU9yZGluYWwiLCJ0cmFuc2l0aW9uIiwiYXJjIiwic2NhbGVMaW5lYXIiLCJheGlzQm90dG9tIiwiYnJ1c2hYIiwiZGlzcGF0Y2giLCJzZWxlY3QiLCJjc3YiLCJmb3JtYXQiXSwibWFwcGluZ3MiOiI7OztFQUFPLElBQUksV0FBVyxHQUFHLENBQUMsWUFBWTtFQUN0QyxFQUFFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO0VBQy9DLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEM7RUFDQTtFQUNBO0VBQ0E7RUFDQSxFQUFFLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7RUFDcEMsSUFBSSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQ3JELElBQUksTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxD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LENBQUM7RUFDM0IsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0VBQzlCLEdBQUcsQ0FBQztBQUNKO0VBQ0EsRUFBRSxFQUFFLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0VBQzFCLElBQUksT0FBTyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUM7RUFDekQsR0FBRyxDQUFDO0FBQ0o7RUFDQSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEVBQUU7RUFDM0IsSUFBSSxPQUFPLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMzRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsRUFBRTtFQUN6QixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQztFQUN0RCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMvQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU07RUFDM0IsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLEdBQUcsRUFBRTtFQUM3QixRQUFRLFVBQVUsQ0FBQztFQUNuQixHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtFQUMzQixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLE1BQU0sQ0FBQztFQUMxRCxHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsRUFBRTtFQUNwQyxJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU07RUFDM0IsU0FBUyxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRTtFQUNsQyxRQUFRLGVBQWUsQ0FBQztFQUN4QixHQUFHLENBQUM7QUFDSjtFQUNBLEVBQUUsRUFBRSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsRUFBRTtFQUM5QixJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU07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