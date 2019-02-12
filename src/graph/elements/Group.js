goog.provide('anychart.graphModule.elements.Group');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Group = function(chart) {
  anychart.graphModule.elements.Group.base(this, 'constructor');



  this.chart_ = chart;

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, function(factory) {
    factory.listenSignals(this.labelsInvalidated_, this);
  });

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.MARKERS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.DEFAULT_MARKERS_CONSTRUCTOR_NO_THEME);

  function markAllConsistent (factory) {
    factory.markConsistent(anychart.ConsistencyState.ALL);
  }

  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, markAllConsistent);
};
goog.inherits(anychart.graphModule.elements.Group, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Group, ['fill', 'stroke', 'labels'], 'normal');


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Group}
 */
anychart.graphModule.elements.Group.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Group}
 */
anychart.graphModule.elements.Group.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Group}
 */
anychart.graphModule.elements.Group.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Group.prototype.getShape = function() {

};


/**
 * Get fill for node.
 * */
anychart.graphModule.elements.Group.prototype.getFill = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Group.prototype.getShape = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Group.prototype.getSettings = function() {

};


/**
 * Get shape for node.
 * */
anychart.graphModule.elements.Group.prototype.getSettings = function() {

};


/**
 * @param {string} groupId id of node.
 * @return {?anychart.graphModule.elements.Group}
 * */
anychart.graphModule.elements.Group.prototype.group = function(groupId) {
  return this.chart_.getElementInstance(anychart.graphModule.Chart.Element.GROUP, groupId);
};


/**
 * @return {Array.<anychart.graphModule.elements.Group>}
 * */
anychart.graphModule.elements.Group.prototype.getAllGroups = function() {
  var groups = [];
  for (var group in this.chart_.groups_) {
    groups.push(this.group(group));
  }
  return groups;
};


/**
 * @return {Array.<string>}
 * */
anychart.graphModule.elements.Group.prototype.getGroupIds = function() {
  var ids = [];
  //todo getter for groups
  for (var group in this.chart_.groups_) {
    ids.push(group);
  }
  return ids;
};



//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Group.prototype;
  proto['normal'] = proto.normal;
  proto['selected'] = proto.selected;
  proto['hovered'] = proto.hovered;
})();
