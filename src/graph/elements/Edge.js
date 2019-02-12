goog.provide('anychart.graphModule.elements.Edge');

goog.require('anychart.core.Base');



/**
 * @constructor
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Edge = function() {
  anychart.graphModule.elements.Edge.base(this, 'constructor');
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
    //['targetShape', 0, anychart.Signal.NEEDS_REDRAW]?
  ]);
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.core.Base);

/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.elements.Edge.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.STROKE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Edge, anychart.graphModule.elements.Edge.OWN_DESCRIPTORS);
