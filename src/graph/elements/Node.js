goog.provide('anychart.graphModule.elements.Node');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');



/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Node = function(chart) {
  anychart.graphModule.elements.Node.base(this, 'constructor');

  this.chart_ = chart;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_MARKERS_AFTER_INIT_CALLBACK);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, function(factory) {
    factory.listenSignals(this.labelsInvalidated_, this);
  });

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0],
    ['markers', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);

  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);

  function markAllConsistent (factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
  }

  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.hovered_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_AFTER_INIT_CALLBACK, markAllConsistent);
};
goog.inherits(anychart.graphModule.elements.Node, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Node, ['fill', 'stroke', 'labels', 'markers'], 'normal');


/**
 * SetupElements
 * */
anychart.graphModule.elements.Node.prototype.setupElements = function() {
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Node}
 */
anychart.graphModule.elements.Node.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Node}
 */
anychart.graphModule.elements.Node.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Node}
 */
anychart.graphModule.elements.Node.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Node.prototype.getShape = function() {

};


/**
 * Get fill for node.
 * */
anychart.graphModule.elements.Node.prototype.getFill = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Node.prototype.getShape = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Node.prototype.getSettings = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Node.prototype.getSettings = function() {

};


/**
 * @param {string} nodeId id of node.
 * @return {?anychart.graphModule.elements.Node}
 * */
anychart.graphModule.elements.Node.prototype.node = function(nodeId) {
  return /** @type {anychart.graphModule.elements.Node} */(this.chart_.getElementInstance(anychart.graphModule.Chart.Element.NODE, nodeId));
};


/**
 * @return {Array.<anychart.graphModule.elements.Node>}
 * */
anychart.graphModule.elements.Node.prototype.getAllNodes = function() {
  var nodes = [];
  for (var node in this.chart_.nodes_) {
    nodes.push(this.node(node));
  }
  return nodes;
};


/**
 * @return {Array.<anychart.graphModule.elements.Node>}
 * */
anychart.graphModule.elements.Node.prototype.getNodeIds = function() {
  var ids = [];
  for (var node in this.chart_.nodes_) {
    ids.push(node);
  }
  return ids;
};
//endregion
//region Exports
// (function() {
//   var proto = anychart.graphModule.elements.Node.prototype;
//   proto['getAllNodes'] = proto.getAllNodes;
//   proto['node'] = proto.node;
// })();
// /**
//  * Properties that should be defined in class prototype.
//  * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
//  */
// anychart.graphModule.elements.Node.OWN_DESCRIPTORS = (function() {
//   /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
//   var map = {};
//
//   anychart.core.settings.createDescriptors(map, [
//     anychart.core.settings.descriptors.FILL,
//     anychart.core.settings.descriptors.STROKE,
//     anychart.core.settings.descriptors.SIZE
//   ]);
//
//   return map;
// })();
// anychart.core.settings.populate(anychart.graphModule.elements.Node, anychart.graphModule.Chart.OWN_DESCRIPTORS);
