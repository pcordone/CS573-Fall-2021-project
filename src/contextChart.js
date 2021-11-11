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
  brushX,
} from 'd3';

export const contextChart = () => {
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

    // I need to put calculation of transformedData in a common place where both contextChart and barChart can call it.
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

    stackSet.forEach((s) => {
      const entry = new StackTotal(s);
      stackSetTotals.push(entry);
    });

    stackSet.forEach((s, i) => {
      transformedData.forEach((d) => {
        stackSetTotals[i].total += d[s];
      });
    });

    const xScaleContext = scaleBand()
      .domain(stackSet)
      .range([0, width])
      .paddingInner(paddingInner);

    const max = d3.max(stackSetTotals, (d) => d.total);

    const yScaleContext = scaleLinear()
      .domain([0, max])
      .range([0, height]);

    contextchart
      .selectAll('.contextchart-x-axis')
      .data([null])
      .join('g')
      .attr('transform', `translate(0, ${barHeight})`)
      .attr('class', 'contextchart-x-axis')
      .call(axisBottom(xScaleContext));

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

    let brush = brushX()
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
