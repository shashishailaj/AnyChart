goog.provide('anychart.timelineModule.series.Range');

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
anychart.timelineModule.series.Range = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Range.base(this, 'constructor', chart, plot, type, config, sortedMode);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', 0, 0]
  ]);
};
goog.inherits(anychart.timelineModule.series.Range, anychart.timelineModule.series.Base);


anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.HEIGHT
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.series.Range, anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.createPositionProvider = function(position, opt_shift3d) {
  var iterator = this.getIterator();
  var x, y;
  var height = /** @type {number} */(iterator.meta('height'));
  var stackLevel = /** @type {number} */(iterator.meta('stackLevel'));
  var zero = /** @type {number} */(iterator.meta('zero'));
  var startX = /** @type {number} */(iterator.meta('startX'));
  var direction = /** @type {anychart.enums.EventMarkerDirection} */(this.getFinalDirection());

  if (direction == anychart.enums.EventMarkerDirection.AUTO) {
    direction = anychart.enums.EventMarkerDirection.UP;
  }

  var yOffset = height * (stackLevel - 1) + height / 2;
  x = startX;
  y = zero + (direction == anychart.enums.EventMarkerDirection.UP ? -yOffset : yOffset);
  var point = {'x': x, 'y': y};
  return {'value': point};
};
