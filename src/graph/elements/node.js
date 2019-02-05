goog.provide('anychart.graphModule.elements.Node');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');



/**
 * @constructor
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Node = function() {

  //todo stateSettings
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
};


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.elements.Node.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.FILL,
    anychart.core.settings.descriptors.STROKE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Node, anychart.graphModule.Chart.OWN_DESCRIPTORS);
