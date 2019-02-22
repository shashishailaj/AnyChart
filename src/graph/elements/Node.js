goog.provide('anychart.graphModule.elements.Node');

goog.require('anychart.core.Base');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.format.Context');
goog.require('anychart.graphModule.elements.Base');
goog.require('anychart.reflow.IMeasurementsTargetProvider');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * @extends {anychart.graphModule.elements.Base}
 * */
anychart.graphModule.elements.Node = function(chart) {
  anychart.graphModule.elements.Node.base(this, 'constructor', chart);

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

  /**
   * @type {!anychart.data.Iterator}
   * @private
   * */
  this.iterator_;

  /**
   *
   * */
  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};

};
goog.inherits(anychart.graphModule.elements.Node, anychart.graphModule.elements.Base);


anychart.graphModule.elements.Node.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW_APPEARANCE;
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
 * @return {!anychart.data.Iterator} iterator
 * */
anychart.graphModule.elements.Node.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.chart_.data()['nodes'].getIterator());
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
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.graphModule.elements.Node|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.graphModule.elements.Node.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.core.ui.Tooltip(0);
    this.tooltip_.dropThemes();
    this.setupCreated('tooltip', this.tooltip_);
    this.tooltip_.parent(/** @type {anychart.core.ui.Tooltip} */ (this.chart_.tooltip()));
    this.tooltip_.chart(this.chart_);
  }
  if (goog.isDef(opt_value)) {
    this.tooltip_.setup(opt_value);
    return this;
  } else {
    return this.tooltip_;
  }
};

/**
 * Returns id of element.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {string} id of element.
 */
anychart.graphModule.elements.Node.prototype.getElementId = function(node) {
  return node.nodeId;
};


/**
 * Returns state of element.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {anychart.SettingsState} id of element.
 */
anychart.graphModule.elements.Node.prototype.getElementState = function(node) {
  return node.currentState;
};

/**
 * Calculates middle position for label
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateEdgesConntectedToNode = function(node) {
  var connectedEdges = node.connectedEdges;
  var edges = this.chart_.getEdgesMap();

  for (var i = 0, length = connectedEdges.length; i < length; i++) {
    var edge = edges[connectedEdges[i]];
    this.chart_.edges().calculateLabelPositionForEdge(edges[edge]);
    this.chart_.rootLayer.circle(edge.labelsSettings.position.x, edge.labelsSettings.position.y);
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * @param {string} setting
 * @return {*}
 * */
anychart.graphModule.elements.Node.prototype.resolveSettings = function(node, setting) {
  var stringState = anychart.utils.pointStateToName(node.currentState);

  var defaultNodeSetting = this.chart_.nodes()[stringState]()[setting]();//
  // var defaultGroupSetting = this.chart_.groups()[stringState]()[setting]();
  var settingForSpecificNode,
    settingForSpecificGroup;

  var iterator = this.getIterator();
  iterator.select(node.dataRow);

  var value = iterator.get(setting);
  if (value) {
    settingForSpecificNode = value;
  }

  value = iterator.get(stringState);
  if (value && value[setting]) {
    settingForSpecificNode = value[setting];
  }

  // if (this.hasInstance(anychart.graphModule.Chart.Element.GROUP, node.groupId)) {
  //   ingForSpecificGroup = this.getElementInstance(anychart.graphModule.Chart.Element.GROUP, node.group)[state]()[setting]();
  // }
  var result = defaultNodeSetting;
  // result = goog.isDef(defaultGroupSetting) ? defaultGroupSetting : result;
  // result = goog.isDef(settingForSpecificGroup) ? settingForSpecificGroup : result;
  result = goog.isDef(settingForSpecificNode) ? settingForSpecificNode : result;
  return result;
};


anychart.graphModule.elements.Node.prototype.updateLabelStyle = function(node) {
  var enabled = this.setupText_(node);
  if (enabled) {
    node.textElement.renderTo(this.labelsLayerEl_);
  } else {
    node.textElement.renderTo(null);
  }
};


/**
 * Fills text with style and text value.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {boolean}
 * @private
 */
anychart.graphModule.elements.Node.prototype.setupText_ = function(node) {
  var labels = this.resolveLabelSettingsForNode(node);
  text = node.textElement;
  var provider = this.createFormatProvider(node);
  var textVal = labels.getText(provider);
  text.text(textVal);

  text.style(labels.flatten());
  text.prepareComplexity();
  text.applySettings();
  return labels.enabled();
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.applyLabelStyle = function(node) {
  this.setupText_(node);
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
    node = nodes[node];
    var text = this.texts_[i];
    node.textElement = text;
    this.applyLabelStyle(node);
    i++;
  }
};


//todo rename
/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.getLabelPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;

  var nodeHeight = this.resolveSettings(node, 'size') / 2;
  var textHeight = node.textElement.getBounds().height;
  node.labelsSettings.position.x = x;
  node.labelsSettings.position.y = y + nodeHeight + textHeight / 2;

  return node.labelsSettings.position;
};


/**
 * */
anychart.graphModule.elements.Node.prototype.setInitialLabelsPosition = function() {
  var nodes = this.chart_.getNodesMap();
  for (var node in nodes) {
    node = nodes[node];
    this.getLabelPosition(node);
  }
};


/**
 * */
anychart.graphModule.elements.Node.prototype.updateNodeLabelsPosition = function() {
  var nodes = this.chart_.getNodesMap();

  for (var node in nodes) {
    node = nodes[node];
    this.updateLabelPosition(node);
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateLabelPosition = function(node) {
  var domElement = node.textElement.getDomElement();
  this.getLabelPosition(node);
  var position = node.labelsSettings.position.x + ',' + node.labelsSettings.position.y;
  domElement.setAttribute('transform', 'translate(' + position + ')');
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.drawLabel = function(node) {
  var textElement = node.textElement;
  var labelSettings = this.resolveLabelSettingsForNode(node);
  if (labelSettings.enabled()) {
    var cellBounds = anychart.math.rect(node.labelsSettings.position.x, node.labelsSettings.position.y, 0, 0);
    textElement.renderTo(this.labelsLayerEl_);
    textElement.putAt(cellBounds);
    textElement.finalizeComplexity();
  } else {
    textElement.renderTo(null);
  }
};


/**
 *
 * */
anychart.graphModule.elements.Node.prototype.drawLabels = function() {
  var layer = this.getLabelsLayer();
  var nodes = this.chart_.getNodesMap();

  for (var node in nodes) {
    node = nodes[node];
    this.drawLabel(node);
  }
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

  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};

/**
 * Stick node to sibling
 * */
anychart.graphModule.elements.Node.prototype.stickNode = function(node) {
  var closestX = -Infinity, //todo
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
 * Get fill for node.
 * */
anychart.graphModule.elements.Node.prototype.getFill = function() {

};


/**
 * Returns type for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.PointState} state New state for node
 * @return {anychart.enums.MarkerType}
 * */
anychart.graphModule.elements.Node.prototype.getShapeType = function(node, state) {
  state = anychart.utils.pointStateToName(state);

  var dataOption = this.resolveSettings(node, 'type');
  if (dataOption) {
    return anychart.enums.normalizeMarkerType(dataOption);
  } else {
    return this[state]().getOption('type');
  }
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
