goog.provide('anychart.timelineModule.series.Event');
goog.require('anychart.timelineModule.ConnectorSettings');
goog.require('anychart.timelineModule.drawers.Event');
goog.require('anychart.timelineModule.drawers.Range');
goog.require('anychart.timelineModule.series.Base');



/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.timelineModule.series.Base}
 */
anychart.timelineModule.series.Event = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Event.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.timelineModule.series.Event, anychart.timelineModule.series.Base);


/**
 * Event connector getter\setter.
 * @param {Object=} opt_config
 * @return {anychart.timelineModule.series.Event|anychart.timelineModule.ConnectorSettings}
 */
anychart.timelineModule.series.Event.prototype.connector = function(opt_config) {
  if (!this.connector_) {
    this.connector_ = new anychart.timelineModule.ConnectorSettings();
    this.setupCreated('connector', this.connector_);
  }

  if (goog.isDef(opt_config)) {
    this.connector_.setup(opt_config);
    return this;
  }

  return this.connector_;
};


/** @inheritDoc */
anychart.timelineModule.series.Event.prototype.transformY = function(value, opt_subRangeRatio) {
  var bounds = this.parentBounds();
  var zero = bounds.top + bounds.height / 2;
  var length = /** @type {number|string} */(this.connector().getOption('length'));
  length = anychart.utils.normalizeSize(length, this.parentBounds().height);
  return zero - length;
};
