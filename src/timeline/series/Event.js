goog.provide('anychart.timelineModule.series.Event');
goog.require('anychart.core.series.Cartesian');
goog.require('anychart.timelineModule.ConnectorSettings');
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
anychart.timelineModule.series.Event = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Event.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.timelineModule.series.Event, anychart.core.series.Cartesian);


/**
 * Event connector getter\setter.
 * @param config
 * @return {anychart.timelineModule.series.Event|anychart.timelineModule.ConnectorSettings}
 */
anychart.timelineModule.series.Event.prototype.connector = function(config) {
  if (!this.connector_) {
    this.connector_ = new anychart.timelineModule.ConnectorSettings();
    this.setupCreated('connector', this.connector_);
  }

  if (goog.isDef(config)) {
    this.connector_.setup(config);
    return this;
  }

  return this.connector_;
};
