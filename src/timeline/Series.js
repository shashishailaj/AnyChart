goog.provide('anychart.timelineModule.Series');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.timelineModule.drawers.Event');
goog.require('anychart.timelineModule.drawers.Range');


/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.timelineModule.Series = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.Series.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.timelineModule.Series, anychart.core.series.Cartesian);