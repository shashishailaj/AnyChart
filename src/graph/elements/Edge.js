goog.provide('anychart.graphModule.elements.Edge');

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
anychart.graphModule.elements.Edge = function(chart) {
  anychart.graphModule.elements.Edge.base(this, 'constructor', chart);

  /**
   * @type {anychart.graphModule.Chart}
   * @private
   * */
  this.chart_ = chart;

  this.type = anychart.graphModule.Chart.Element.EDGE;

  /**
   * Array of visible text elements.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   * */
  this.texts_ = [];

  /**
   * Context provider.
   * @type {anychart.format.Context}
   * @private
   */
  this.formatProvider_ = null;
  anychart.measuriator.register(this);
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.graphModule.elements.Base);


/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Edge.prototype.SUPPORTED_SIGNALS = anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS;


/**
 * Getter for tooltip settings.
 * @param {(Object|boolean|null)=} opt_value - Tooltip settings.
 * @return {!(anychart.graphModule.elements.Edge|anychart.core.ui.Tooltip)} - Tooltip instance or self for method chaining.
 */
anychart.graphModule.elements.Edge.prototype.tooltip = function(opt_value) {
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
 * Create dom element for node and return it.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {acgraph.vector.Path}
 * */
anychart.graphModule.elements.Edge.prototype.createDOM = function(edge) {
  var domElement = this.getPath();

  domElement.tag = /**@type {anychart.graphModule.Chart.Tag}*/({});
  domElement.tag.type = this.getType();
  domElement.tag.id = this.getElementId(edge);
  domElement.tag.currentState = anychart.SettingsState.NORMAL;
  edge.currentState = anychart.SettingsState.NORMAL;
  edge.domElement = domElement;
  var lbs = this.resolveLabelSettings(edge);
  if (lbs.enabled()) {
    edge.textElement = this.getText();
  }
  return domElement;
};


/**
 * @inheritDoc
 */
anychart.graphModule.elements.Edge.prototype.provideMeasurements = function() {
  var texts = [];

  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
    var edgeObj = this.chart_.getEdgeById(edge);
    if (edgeObj.textElement) {
      texts.push(edgeObj.textElement);
    }
  }

  return texts;
};


/**
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Edge.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {

  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
    edge = this.chart_.getEdgeById(edge);
    this.setupText_(edge);
  }
};


/**
 * Format provider for node.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {anychart.format.Context}
 * */
