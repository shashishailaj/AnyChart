goog.provide('anychart.graphModule.elements.Interactivity');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');



/**
 * @constructor
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Interactivity = function() {
  anychart.graphModule.elements.Interactivity.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['enabled', 0, 0],
    ['zoomOnMouseWheel', 0, 0],
    ['scrollOnMouseWheel', 0, 0],
    ['node', 0, 0],
    ['magnetize', 0, 0]
  ]);
};
goog.inherits(anychart.graphModule.elements.Interactivity, anychart.core.Base);


/**
 * Own property descriptors
 * */
anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'zoomOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'scrollOnMouseWheel', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'magnetize', anychart.core.settings.booleanNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'node', anychart.core.settings.booleanNormalizer]
  ]);
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Interactivity, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS);


/** @inheritDoc */
anychart.graphModule.elements.Interactivity.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Interactivity.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.graphModule.elements.Interactivity.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Interactivity.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.elements.Interactivity.OWN_DESCRIPTORS, json);
  return json;
};

