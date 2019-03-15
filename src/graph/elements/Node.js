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

  this.type = anychart.graphModule.Chart.Element.NODE;

  /**
   * Layer for labels.
   * @type {Element}
   * @private
   * */
  this.labelsLayerEl_;

  /**
   * Gap for magnetize.
   * @private
   * @const
   * */
  this.magnetizeGap_ = 5;

  /**
   * @type {!anychart.data.Iterator}
   * @private
   * */
  this.iterator_;

  anychart.measuriator.register(this);
};
goog.inherits(anychart.graphModule.elements.Node, anychart.graphModule.elements.Base);


/**
 *  Supported signals.
 * */
anychart.graphModule.elements.Node.prototype.SUPPORTED_SIGNALS = anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW;


/**
 * Getter for labels layer.
 * @return {acgraph.vector.UnmanagedLayer}
 */
anychart.graphModule.elements.Node.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = /**@type {Element}*/(acgraph.getRenderer().createLayerElement());
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

  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.textElement) {
      texts.push(node.textElement);
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


// /**
//  * Calculates middle position for label
//  * @param {anychart.graphModule.Chart.Node} node
//  * */
// anychart.graphModule.elements.Node.prototype.updateEdgesConntectedToNode = function(node) {
//   var connectedEdges = node.connectedEdges;
//   var edges = this.chart_.getEdgesMap();
//
//   for (var i = 0, length = connectedEdges.length; i < length; i++) {
//     var edge = edges[connectedEdges[i]];
//     this.chart_.edges().calculateLabelPositionForEdge(edges[edge]);
//     this.chart_.rootLayer.circle(edge.labelsSettings.position.x, edge.labelsSettings.position.y);
//   }
// };


/**
 * @param {anychart.graphModule.Chart.Node} node
 * @param {string} setting
 * @return {*}
 * */
anychart.graphModule.elements.Node.prototype.resolveSettings = function(node, setting) {
  var stringState = anychart.utils.pointStateToName(node.currentState);
  var normalStingState = anychart.utils.pointStateToName(anychart.SettingsState.NORMAL);

  var finalSetting, iteratorValue;
  finalSetting = this[normalStingState]()[setting]();
  var tmpSetting = this[stringState]()[setting]();
  finalSetting = goog.isDef(tmpSetting) ? tmpSetting : finalSetting;

  var group = this.chart_.getGroupsMap()[/**@type {string}*/(node.groupId)];

  var groupSettings = group ? group[stringState]().getOption(setting) : void 0;

  finalSetting = goog.isDef(groupSettings) ? groupSettings : finalSetting;

  var iterator = this.getIterator();
  iterator.select(node.dataRow);

  iteratorValue = iterator.get(setting);
  finalSetting = goog.isDef(iteratorValue) ? iteratorValue : finalSetting;

  iteratorValue = iterator.get(stringState);
  finalSetting = iteratorValue && goog.isDef(iteratorValue[setting]) ? iteratorValue[setting] : finalSetting;
  return finalSetting;
};


/**
 * Update label style of all nodes
 * */
anychart.graphModule.elements.Node.prototype.updateLabelsStyle = function() {
  var nodes = this.chart_.getNodesArray();

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.updateLabelStyle(node);
  }
};


/**
 * Update labels style of node
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

  var text = node.textElement;
  if (text) {
    text.text(textVal);
    text.style(labels.flatten());
    text.prepareComplexity();
    text.applySettings();
  }
};


/**
 * Setup text element.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.applyLabelStyle = function(node) {
  this.setupText_(node);
};


/**
 * Applies style to labels.
 */
anychart.graphModule.elements.Node.prototype.applyLabelsStyle = function() {
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.applyLabelStyle(node);
  }
};


/**
 * Return coordinate for labels
 * @param {anychart.graphModule.Chart.Node} node
 * @return {{x:number, y:number}}
 * */
anychart.graphModule.elements.Node.prototype.getLabelPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;

  var nodeHeight = this.getHeight(node) / 2;
  // var textHeight = node.textElement.getBounds().height;
  y = y + nodeHeight;

  return {x: x, y: y};
};


/**
 * Draw label for passed node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.drawLabel = function(node) {
  var labelSettings = this.resolveLabelSettings(node);
  if (labelSettings.enabled() && !node.textElement) {
    node.textElement = this.getText();
  }
  var textElement = node.textElement;
  if (textElement) {

    if (labelSettings.enabled()) {
      var position = this.getLabelPosition(node);
      var padding = /**@type {anychart.core.utils.Padding}*/(labelSettings.padding());
      var left, right, top, bottom, width, height;

      width = 100;
      height = 50;
      left = /**@type {number}*/(padding.getOption('left'));
      right = /**@type {number}*/(padding.getOption('right'));
      top = /**@type {number}*/(padding.getOption('top'));
      bottom = /**@type {number}*/(padding.getOption('bottom'));

      width = left + width + right;
      height = top + height + bottom;
      var y = position.y + top - bottom;
      var x = position.x + left - right;
      var cellBounds = anychart.math.rect(x, y, width, height);
      textElement.renderTo(this.labelsLayerEl_);
      textElement.putAt(cellBounds);
      textElement.finalizeComplexity();
    } else {
      textElement.renderTo(null);
    }
  }
};