anychart.graphModule.elements.Edge.prototype.createFormatProvider = function(edge) {
  if (!this.formatProvider_) {
    this.formatProvider_ = new anychart.format.Context();
  }
  var values = {};

  var iterator = this.getIterator();
  iterator.select(edge.dataRow);
  this.formatProvider_.dataSource(iterator);
  values['id'] = {value: edge.id, type: anychart.enums.TokenType.STRING};
  values['to'] = {value: edge.to, type: anychart.enums.TokenType.STRING};
  values['type'] = {value: anychart.graphModule.Chart.Element.EDGE, type: anychart.enums.TokenType.STRING};
  values['from'] = {value: edge.from, type: anychart.enums.TokenType.STRING};
  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.updateColors = function(edge) {
  var stroke = this.getStroke(edge);

  edge.domElement.stroke(stroke);
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.SettingsState} state
 * @return {anychart.graphModule.Chart.Edge|anychart.SettingsState}
 * */
anychart.graphModule.elements.Edge.prototype.state = function(edge, state) {
  if (goog.isDefAndNotNull(state)) {
    edge.currentState = state;
    return edge;
  }
  return edge.currentState;
};


/**
 * Update colors
 * @param {anychart.graphModule.Chart.Edge} edge Edge for update.
 * */
anychart.graphModule.elements.Edge.prototype.updateAppearance = function(edge) {
  this.updateColors(edge);
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.updateLabelStyle = function(edge) {
  var enabled = this.resolveLabelSettings(edge).enabled();
  if (enabled && !edge.textElement) {
    edge.textElement = this.getText();
  }

  if (edge.textElement) {
    edge.textElement.resetComplexity();
    this.setupText_(edge);
    edge.textElement.renderTo(this.labelsLayerEl_);
    edge.textElement.prepareBounds();
    this.drawLabel(edge);
    edge.textElement.resetComplexity();
  }
};


/**
 * Update labels style of all edges
 * */
anychart.graphModule.elements.Edge.prototype.updateLabelsStyle = function() {
  var edges = this.chart_.getEdgesMap();

  for (var edge in edges) {
    var edgeObj = this.chart_.getEdgeById(edge);
    this.updateLabelStyle(edgeObj);
  }
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.rotateLabel = function(edge) {
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);
  var angle = 0;
  var fromX, toX, fromY, toY;
  toX = to.position.x;
  toY = to.position.y;
  fromX = from.position.x;
  fromY = from.position.y;

  if (fromX == toY && fromY != toY) {
    angle = 270;
  } else {
    var dx = toX - fromX;
    var dy = toY - fromY;

    angle = goog.math.toDegrees(Math.atan(dy / dx));
  }


  var position = this.getLabelPosition(edge);
  var rotate = angle + ',' + position.x + ',' + position.y;
  var domElement = edge.textElement.getDomElement();

  domElement.setAttribute('transform', 'rotate(' + rotate + ')');
};


/**
 * Reset complexity for all drawn nodes.
 * */
anychart.graphModule.elements.Edge.prototype.resetComplexityForTexts = function() {
  var edges = this.chart_.getEdgesArray();
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    if (edge.textElement) {
      edge.textElement.resetComplexity();
    }
  }
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {string} setting
 * @return {*}
 * */
anychart.graphModule.elements.Edge.prototype.resolveSettings = function(edge, setting) {
  var stringState = anychart.utils.pointStateToName(edge.currentState);
  var defaultSetting = this.chart_.edges()[stringState]()[setting]();//
  // var defaultGroupSetting = this.chart_.groups()[stringState]()[setting]();
  var specificSetting,
    settingForSpecificGroup;

  var iterator = this.getIterator();
  iterator.select(edge.dataRow);

  var value = iterator.get(setting);
  if (value) {
    specificSetting = value;
  }

  value = iterator.get(stringState);
  if (value && value[setting]) {
    specificSetting = value[setting];
  }

  // if (this.hasInstance(anychart.graphModule.Chart.Element.GROUP, node.groupId)) {
  //   ingForSpecificGroup = this.getElementInstance(anychart.graphModule.Chart.Element.GROUP, node.group)[state]()[setting]();
  // }
  var result = defaultSetting;
  // result = goog.isDef(defaultGroupSetting) ? defaultGroupSetting : result;
  // result = goog.isDef(settingForSpecificGroup) ? settingForSpecificGroup : result;
  result = goog.isDef(specificSetting) ? specificSetting : result;
  return result;
};


/**
 * Update stroke for edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.updateEdgeColor = function(edge) {
  var stroke = this.getStroke(edge);
  edge.domElement.stroke(stroke);

};


/**
 * Calculates middle position for label
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {{x: number, y:number}}
 * */
anychart.graphModule.elements.Edge.prototype.getLabelPosition = function(edge) {
  var nodes = this.chart_.getNodesMap();
  var from = nodes[edge.from];
  var to = nodes[edge.to];


  var maxX = Math.max(to.position.x, from.position.x); //Most right x
  var minX = Math.min(to.position.x, from.position.x);
  var maxY = Math.max(to.position.y, from.position.y); //Most top y
  var minY = Math.min(to.position.y, from.position.y);

  var x, y;
  if (maxX == minX) {
    x = maxX;
    y = minY + ((maxY - minY) / 2);
  } else {
    x = minX + ((maxX - minX) / 2);
    y = ((x - minX) / (maxX - minX)) * (maxY - minY) + minY;
  }

  return {x: x, y: y};
};


/**
 * Returns id of element.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {string} id of element.
 */
anychart.graphModule.elements.Edge.prototype.getElementId = function(edge) {
  return edge.id;
};


/**
 * Returns state of element.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @return {number} id of element.
 */
anychart.graphModule.elements.Edge.prototype.getLength = function(edge) {
  var from = this.chart_.getNodeById(edge.from);
  var to = this.chart_.getNodeById(edge.to);
  return Math.sqrt(Math.pow(to.position.x - from.position.x, 2) + Math.pow(to.position.y - from.position.y, 2));
};


/**
 * Fills text with style and text value.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @private
 */
anychart.graphModule.elements.Edge.prototype.setupText_ = function(edge) {
  var labels = this.resolveLabelSettings(edge);

  labels.resetFlatSettings();
  var provider = this.createFormatProvider(edge);
  var textVal = labels.getText(provider);

  var text = edge.textElement;
  if (text) {
    text.text(textVal);
    text.style(labels.flatten());
    text.prepareComplexity();
    text.applySettings();
  }
};


/**
 * Getter for labels layer.
 * @return {acgraph.vector.UnmanagedLayer}
 */

anychart.graphModule.elements.Edge.prototype.getLabelsLayer = function() {
  if (!this.labelsLayer_) {
    this.labelsLayerEl_ = acgraph.getRenderer().createLayerElement();
    this.labelsLayer_ = acgraph.unmanagedLayer(this.labelsLayerEl_);
  }
  return this.labelsLayer_;
};


/**
 * @return {!anychart.data.Iterator} iterator
 * */
anychart.graphModule.elements.Edge.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.chart_.data()['edges'].getIterator());
};


