goog.provide('anychart.graphModule.elements.Connector');

goog.require('anychart.core.Base');



/**
 * @constructor
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Connector = function() {

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['targetShape', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.elements.Connector.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.STROKE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Connector, anychart.graphModule.Chart.OWN_DESCRIPTORS);
