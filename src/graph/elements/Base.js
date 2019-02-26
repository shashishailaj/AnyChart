goog.provide('anychart.graphModule.elements.Base');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.ui.LabelsSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Base = function(chart) {
  anychart.graphModule.elements.Base.base(this, 'constructor');

  this.chart_ = chart;

  /**
   * @private
   * */
  this.labelsSettings_ = {};
  this.labelsSettings_.normal = {};
  this.labelsSettings_.hovered = {};
  this.labelsSettings_.selected = {};

  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['shape', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['labels', 0, anychart.Signal.NEEDS_REDRAW_LABELS],
    ['width', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['height', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);

  this.normal_ = new anychart.core.StateSettings(this, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var descriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(descriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['shape', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE], //todo
    ['labels', 0, anychart.Signal.NEEDS_REDRAW_LABELS],
    ['width', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['height', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
  this.hovered_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.HOVER);
  this.selected_ = new anychart.core.StateSettings(this, descriptorsMeta, anychart.PointState.SELECT);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_FACTORY_CONSTRUCTOR, anychart.core.StateSettings.OPTIMIZED_LABELS_CONSTRUCTOR_NO_THEME);

  this.normal_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
  this.hovered_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);
  this.selected_.setOption(anychart.core.StateSettings.LABELS_AFTER_INIT_CALLBACK, anychart.core.StateSettings.DEFAULT_LABELS_AFTER_INIT_CALLBACK);

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

  var normalLabels = this.normal_.labels();

  normalLabels.parent(this.chart_.labels());
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


anychart.graphModule.elements.Base.prototype.SUPPORTED_SIGNALS =
  anychart.Signal.MEASURE_COLLECT | //Signal for Measuriator to collect labels to measure.
  anychart.Signal.MEASURE_BOUNDS | //Signal for Measuriator to measure the bounds of collected labels.
  anychart.Signal.NEEDS_REDRAW_LABELS; //Signal for DG to change the labels placement.


/**
 * Returns id of element.
 */
anychart.graphModule.elements.Base.prototype.getElementId = goog.nullFunction;


/**
 * Returns state of element.
 */
anychart.graphModule.elements.Base.prototype.getElementState = goog.nullFunction;

/**
 * Returns interator.
 */
anychart.graphModule.elements.Base.prototype.getIterator = goog.nullFunction;


/**
 * Resolve labels settings for passed element.
 * @param {(anychart.graphModule.Chart.Node|anychart.graphModule.Chart.Edge)} element
 * @return {anychart.core.ui.LabelsSettings} instance of LabelSettings.
 * */
anychart.graphModule.elements.Base.prototype.resolveLabelSettingsForNode = function(element) {
  // debugger
  var state = this.getElementState(element),
      stringState = anychart.utils.pointStateToName(state),
      id = this.getElementId(element),
      dataRow = element.dataRow,
      mainLabelSettings,
      specificLabelSetting,
      iteratorData;


  var iterator = this.getIterator();
  iterator.select(dataRow);

  iteratorData = iterator.get('labels');
  var labelsSettingsFromData = iteratorData;
  iteratorData = iterator.get(stringState);
  var labelsSettingsFromDataForState = iteratorData ? iteratorData['labels'] : void 0;

  if (state == anychart.SettingsState.NORMAL) {
    if (!this.labelsSettings_.normal[id])
      this.labelsSettings_.normal[id] = this.normal_.labels();
    mainLabelSettings = this.labelsSettings_.normal[id];

    if (labelsSettingsFromData) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings(true);
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(labelsSettingsFromData);
      mainLabelSettings = specificLabelSetting;
    }
    if (labelsSettingsFromDataForState) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings(true);
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(labelsSettingsFromDataForState);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  } else if (state == anychart.SettingsState.HOVERED) {
    if (!this.labelsSettings_.hovered[id])
      this.labelsSettings_.hovered[id] = this.hovered_.labels();

    mainLabelSettings = this.labelsSettings_.hovered[id];
    if (labelsSettingsFromDataForState) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings(true);
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(labelsSettingsFromDataForState);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.hovered[id] = mainLabelSettings;
  } else if (state == anychart.SettingsState.SELECTED) {
    if (!this.labelsSettings_.selected[id])
      this.labelsSettings_.selected[id] = this.normal_.labels();

    mainLabelSettings = this.labelsSettings_.selected[id];
    if (labelsSettingsFromDataForState) {
      specificLabelSetting = new anychart.core.ui.LabelsSettings(true);
      specificLabelSetting.parent(mainLabelSettings);
      specificLabelSetting.setup(labelsSettingsFromDataForState);
      mainLabelSettings = specificLabelSetting;
    }

    this.labelsSettings_.normal[id] = mainLabelSettings;
  }

  return mainLabelSettings;
};


anychart.graphModule.elements.Base.prototype.labelsInvalidated_ = goog.nullFunction;


(function() {
  var proto = anychart.graphModule.elements.Base.prototype;
  proto['normal'] = proto.normal;
  proto['hovered'] = proto.hovered;
  proto['selected'] = proto.selected;
})();