/**
 * Draw label for edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.drawLabel = function(edge) {
  var labelSettings = this.resolveLabelSettings(edge);
  if (labelSettings.enabled() && !edge.textElement) {
    edge.textElement = this.getText();
  }
  var textElement = edge.textElement;
  if (textElement) {
    if (labelSettings.enabled()) {
      var position = this.getLabelPosition(edge);
      var padding = labelSettings.padding();
      var stroke = this.getStroke(edge);
      var edgeThickness = anychart.utils.extractThickness(stroke);

      var top, right, bottom, left, x, y, width, height;

      width = this.getLength(edge);
      height = 10;
      left = /**@type {number}*/(padding.getOption('left'));
      right = /**@type {number}*/(padding.getOption('right'));
      top = /**@type {number}*/(padding.getOption('top'));
      bottom = /**@type {number}*/(padding.getOption('bottom'));

      width = left + width + right;
      height = top + height + bottom + edgeThickness;
      y = position.y + top - bottom + edgeThickness;
      x = position.x + left - right;

      var cellBounds = anychart.math.rect(x, y, width, height);
      textElement.renderTo(this.labelsLayerEl_);
      textElement.putAt(cellBounds);
      textElement.finalizeComplexity();
      this.rotateLabel(edge);
    } else {
      textElement.renderTo(null);
    }
  }
};


/**
 * Draw all enabled labels for edge.
 * */
anychart.graphModule.elements.Edge.prototype.drawLabels = function() {
  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
    edge = this.chart_.getEdgeById(edge);
    this.drawLabel(edge);
  }
  this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
};


/**
 * Labels signal listener.
 * Proxy signal to chart.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 * */
anychart.graphModule.elements.Edge.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    event.signals |= anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS;
  }
  this.dispatchSignal(event.signals);
};


/** @inheritDoc */
anychart.graphModule.elements.Edge.prototype.disposeInternal = function() {
  var edges = this.chart_.getEdgesArray();

  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    this.clear(edge);
  }
  //Dispose all elements in pools and dispose all label settings.
  anychart.graphModule.elements.Edge.base(this, 'disposeInternal');
};

(function() {
  var proto = anychart.graphModule.elements.Edge.prototype;

})();
