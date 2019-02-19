goog.provide('anychart.timelineModule.series.Range');
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
anychart.timelineModule.series.Range = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Range.base(this, 'constructor', chart, plot, type, config, sortedMode);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', 0, 0]
  ]);
};
goog.inherits(anychart.timelineModule.series.Range, anychart.core.series.Cartesian);


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
