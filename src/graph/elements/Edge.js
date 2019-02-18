goog.provide('anychart.graphModule.elements.Edge');

goog.require('anychart.core.Base');
goog.require('anychart.core.ui.OptimizedText');
goog.require('anychart.format.Context');
goog.require('anychart.reflow.IMeasurementsTargetProvider');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * @implements {anychart.reflow.IMeasurementsTargetProvider}
 * */
anychart.graphModule.elements.Edge = function(chart) {
  anychart.graphModule.elements.Edge.base(this, 'constructor');

  /**
   * Chart instance.
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


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW]
    //['targetShape', 0, anychart.Signal.NEEDS_REDRAW]?
  ]);
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.core.Base);


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.elements.Edge.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    anychart.core.settings.descriptors.STROKE
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Edge, anychart.graphModule.elements.Edge.OWN_DESCRIPTORS);


/**
 * @inheritDoc
 */
anychart.graphModule.elements.Edge.prototype.provideMeasurements = function() {
  if (!this.texts_.length) {
    var edges = this.chart_.getEdgesMap();
    for (var i in edges) {
      var text = new anychart.core.ui.OptimizedText();
      // text.setClassName(this.labels().cssClass);
      this.texts_.push(text);
    }
  }
  return this.texts_;
};


/**
 * @param {Object=} opt_value - Value to be set.
 * @return {(anychart.graphModule.elements.Edge|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 */
anychart.graphModule.elements.Edge.prototype.labels = function(opt_value) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labelsSettings_);

    // if (this.index_ == 0) {
    //   this.labelsSettings_.addThemes({'format': '{%linearIndex}'});
    // } else if (this.index_ == 1) {
    //   this.labelsSettings_.addThemes({'format': '{%name}'});
    // }
    // this.labelsSettings_.listenSignals(this.labelsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labelsSettings_.setup(opt_value);
    this.invalidate(/*todo*/0, anychart.Signal.NEEDS_REDRAW);
    return this;
  }

  return this.labelsSettings_;
};


/**
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Edge.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {
  // var labelsAreOverridden = this.hasLabelsOverrider();
  var i = 0;
  var edges = this.chart_.getEdgesMap();
  for (var edge in edges) {
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
    this.setupText_(text, edges[edge], false);
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
  values['id'] = {value: edge.id, type: anychart.enums.TokenType.STRING};
  values['to'] = {value: edge.to, type: anychart.enums.TokenType.STRING};
  values['from'] = {value: edge.from, type: anychart.enums.TokenType.STRING};
  if (goog.isDef(edge.text)) {
    values['text'] = {value: edge.text, type: anychart.enums.TokenType.STRING};
  }
  return /** @type {anychart.format.Context} */(this.formatProvider_.propagate(values));
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

  var x = minX + ((maxX - minX) / 2);
  var y = ((x - minX) / (maxX - minX)) * (maxY - minY) + minY;

  edge.labelsSettings.position.x = x;
  edge.labelsSettings.position.y = y;
};


/**
 * Fills text with style and text value.
 * @param {anychart.core.ui.OptimizedText} text - Text to setup.
 * @param {anychart.graphModule.Chart.Edge=} opt_edge
 * @param {boolean=} opt_labelsAreOverridden - If labels settings are overridden.
 * @private
 */
anychart.graphModule.elements.Edge.prototype.setupText_ = function(text, opt_edge, opt_labelsAreOverridden) {
  var labels;

  if (opt_edge) {
    if (opt_labelsAreOverridden) {
      var index = /** @type {number} */ (opt_edge.meta('index'));
      labels = this.overriddenLabels_[index];
    } else {
      labels = this.labels();
    }

    var provider = this.createFormatProvider(opt_edge);
    var textVal = labels.getText(provider);
    text.text(textVal);
    opt_edge.textElement = text;
  }
  // console.log(labels.flatten());
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
 *
 * */
anychart.graphModule.elements.Edge.prototype.drawLabels = function() {
  var layer = this.getLabelsLayer();
  var edges = this.chart_.getEdgesMap();
  var i = 0;
  for (var edge in edges) {
    var textElement = this.texts_[i];
    if (this.labels()['enabled']()) {
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
  proto['labels'] = proto.labels;
})();
