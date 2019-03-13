goog.provide('anychart.graphModule.elements.Base');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.core.ui.OptimizedText');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Base = function(chart) {
  anychart.graphModule.elements.Base.base(this, 'constructor');

  this.chart_ = chart;

  /**
   * Type of element
   * @type {anychart.graphModule.Chart.Element}
   * */
  this.type;

  /**
   * Pool of path elements.
   * @type {Array.<acgraph.vector.Path>}
   * @private
   * */
  this.pathPool_ = [];

  /**
   * Pool of text elements.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   * */
  this.textPool_ = [];

  /**
   * @type {{
   *  normal: Object<string, anychart.core.ui.LabelsSettings>,
   *  hovered: Object<string, anychart.core.ui.LabelsSettings>,
   *  selected: Object<string, anychart.core.ui.LabelsSettings>
   *    }}
   * */
  this.settingsForLabels = {
    'normal': {},
    'hovered': {},
    'selected': {}
  };

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['shape', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['labels', 0, anychart.Signal.NEEDS_REDRAW_LABELS],
    ['width', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['height', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0],
    ['shape', 0, 0],
    ['labels', 0, 0],
    ['width', 0, 0],
    ['height', 0, 0]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
};
goog.inherits(anychart.graphModule.elements.Base, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Base, ['fill', 'stroke', 'labels', 'shape', 'height', 'width'], 'normal');


//region StateSettings
/**
 * SetupElements
 * */
anychart.graphModule.elements.Base.prototype.setupElements = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);

  var normalLabels = /**@type {anychart.core.ui.LabelsSettings}*/(this.normal_.labels());

  normalLabels.parent(/**@type {anychart.core.ui.LabelsSettings}*/(this.chart_.labels()));
  this.hovered_.labels().parent(normalLabels);
  this.selected_.labels().parent(normalLabels);

};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Hovered state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.hovered = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.hovered_.setup(opt_value);
    return this;
  }
  return this.hovered_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 */
anychart.graphModule.elements.Base.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};
//endregion


/**
 * Return stroke for element
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {acgraph.vector.Stroke}
 * */
anychart.graphModule.elements.Base.prototype.getStroke = function(element) {
  return /**@type {acgraph.vector.Stroke}*/(this.resolveSettings(element, 'stroke'));
};


/**
 * Return fill for element
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {acgraph.vector.Fill}
 * */
anychart.graphModule.elements.Base.prototype.getFill = function(element) {
  return /**@type {acgraph.vector.Fill}*/(this.resolveSettings(element, 'fill'));
};


/**
 * Return type of element.
 * @return {anychart.graphModule.Chart.Element}
 * */
anychart.graphModule.elements.Base.prototype.getType = function() {
  return this.type;
};


/**
 * Create new path or get if from pool and return it.
 * @return {acgraph.vector.Path}
 * */
anychart.graphModule.elements.Base.prototype.getPath = function() {
  var path = this.pathPool_.pop();
  if (!path) {
    path = acgraph.path();
  }
  return path;
};


/**
 * Create new text or get if from pool and return it.
 * @return {anychart.core.ui.OptimizedText}
 * */
anychart.graphModule.elements.Base.prototype.getText = function() {
  var text = this.textPool_.pop();
  if (!text) {
    text = new anychart.core.ui.OptimizedText();
  }
  return text;
};


/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS =
  anychart.Signal.NEEDS_REDRAW_APPEARANCE |
  anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
  anychart.Signal.MEASURE_BOUNDS | //Signal for Measuriator to measure the bounds of collected labels.
  anychart.Signal.NEEDS_REDRAW_LABELS| //Signal for DG to change the labels placement.
  anychart.Signal.NEEDS_REDRAW |
  anychart.Signal.BOUNDS_CHANGED |
  anychart.Signal.NEEDS_REAPPLICATION |
  anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Reset DOM of passed element and add it in pool.
 @param {anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node} element
 * */
anychart.graphModule.elements.Base.prototype.clear = function(element) {
  var domElement = element.domElement;
  if (domElement) {
    domElement.tag = null;
    domElement.clear();
    domElement.parent(null);
    this.pathPool_.push(domElement);
    element.domElement = null;
  }

  var textElement = element.textElement;
  if (textElement) {
    element.textElement = null;
    textElement.renderTo(null);
    this.textPool_.push(textElement);
  }
};


/**
 * Returns iterator.
 * @return {!anychart.data.Iterator} iterator
 */
anychart.graphModule.elements.Base.prototype.getIterator = goog.abstractMethod;


/**
 * Resolve labels settings for passed element.
 * @param {(anychart.graphModule.Chart.Node|anychart.graphModule.Chart.Edge)} element
 * @return {anychart.core.ui.LabelsSettings} instance of LabelSettings.
 * */
anychart.graphModule.elements.Base.prototype.resolveLabelSettings = function(element) {
  var state = this.state(element),
    stringState = anychart.utils.pointStateToName(state),
    id = this.getElementId(element),
    dataRow = element.dataRow,
    groupSettings = this.chart_.getGroupsMap()[/**@type {string}*/(element.groupId)],
    iteratorData;


  if (!this.settingsForLabels[stringState][id]) {
    var specificLblSettings;

    var iterator = this.getIterator();
    iterator.select(dataRow);

    iteratorData = iterator.get('labels');
    if (iteratorData) {
      var specificSettingForElement = {};
      if (iteratorData[stringState] && iteratorData[stringState]['labels']) {
        goog.mixin(specificSettingForElement, iteratorData[stringState]['labels']);
      }
      specificLblSettings = new anychart.core.ui.LabelsSettings(true);
      specificLblSettings.setup(specificSettingForElement);
    }

    var groupLabelSettings = groupSettings ? groupSettings[stringState]()['labels']() : void 0;
    var finalLblSetting = this[stringState]()['labels']();

    if (groupLabelSettings) {
      finalLblSetting = groupLabelSettings.parent(finalLblSetting);
    }
    if (specificLblSettings) {
      finalLblSetting = specificLblSettings.parent(finalLblSetting);
    }
    this.settingsForLabels[stringState][id] = finalLblSetting;
  }

  return /**@type {anychart.core.ui.LabelsSettings}*/(this.settingsForLabels[stringState][id]);
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Base.base(this, 'setupByJSON', config, opt_default);
  if ('tooltip' in config) {
    this.tooltip().setupInternal(config['tooltip'], opt_default);
  }
  this.normal_.setupInternal(config['normal'], opt_default);
  this.hovered_.setupInternal(config['hovered'], opt_default);
  this.selected_.setupInternal(config['selected'], opt_default);
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Base.base(this, 'serialize');
  if (this.tooltip)
    json['tooltip'] = this.tooltip().serialize();
  json['normal'] = this.normal_.serialize();
  json['hovered'] = this.hovered_.serialize();
  json['selected'] = this.selected_.serialize();

  return json;
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.disposeInternal = function() {
  goog.disposeAll(this.textPool_);
  goog.disposeAll(this.pathPool_);

  for (var labelSettings in this.settingsForLabels) {
    for (var setting in this.settingsForLabels[labelSettings]) {
      var lblSetting = this.settingsForLabels[labelSettings][setting];
      lblSetting.disposeInternal();
    }
  }

  this.textPool_ = [];
  this.pathPool_ = [];

  this.settingsForLabels = {
    'normal': {},
    'hovered': {},
    'selected': {}
  };

};

(function() {
  var proto = anychart.graphModule.elements.Base.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();

