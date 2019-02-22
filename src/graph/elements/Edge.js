goog.provide('anychart.graphModule.elements.Edge');

goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.core.ui.Tooltip');
goog.require('anychart.format.Context');
goog.require('anychart.graphModule.elements.Base');
goog.require('anychart.reflow.IMeasurementsTargetProvider');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.graphModule.elements.Base}
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * */
anychart.graphModule.elements.Edge = function(chart) {
  anychart.graphModule.elements.Edge.base(this, 'constructor', chart);

  /**
   * @type {anychart.graphModule.Chart}
   * @private
   * */
  this.chart_ = chart;

  /**
   * Array of text elements.
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

  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.graphModule.elements.Base);


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
 * @inheritDoc
 */
anychart.graphModule.elements.Edge.prototype.provideMeasurements = function() {
  if (!this.texts_.length) {
    var edges = this.chart_.getEdgesMap();
    for (var edge in edges) {
      var text = new anychart.core.ui.OptimizedText();
      // text.setClassName(this.labels().cssClass);
      this.texts_.push(text);
    }
  }
  return this.texts_;
};


/**
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Edge.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {
  var i = 0;
  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
    var text = this.texts_[i];
    i++;
    this.setupText_(text, edges[edge]);
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
  values['from'] = {value: edge.from, type: anychart.enums.TokenType.STRING};
  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
};


/**
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.updateLabelPosition = function(edge) {
  var domElement = edge.textElement.getDomElement();
  this.calculateLabelPositionForEdge(edge);
  var position = edge.labelsSettings.position.x + ',' + edge.labelsSettings.position.y;
  domElement.setAttribute('transform', 'translate(' + position + ')');
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
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.updateEdgeColor = function(edge) {
  edge.domElement.stroke(this.resolveSettings(edge, 'stroke'));

};


/**
 * Calculates middle position for label
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.calculateLabelPositionForEdge = function(edge) {
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
    y = (maxY - minY) / 2;
  } else {
    x = minX + ((maxX - minX) / 2);
    y = ((x - minX) / (maxX - minX)) * (maxY - minY) + minY;
  }

  edge.labelsSettings.position.x = x;
  edge.labelsSettings.position.y = y;
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
 * @param {anychart.graphModule.Chart.Node} edge
 * @return {anychart.SettingsState} id of element.
 */
anychart.graphModule.elements.Edge.prototype.getElementState = function(edge) {
  return edge.currentState;
};


/**
 * Fills text with style and text value.
 * @param {anychart.core.ui.OptimizedText} text - Text to setup.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @private
 */
anychart.graphModule.elements.Edge.prototype.setupText_ = function(text, edge) {
  var labels = this.resolveLabelSettingsForNode(edge);

  var provider = this.createFormatProvider(edge);
  var textVal = labels.getText(provider);
  text.text(textVal);
  edge.textElement = text;
  text.style(labels.flatten());
  text.prepareComplexity();
  text.applySettings();
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
 *
 * */
anychart.graphModule.elements.Edge.prototype.drawLabels = function() {
  var layer = this.getLabelsLayer();
  var edges = this.chart_.getEdgesMap();
  var i = 0;
  for (var edge in edges) {
    var textElement = this.texts_[i];

    var labelSettings = this.resolveLabelSettingsForNode(edges[edge]);
    if (labelSettings.enabled()) {
      // var r = new anychart.math.Rect(this.pixelBoundsCache_.left, totalTop, this.pixelBoundsCache_.width, height);
      var cellBounds = anychart.math.rect(edges[edge].labelsSettings.position.x, edges[edge].labelsSettings.position.y, 0, 0);

      textElement.renderTo(this.labelsLayerEl_);
      textElement.putAt(cellBounds);
      textElement.finalizeComplexity();
      // this.labelsTexts_.push(/** @type {string} */ (textElement.text()));
    } else {
      textElement.renderTo(null);
    }
    i++;
  }
  // this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
};


(function() {
  var proto = anychart.graphModule.elements.Edge.prototype;

})();
