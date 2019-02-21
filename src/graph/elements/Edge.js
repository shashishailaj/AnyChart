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

  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, 0]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);
  this.hovered_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.SELECT);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
};
goog.inherits(anychart.graphModule.elements.Edge, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Edge, ['stroke', 'labels'], 'normal');


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Edge}
 */
anychart.graphModule.elements.Edge.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Edge}
 */
anychart.graphModule.elements.Edge.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Edge}
 */
anychart.graphModule.elements.Edge.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


/**
 * SetupElements
 * */
anychart.graphModule.elements.Edge.prototype.setupElements = function() {
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
 * Applies style to labels.
 * @param {boolean=} opt_needsToDropOldBounds - Whether to drop old bounds and reset complexity.
 */
anychart.graphModule.elements.Edge.prototype.applyLabelsStyle = function(opt_needsToDropOldBounds) {
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
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.elements.Edge.prototype.resolveLabelSettingsForNode = function(edge) {
  var state = 0,//node.currentState,
    id = edge.id,
    mainLabelSettings,
    specificLabelSetting;

  if (state == 0) {
    if (!this.labelsSettings_.normal[id])
      this.labelsSettings_.normal[id] = this.normal_.labels();

    mainLabelSettings = this.labelsSettings_.normal[id];
    if (edge.states.normal && edge.states.normal.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(edge.states.normal.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  } else if (state == 1) {
    if (!this.labelsSettings_.hovered[id])
      this.labelsSettings_.hovered[id] = this.hovered_.labels();

    mainLabelSettings = this.labelsSettings_.hovered[id];
    if (edge.states.hovered && edge.states.hovered.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(edge.states.hovered.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.hovered[id] = mainLabelSettings;
  } else if (state == 2) {
    if (!this.labelsSettings_.selected[id])
      this.labelsSettings_.selected[id] = this.normal_.labels();

    mainLabelSettings = this.labelsSettings_.selected[id];
    if (edge.states.selected && edge.states.selected.labels) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings();
      specificLabelSetting.dropThemes();
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(edge.states.normal.labels);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  }

  return mainLabelSettings;
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
  proto['labels'] = proto.labels;
})();
