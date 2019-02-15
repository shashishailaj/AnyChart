goog.provide('anychart.graphModule.elements.Node');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Node = function(chart) {
  anychart.graphModule.elements.Node.base(this, 'constructor');

  this.chart_ = chart;

  // /**
  //  * Array of dom elements.
  //  * For settings class contains all nodes without instance.
  //  * */
  // this.domElements = [];

  /**
   * Array of text elements.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   * */
  this.texts_ = [];

  /**
   * Layer for labels.
   * @type {acgraph.vector.UnmanagedLayer}
   * @private
   * */
  this.labelsLayerEl_;

  /**
   * Gap for magnetize.
   * @private
   * @const
   * */
  this.magnetizeGap_ = 10;
  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['size', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['type', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['size', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['type', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['labels', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);

};
goog.inherits(anychart.graphModule.elements.Node, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Node, ['fill', 'stroke', 'labels'], 'normal');


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
 * Getter for labels layer.
 * @return {acgraph.vector.UnmanagedLayer}
 */
anychart.graphModule.elements.Node.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = acgraph.getRenderer().createLayerElement();
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
  }
  return this.labelsLayer_;
};


/**
 * @inheritDoc
 */
anychart.graphModule.elements.Node.prototype.provideMeasurements = function() {
  if (!this.texts_.length) {
    var nodes = this.chart_.getNodesMap();
    for (var node in nodes) {
      var text = new anychart.core.ui.OptimizedText();
      // text.setClassName(this.labels().cssClass);
      this.texts_.push(text);
    }
  }
  return this.texts_;
};


/**
 * Fills text with style and text value.
 * @param {anychart.core.ui.OptimizedText} text - Text to setup.
 * @param {number} state Current state of element.
 * @param {anychart.graphModule.Chart.Node=} opt_node
 * @param {boolean=} opt_labelsAreOverridden - If labels settings are overridden.
 * @private
 */
anychart.graphModule.elements.Node.prototype.setupText_ = function(text, state, opt_node, opt_labelsAreOverridden) {
  var labels;

  if (opt_node) {
    if (opt_labelsAreOverridden) {
      // var index = /** @type {number} */ (opt_node.meta('index'));
      labels = this.overriddenLabels_[index];
    } else {
      var state = anychart.utils.pointStateToName(state);
      labels = this[state]().labels();
    }

    var provider = this.createFormatProvider(opt_node);
    var textVal = labels.getText(provider);
    text.text(textVal);
    opt_node.textElement = text;
  }
  // console.log(labels.flatten());
  text.style(labels.flatten());
  text.prepareComplexity();
  text.applySettings();
};


/**
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Node.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {
  // var labelsAreOverridden = this.hasLabelsOverrider();
  var i = 0;
  var nodes = this.chart_.getNodesMap();
  for (var node in nodes) {
    var text = this.texts_[i];
    i++;
    // var overriddenSettings;
    // if (labelsAreOverridden) {
    //   overriddenSettings = this.overriddenLabels_[i];
    //   if (!overriddenSettings) {
    //     overriddenSettings = new anychart.core.ui.LabelsSettings();
    //     overriddenSettings.dropThemes(true);
    //     overriddenSettings.parent(/** @type {anychart.core.ui.LabelsSettings} */ (this.labels()));
    //     this.overriddenLabels_[i] = overriddenSettings;
    //   }
    //   this.labelsOverrider_(overriddenSettings, item);
    // }
    // if (opt_needsToDropOldBounds) {
    //   text.resetComplexity();
    //   text.dropBounds();
    // }
    this.setupText_(text, anychart.SettingsState.NORMAL, nodes[node], false);
  }
};


/**
 *
 * */
anychart.graphModule.elements.Node.prototype.drawLabels = function() {
  var layer = this.getLabelsLayer();
  var nodes = this.chart_.getNodesMap();
  var i = 0;
  for (var node in nodes) {
    var textElement = this.texts_[i];
    if (this.labels()['enabled']()) {
      // var r = new anychart.math.Rect(this.pixelBoundsCache_.left, totalTop, this.pixelBoundsCache_.width, height);
      var cellBounds = anychart.math.rect(0, 0, 0, 0);

      textElement.renderTo(this.labelsLayerEl_);
      textElement.putAt(cellBounds, this.chart_.container().getStage());

      textElement.finalizeComplexity();
      // this.labelsTexts_.push(/** @type {string} */ (textElement.text()));
    } else {
      textElement.renderTo(null);
    }
    i++;
  }
  // this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
};


/**
 * Format provider for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {anychart.format.Context}
 * */
anychart.graphModule.elements.Node.prototype.createFormatProvider = function(node) {
  if (!this.formatProvider_) {
    this.formatProvider_ = new anychart.format.Context();
  }
  var values = {};
  values['id'] = {value: node.nodeId, type: anychart.enums.TokenType.STRING};
  if (goog.isDef(node.value)) {
    values['text'] = {value: node.value, type: anychart.enums.TokenType.STRING};
  }
  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};

/**
 * Stick node to sibling
 * */
anychart.graphModule.elements.Node.prototype.stickNode = function(node) {
  var closestX = -Infinity,
      closestY = -Infinity;
  for (var i = 0; i < node.connectedEdges.length; i++) {
    var edges = this.chart_.getEdgesMap();
    var nodes = this.chart_.getNodesMap();
    var from = nodes[edges[node.connectedEdges[i]].from];
    var to = nodes[edges[node.connectedEdges[i]].to];

    var siblingNode = from == node ? to : from;

    var gap = this.magnetizeGap_;
    if (node.position.x > (siblingNode.position.x - gap) && node.position.x < (siblingNode.position.x + gap)) {
      node.position.x = siblingNode.position.x;
    }

    if (node.position.y > (siblingNode.position.y - gap) && node.position.y < (siblingNode.position.y + gap)) {
      node.position.y = siblingNode.position.y;
    }
  }
};

/**
 * Format provider for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.StateSettings} state
 * */
anychart.graphModule.elements.Node.prototype.updateNode = function(node, state) {

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


// /**
//  * @param {string} nodeId id of node.
//  * @return {?anychart.graphModule.elements.Node}
//  * */
// anychart.graphModule.elements.Node.prototype.node = function(nodeId) {
//   return /** @type {anychart.graphModule.elements.Node} */(this.chart_.getElementInstance(anychart.graphModule.Chart.Element.NODE, nodeId));
// };
//
//
// /**
//  * @return {Array.<anychart.graphModule.elements.Node>}
//  * */
// anychart.graphModule.elements.Node.prototype.getAllNodes = function() {
//   var nodes = [];
//   for (var node in this.chart_.nodes_) {
//     nodes.push(this.node(node));
//   }
//   return nodes;
// };
//
//
// /**
//  * @return {Array.<anychart.graphModule.elements.Node>}
//  * */
// anychart.graphModule.elements.Node.prototype.getNodeIds = function() {
//   var ids = [];
//   for (var node in this.chart_.nodes_) {
//     ids.push(node);
//   }
//   return ids;
// };
//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Node.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