/**
 * Draw all enabled labels for node.
 * */
anychart.graphModule.elements.Node.prototype.drawLabels = function() {
  var nodes = this.chart_.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.drawLabel(node);
  }
  this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
};


/**
 * Reset complexity for all drawn nodes.
 * Remove all temp text was create for measure.
 * */
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
  values['type'] = {value: anychart.graphModule.Chart.Element.NODE, type: anychart.enums.TokenType.STRING};

  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};


/**
 * Stick node to sibling.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.stickNode = function(node) {
  var gap = this.magnetizeGap_;
  var node_ = this.chart_.getSubGraphsMap()[/**@type {string}*/(node.subGraphId)];
  var newX, newY;
  newX = newY = Infinity;
  var x = node.position.x;
  var y = node.position.y;

  for (var i = 0; i < node_.length; i++) {
    if (node.nodeId != node_[i]) {
      var neib = this.chart_.getNodeById(node_[i]);
      var neibPosition = neib.position;

      if (node.position.x > (neibPosition.x - gap) && node.position.x < (neibPosition.x + gap)) {
        var distanceX = node.position.x - neibPosition.x;
        if (distanceX < newX) {
          newX = distanceX;
          x = neibPosition.x;
        }
      }

      if (node.position.y > (neibPosition.y - gap) && node.position.y < (neibPosition.y + gap)) {
        var distanceY = node.position.y - neibPosition.y;
        if (distanceY < newY) {
          newY = distanceY;
          y = neibPosition.y;
        }
      }
    }
  }
  node.position.x = x;
  node.position.y = y;
};


/**
 * Return height of node
 * @param {anychart.graphModule.Chart.Node} node
 * @return {number}
 * */
anychart.graphModule.elements.Node.prototype.getHeight = function(node) {
  return /**@type {number}*/(this.resolveSettings(node, 'height'));
};


/**
 * Return width of node
 * @param {anychart.graphModule.Chart.Node} node
 * @return {number}
 * */
anychart.graphModule.elements.Node.prototype.getWidth = function(node) {
  return /**@type {number}*/(this.resolveSettings(node, 'width'));
};


/**
 * Labels signal listener.
 * Proxy signal to chart.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 * */
anychart.graphModule.elements.Node.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    event.signals |= anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS;
  }

  this.dispatchSignal(event.signals);
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState=} opt_state
 * @return {anychart.graphModule.Chart.Node|anychart.SettingsState}
 * */
anychart.graphModule.elements.Node.prototype.state = function(node, opt_state) {
  if (goog.isDefAndNotNull(opt_state)) {
    node.currentState = opt_state;
    return node;
  }
  return node.currentState;
};


/**
 * Update shape and colors for node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateAppearance = function(node) {
  this.updatePathShape(node);
  this.updateNodeColors(node);
};


/**
 * Return drawer for current shape type.
 * @param {anychart.graphModule.Chart.Node} node
 * @return {function(!acgraph.vector.Path, number, number, number, number):!acgraph.vector.Path} Marker drawer.
 * */
anychart.graphModule.elements.Node.prototype.getShapeDrawer = function(node) {
  var type = this.resolveSettings(node, 'shape');
  if (type == anychart.enums.normalizeMarkerType(type)) {
    return anychart.utils.getMarkerDrawer(type);
  } else {
    return (
        /**
         * @param {!acgraph.vector.Path} path
         * @param {number} x
         * @param {number} y
         * @param {number} height
         * @param {number} width
         * @return {!acgraph.vector.Path}
         */
        (function(path, x, y, height, width) {
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
        }));
  }
};


/**
 * Update path data for new state.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updatePathShape = function(node) {
  var width = this.getWidth(node);
  var height = this.getHeight(node);

  var x = node.position.x;
  var y = node.position.y;
  var path = node.domElement;

  path.clear();
  if (path.domElement()) {
    path.domElement().removeAttribute('transform');
  }

  width /= 2;
  height /= 2;
  var drawer = this.getShapeDrawer(node);
  drawer(path, x, y, height, width);
};


/**
 * Set new stroke and fill for node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.elements.Node.prototype.updateNodeColors = function(node) {
  var fill = this.getFill(node);
  var stroke = this.getStroke(node);

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
  domElement.tag.currentState = anychart.SettingsState.NORMAL;
  node.currentState = anychart.SettingsState.NORMAL;
  var lbs = this.resolveLabelSettings(node);
  if (lbs.enabled()) {
    node.textElement = this.getText();
  }
  node.domElement = domElement;
  return domElement;
};


/** @inheritDoc */
anychart.graphModule.elements.Node.prototype.disposeInternal = function() {
  var nodes = this.chart_.getNodesArray();

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.clear(node);
  }
  //Dispose all elements in pools and dispose all label settings.
  anychart.graphModule.elements.Node.base(this, 'disposeInternal');
};
//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Node.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
//endregion
