goog.provide('anychart.modules.cartesian');

goog.require('anychart');
goog.require('anychart.modules.area');
goog.require('anychart.modules.bar');
goog.require('anychart.modules.column');
goog.require('anychart.modules.finance');
goog.require('anychart.modules.line');
goog.require('anychart.modules.scatter');


/**
 * Returns a chart instance with initial settings (no axes, grids, titles, legend and so on).<br/>
 * <b>Note:</b> To get a chart with initial settings use:
 *  <ul>
 *      <li>{@link anychart.areaChart}</li>
 *      <li>{@link anychart.barChart}</li>
 *      <li>{@link anychart.columnChart}</li>
 *      <li>{@link anychart.financialChart}</li>
 *      <li>{@link anychart.lineChart}</li>
 *  </ul>
 * @example
 * var chart = anychart.cartesianChart();
 * chart.line([20, 7, 10, 14]);
 * @return {!anychart.cartesian.Chart} Empty chart.
 */
anychart.cartesianChart = function() {
  var chart = new anychart.cartesian.Chart();

  chart.title().enabled(false);
  chart.background().enabled(false);
  chart.legend().enabled(false);
  chart.margin(0);
  chart.padding(0);

  return chart;
};


//exports
goog.exportSymbol('anychart.cartesianChart', anychart.cartesianChart);//doc|ex