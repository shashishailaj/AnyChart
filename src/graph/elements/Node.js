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

  this.type_ = anychart.graphModule.Chart.Element.NODE;

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
   * @private
   * */
  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};

  anychart.measuriator.register(this);
};
goog.inherits(anychart.graphModule.elements.Node, anychart.graphModule.elements.Base);


anychart.graphModule.elements.Node.prototype.SUPPORTED_SIGNALS = anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE |
  anychart.Signal.NEEDS_REDRAW;


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
  var texts = [];

  var nodes = this.chart_.getNodesMap();
  for (var node in nodes) {
    var nodeObj = this.chart_.getNodeById(node);
    if (nodeObj.textElement) {
      texts.push(nodeObj.textElement);
    }
  }

  return texts;
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

anychart.graphModule.elements.Node.prototype.updateLabelsStyle = function() {
  var nodes = this.chart_.getNodesMap();

  for (var node in nodes) {
    var nodeObj = this.chart_.getNodeById(node);
    this.updateLabelStyle(nodeObj);
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateLabelStyle = function(node) {
  var enabled = this.resolveLabelSettings(node).enabled();
  if (enabled && !node.textElement) {
    node.textElement = this.getText();
  }
  if (node.textElement) {
    node.textElement.resetComplexity();
    this.setupText_(node);
    node.textElement.renderTo(this.labelsLayerEl_);
    node.textElement.prepareBounds();
    this.drawLabel(node);
    node.textElement.resetComplexity();
  }
};


/**
 * Fills text with style and text value.
 * @param {anychart.graphModule.Chart.Node} node
 * @private
 */
anychart.graphModule.elements.Node.prototype.setupText_ = function(node) {
  var labels = this.resolveLabelSettings(node);
  var provider = this.createFormatProvider(node);
  var textVal = labels.getText(provider);

  text = node.textElement;
  if (text) {
    text.text(textVal);
    text.style(labels.flatten());
    text.prepareComplexity();
    text.applySettings();
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.applyLabelStyle = function(node) {
  this.setupText_(node);
};


/**
 * Applies style to labels.
 */
anychart.graphModule.elements.Node.prototype.applyLabelsStyle = function() {
  var nodes = this.chart_.getNodesMap();
  for (var node in nodes) {
    var nodeObj = this.chart_.getNodeById(node);
    this.applyLabelStyle(nodeObj);
  }
};


//todo rename
/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.getLabelPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;

  var nodeHeight = this.resolveSettings(node, 'height') / 2;
  var textHeight = node.textElement.getBounds().height;
  y = y + nodeHeight;

  return {x: x, y: y};
};


/**
 * @param {anychart.graphModule.Chart.Node} from
 * @param {anychart.graphModule.Chart.Node} to
 * */
anychart.graphModule.elements.Node.prototype.getAngle = function(from, to) {

};


// /**
//  * */
// anychart.graphModule.elements.Node.prototype.updateNodeLabelsPosition = function() {
//   var nodes = this.chart_.getNodesMap();
//
//   for (var node in nodes) {
//     node = nodes[node];
//     this.updateLabelPosition(node);
//   }
// };
//
//
// /**
//  * @param {anychart.graphModule.Chart.Node} node
//  * */
// anychart.graphModule.elements.Node.prototype.updateLabelPosition = function(node) {
//   var domElement = node.textElement.getDomElement();
//   this.getLabelPosition(node);
//   var position = node.labelsSettings.position.x + ',' + node.labelsSettings.position.y;
//   // domElement.setAttribute('transform', 'translate(' + position + ')');
// };


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.drawLabel = function(node) {
  var textElement = node.textElement;
  if (textElement) {
    var labelSettings = this.resolveLabelSettings(node);
    if (labelSettings.enabled()) {
      var position = this.getLabelPosition(node);
      var cellBounds = anychart.math.rect(position.x, position.y, 50, 30);
      textElement.renderTo(this.labelsLayerEl_);
      textElement.putAt(cellBounds);
      textElement.finalizeComplexity();
    } else {
      textElement.renderTo(null);
    }
  }
};


/**
 *
 * */
anychart.graphModule.elements.Node.prototype.drawLabels = function() {
  var layer = this.getLabelsLayer();
  var nodes = this.chart_.getNodesMap();

  for (var node in nodes) {
    node = this.chart_.getNodeById(node);
    this.drawLabel(node);
  }
};


anychart.graphModule.elements.Node.prototype.resetComplexityForTexts = function() {
  for (var node in this.chart_.getNodesMap()) {
    node = this.chart_.getNodeById(node);
    if (node.textElement) {
      node.textElement.resetComplexity();
    }
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
 * @return {anychart.enums.MarkerType}
 * */
anychart.graphModule.elements.Node.prototype.getShapeType = function(node) {
  state = node.currentState;

  var type = this.resolveSettings(node, 'type');
  if (type == anychart.enums.normalizeMarkerType(type)) {
    return type;
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
anychart.graphModule.elements.Node.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    // this.applyLabelsStyle();
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    // this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
  }
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * @param {number} state
 * */
anychart.graphModule.elements.Node.prototype.nodeState = function(node, state) {
  if (goog.isDefAndNotNull(state)) {
    node.currentState = state;
    return node;
  }
  return node.currentState
};


anychart.graphModule.elements.Node.prototype.updateAppearance = function(node) {
  this.updatePathShape(node);
  this.updateNodeColors(node);
};


//Todo custom shape
/**
 * @param {anychart.graphModule.Chart.Node} node
 * @return {function(!acgraph.vector.Path, number, number, number, number=):!acgraph.vector.Path} Marker drawer.
 * */
anychart.graphModule.elements.Node.prototype.getShape = function(node) {
  var type = this.resolveSettings(node, 'shape');
  if (type == anychart.enums.normalizeMarkerType(type)) {
    return anychart.utils.getMarkerDrawer(type);
  } else {
    return (
      /**
       * @param {!acgraph.vector.Path} path
       * @param {number} x
       * @param {number} y
       * @param {number} width
       * @param {number} height
       * @return {!acgraph.vector.Path}
       */
      (function(path, x, y, width, height) {
        var left = x - width;
        var top = y - height;
        var right = x + width;
        var bottom = y + height;

        path
          .moveTo(left, top)
          .lineTo(right, top)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top)
          .close();

        return path;
      }))
  }
};


/**
 * Update path data for new state.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updatePathShape = function(node) {

  var width = this.resolveSettings(node, 'width');
  var height = this.resolveSettings(node, 'height');
  var x = node.position.x;
  var y = node.position.y;
  var path = node.domElement;

  path.clear();
  if (path.domElement()) {
    path.domElement().removeAttribute('transform');
  }

  width /= 2;
  height /= 2;
  var drawer = this.getShape(node);
  drawer(path, x, y, width, height);
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateNodeColors = function(node) {
  var fill = this.resolveSettings(node, 'fill');//enum here
  var stroke = this.resolveSettings(node, 'stroke');//enum here

  node.domElement.fill(fill);
  node.domElement.stroke(stroke);
};


/**
 * Create dom element for node and return it.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {acgraph.vector.Path}
 * */
anychart.graphModule.elements.Node.prototype.createDOM = function(node) {
  var domElement = this.getPath();

  domElement.tag = /**@type {anychart.graphModule.Chart.Tag}*/({});
  domElement.tag.type = this.getType();
  domElement.tag.id = node.nodeId;
  node.currentState = anychart.SettingsState.NORMAL;
  var lbs = this.resolveLabelSettings(node);
  if (lbs.enabled()) {
    node.textElement = this.getText();
  }
  node.domElement = domElement;
  return domElement;
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
