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
    ['shape', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['labels', 0, anychart.Signal.NEEDS_REDRAW_LABELS],
    ['width', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['height', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);

  /**
   * Object with settings for normal state.
   * @private
   * */
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

  function labelsCallBack (labels) {
    labels.setParentEventTarget(/** @type {goog.events.EventTarget} */ (this));
  }

  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, labelsCallBack);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, labelsCallBack);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, labelsCallBack);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
};
goog.inherits(anychart.graphModule.elements.Base, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.graphModule.elements.Base, ['fill', 'stroke', 'labels', 'shape', 'height', 'width'], 'normal');


//region StateSettings
/**
 * Setup elements.
 * */
anychart.graphModule.elements.Base.prototype.setupElements = function() {
  this.normal_.addThemes(this.themeSettings);
  this.setupCreated('normal', this.normal_);
  this.setupCreated('hovered', this.hovered_);
  this.setupCreated('selected', this.selected_);
};


/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.graphModule.elements.Base}
 * */
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
 * */
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
 * */
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
  path.clear();
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
 * @param {(anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node)} element
 * @return {anychart.core.ui.OptimizedText}
 * */
anychart.graphModule.elements.Base.prototype.getTextElement = function(element) {
  if (!element.textElement) {
    element.textElement = this.getText();
  }
  return element.textElement;
};


/**
 * Supported signals.
 * @type {number}
 * */
anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS =
  anychart.Signal.NEEDS_REDRAW_APPEARANCE |
  anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
  anychart.Signal.MEASURE_BOUNDS | //Signal for Measuriator to measure the bounds of collected labels.
  anychart.Signal.NEEDS_REDRAW_LABELS | //Signal for DG to change the labels placement.
  anychart.Signal.NEEDS_REDRAW |
  anychart.Signal.BOUNDS_CHANGED |
  anychart.Signal.NEEDS_REAPPLICATION |
  anychart.Signal.ENABLED_STATE_CHANGED;


/**
 * Reset DOM of passed element and add it in pool.
 * @param {anychart.graphModule.Chart.Edge|anychart.graphModule.Chart.Node} element
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
 * */
anychart.graphModule.elements.Base.prototype.getIterator = goog.abstractMethod;


/**
 * Resolve labels settings for passed element.
 * @param {(anychart.graphModule.Chart.Node|anychart.graphModule.Chart.Edge)} element
 * @return {anychart.core.ui.LabelsSettings} instance of LabelSettings.
 * */
anychart.graphModule.elements.Base.prototype.resolveLabelSettings = function(element) {
  var state = /**@type {anychart.SettingsState}*/(this.state(element));
  var stringState = anychart.utils.pointStateToName(state);
  var id = this.getElementId(element);
  var dataRow = element.dataRow;
  var groupSettings = this.chart_.getGroupsMap()[/**@type {string}*/(element.groupId)];
  var labelSettingFromData;

  if (!this.settingsForLabels[stringState][id]) {
    var specificLblSettings;

    var iterator = this.getIterator();
    iterator.select(dataRow);

    labelSettingFromData = iterator.get('labels');
    var labelSettingForState = iterator.get(stringState);
    labelSettingForState = labelSettingForState ? labelSettingForState['labels'] ? labelSettingForState['labels'] : {} : {};
    var setting = /**@type {Object}*/(labelSettingFromData || {});
    goog.mixin(setting, labelSettingForState);
    if (!goog.object.isEmpty(setting)) {
      specificLblSettings = new anychart.core.ui.LabelsSettings(true);
      specificLblSettings.setup(setting);
    }
    //settings for nodes from groups.
    var groupLabelSettings = groupSettings ? groupSettings[stringState]()['labels']() : void 0;
    var finalLblSetting = this[stringState]()['labels']();
    if (!finalLblSetting.parent()) {
      if (state == anychart.SettingsState.NORMAL) {
        finalLblSetting.parent(this.chart_.labels());
      } else {
        finalLblSetting.parent(this.normal_.labels());
      }
    }
    if (groupLabelSettings) {
      finalLblSetting = groupLabelSettings.parent(finalLblSetting);
    }
    if (specificLblSettings) {
      finalLblSetting = specificLblSettings.parent(finalLblSetting);
    }
    finalLblSetting.resolutionChainCache(null);//reset resolution chain.
    finalLblSetting.removeAllListeners();
    finalLblSetting.listenSignals(this.labelsInvalidated_, this);

    this.settingsForLabels[stringState][id] = finalLblSetting;
  }
  this.settingsForLabels[stringState][id].resetFlatSettings();
  return /**@type {anychart.core.ui.LabelsSettings}*/(this.settingsForLabels[stringState][id]);
};


/**
 * @param {anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge} element
 * @param {anychart.SettingsState=} opt_state
 * @return {anychart.graphModule.Chart.Node | anychart.graphModule.Chart.Edge |anychart.SettingsState}
 * */
anychart.graphModule.elements.Base.prototype.state = function(element, opt_state) {
  if (goog.isDefAndNotNull(opt_state)) {
    element.currentState = opt_state;
    return element;
  }
  return element.currentState || anychart.SettingsState.NORMAL;
};


/**
 * Dispatch signal we need measure labels.
 * */
anychart.graphModule.elements.Base.prototype.needsMeasureLabels = function() {
  this.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.elements.Base.base(this, 'setupByJSON', config, opt_default);
  if ('tooltip' in config) {
    this.tooltip().setup(config['tooltip']);
  }

  this.normal_.setup(config['normal']);
  this.hovered_.setup(config['hovered']);
  this.selected_.setup(config['selected']);
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.serialize = function() {
  var json = anychart.graphModule.elements.Base.base(this, 'serialize');
  var normal, hovered, selected;
  if (this.tooltip)
    json['tooltip'] = this.tooltip().serialize();
  normal = this.normal_.serialize();
  hovered = this.hovered_.serialize();
  selected = this.selected_.serialize();

  var labels = normal.labels;
  if (labels && goog.object.isEmpty(labels)) {
    delete normal['labels'];
  }

  labels = hovered.labels;
  if (labels && goog.object.isEmpty(labels)) {
    delete hovered['labels'];
  }

  labels = selected.labels;
  if (labels && goog.object.isEmpty(labels)) {
    delete selected['labels'];
  }

  json['normal'] = normal;
  json['hovered'] = hovered;
  json['selected'] = selected;

  return json;
};


/**
 * Displose all created labels settings.
 * */
anychart.graphModule.elements.Base.prototype.resetLabelSettings = function() {
  for (var labelSettings in this.settingsForLabels) {
    for (var setting in this.settingsForLabels[labelSettings]) {
      var lblSetting = this.settingsForLabels[labelSettings][setting];
      lblSetting.disposeInternal();
    }
  }
  this.settingsForLabels = {
    'normal': {},
    'hovered': {},
    'selected': {}
  };
};


/** @inheritDoc */
anychart.graphModule.elements.Base.prototype.disposeInternal = function() {
  goog.disposeAll(this.textPool_);
  goog.disposeAll(this.pathPool_);

  this.textPool_ = [];
  this.pathPool_ = [];

  this.resetLabelSettings();


};

(function() {
  var proto = anychart.graphModule.elements.Base.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();
