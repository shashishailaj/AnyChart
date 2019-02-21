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

  /**
   *
   * */
  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};

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
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);

  var normalLabels = this.normal_.labels();

  normalLabels.parent(this.chart_.labels());
  this.hovered_.labels().parent(normalLabels);
  this.selected_.labels().parent(normalLabels);
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


// anychart.graphModule.elements.Edge.prototype.resolveSettingsForEdge = function(edge){
//
// };


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.resolveLabelSettingsForNode = function(node) {
  var state = node.currentState,
      mainLabelSettings,
      specificLabelSetting,
      id = node.nodeId;

  if (state == 0) {
    if (!this.labelsSettings_.normal[id])
      this.labelsSettings_.normal[id] = this.normal_.labels();

    mainLabelSettings = this.labelsSettings_.normal[id];
    if (node.states.normal && node.states.normal.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(node.states.normal.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  } else if (state == 1) {
    if (!this.labelsSettings_.hovered[id])
      this.labelsSettings_.hovered[id] = this.hovered_.labels();

    mainLabelSettings = this.labelsSettings_.hovered[id];
    if (node.states.hovered && node.states.hovered.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(node.states.hovered.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.hovered[id] = mainLabelSettings;
  } else if (state == 2) {
    if (!this.labelsSettings_.selected[id])
      this.labelsSettings_.selected[id] = this.normal_.labels();

    mainLabelSettings = this.labelsSettings_.selected[id];
    if (node.states.selected && node.states.selected.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(node.states.normal.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  }

  return mainLabelSettings;
};


/**
 * Calculates middle position for label
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Edge.prototype.updateEdgesConntectedToNode = function(node) {
  var connectedEdges = node.connectedEdges;
  var edges = this.chart_.getEdgesMap();

  for (var i = 0, length = connectedEdges.length; i < length; i++) {
    var edge = edges[connectedEdges[i]];
    this.chart_.edges().calculateLabelPositionForEdge(edges[edge]);
    this.chart_.rootLayer.circle(edge.labelsSettings.position.x, edge.labelsSettings.position.y);
  }
};


/**
 * Fills text with style and text value.
 * @param {anychart.graphModule.Chart.Node} node
 * @private
 */
anychart.graphModule.elements.Node.prototype.setupText_ = function(node) {
  /**
   * @type {anychart.core.ui.LabelsSettings}
   * */
  var labels = this.resolveLabelSettingsForNode(node);
  text = node.textElement;
  var provider = this.createFormatProvider(node);
  var textVal = labels.getText(provider);
  text.text(textVal);

  text.style(labels.flatten());
  text.prepareComplexity();
  text.applySettings();
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

  var nodeHeight = this.chart_.resolveSettingsForNode(node, 'size', node.currentState) / 2;
  var textHeight = node.textElement.getBounds().height
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
    this.updateNodeLabelPosition(node);
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateNodeLabelPosition = function(node) {
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
  if (goog.isDef(node.value)) {
    values['text'] = {value: node.value, type: anychart.enums.TokenType.STRING};
  }
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
 * @param {anychart.SettingsState} state New state for node
 * @return {anychart.enums.MarkerType}
 * */
anychart.graphModule.elements.Node.prototype.getShapeType = function(node, state) {
  state = anychart.utils.pointStateToName(state);

  var dataOption = this.chart_.getDataOption('nodes', node.dataRow, 'shape');
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
