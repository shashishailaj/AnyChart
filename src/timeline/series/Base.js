goog.provide('anychart.timelineModule.series.Base');
goog.require('anychart.core.series.Cartesian');


/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.timelineModule.series.Base = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Base.base(this, 'constructor', chart, plot, type, config, sortedMode);
};
goog.inherits(anychart.timelineModule.series.Base, anychart.core.series.Cartesian);


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.getCategoryWidth = function(opt_category) {
  return 0;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.needsExtremums = function() {
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.startDrawing = function(opt_crispEdges) {
  this.calculate();
  anychart.timelineModule.series.Base.base(this, 'startDrawing', opt_crispEdges);
};


/**
 * Calculate drawing plan.
 */
anychart.timelineModule.series.Base.prototype.calculate = function() {
  var drawingPlan = this.getScatterDrawingPlan(true, true);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.isPointVisible = function(point) {
  var x = anychart.utils.normalizeTimestamp(point.getX());
  var range = this.chart.xScale().getRange();
  if (x >= range['min'] || x <= range['max']) {
    return true;
  }
  return false;
};


/**
 * Meta maker for timeline.
 * @param rowInfo
 * @param yNames
 * @param yColumns
 * @param pointMissing
 * @param xRatio
 */
anychart.timelineModule.series.Base.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  rowInfo.meta('length', anychart.utils.normalizeSize(/** @type {string|number} */(this.getOption('length')), this.parentBounds().height));
  rowInfo.meta('x', this.parentBounds().left + this.parentBounds().width * xRatio);
  rowInfo.meta('zero', this.parentBounds().top + this.parentBounds().height / 2);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.planIsStacked = function() {
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.push(this.makeTimelineMeta);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var pointMissing = this.considerMetaEmpty() ?
    0 :
    (Number(rowInfo.meta('missing')) || 0) & ~anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  if (!this.isPointVisible(rowInfo))
    pointMissing |= anychart.core.series.PointAbsenceReason.OUT_OF_RANGE;
  var xRatio = this.getXScale().transform(
    rowInfo.getX());
  // we write it here, because meta makers can rewrite this field (in radar/polar, for ex.)
  rowInfo.meta('xRatio', xRatio);
  if (pointMissing) {
    this.makeMissing(rowInfo, yNames, xRatio);
  } else {
    for (var i = 0; i < this.metaMakers.length; i++) {
      pointMissing = this.metaMakers[i].call(this, rowInfo, yNames, yColumns, pointMissing, xRatio);
    }
  }
  rowInfo.meta('missing', pointMissing);
};
