goog.provide('anychart.graphModule.elements.Layout');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Layout = function(chart) {
  anychart.graphModule.elements.Layout.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['type', 0, anychart.Signal.NEEDS_REDRAW],
    ['edgeLength', 0, anychart.Signal.NEEDS_REDRAW]
  ]);

  this.func = {};
  this.func[anychart.graphModule.elements.LayoutType.FORCED] = goog.nullFunction;
  this.func[anychart.graphModule.elements.LayoutType.EXPLICIT] = anychart.graphModule.elements.Layout.prototype.explicitLayout_;

  this.chart_ = chart;

};
goog.inherits(anychart.graphModule.elements.Layout, anychart.core.Base);


/**
 * Types of chart
 * @enum {string}
 * */
anychart.graphModule.elements.LayoutType = {
  EXPLICIT: 'explicit',
  FORCED: 'forced'
};


anychart.graphModule.elements.Layout.prototype.getCoordinatesForCurrentLayout = function() {
  var type = this.getOption('type');
  var layout = this.func[type];
  return layout.call(this, this.chart_.nodes_);//todo getter/setter for nodes_
};


/**
 * @param {Object} nodes
 * @return {Array.<Object>} coordinate for nodes for draw.
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.explicitLayout_ = function(nodes) {
  var coordinates = [];

  for (var nodeId in nodes) {
    var node = nodes[nodeId];
    var x = node.position.x;
    var y = node.position.y;

    if (!x) x = 0;
    if (!y) y = 0;
    coordinates.push({
      nodeId: nodeId,
      position: {
        x: x,
        y: y
      }
    });
  }
  return coordinates;
};


anychart.graphModule.elements.Layout.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function layoutNormalizer() {
    return anychart.enums.normalize(anychart.graphModule.elements.LayoutType, value, anychart.graphModule.elements.LayoutType.EXPLICIT);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', layoutNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.core.settings.numberNormalizer]]
  );
});

