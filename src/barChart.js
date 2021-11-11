import { BrowserText } from './browserText';
import {
  scaleLinear,
  scaleBand,
  scaleTime,
  scaleRadial,
  scaleOrdinal,
  max,
  axisLeft,
  axisBottom,
  transition,
  arc,
  brush,
} from 'd3';

export const barChart = () => {
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

    const xScale = scaleBand()
      .domain(domain)
      .range([0, 2 * Math.PI])
      .align(0)
      .padding(0.1);

    const yScale = scaleRadial()
      .domain([0, maxGroupTotal])
      .range([innerRadius, outerRadius]);

    const color = scaleOrdinal()
      .domain(stackSet)
      .range(d3.schemeCategory10);

    const t = transition().duration(1000);

    const wedge = arc()
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
