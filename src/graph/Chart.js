//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
//endregion



//region Constructor
//TODO jsdoc
/**
 * @constructor
 * @param {Object=} opt_data
 * @extends {anychart.core.Chart}
 * */
anychart.graphModule.Chart = function(opt_data) {
  anychart.graphModule.Chart.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['layout', 0, anychart.Signal.NEEDS_REDRAW]
  ]);
  this.data(opt_data);
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.TREE_DATA |
  anychart.ConsistencyState.APPEARANCE;


/**
 * Z-index for graph chart.
 * @type {number}
 * */
anychart.graphModule.Chart.Z_INDEX = 30;


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.graphModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'layout', function(value) {
      return anychart.enums.normalize(anychart.graphModule.Chart.Layout, value, anychart.graphModule.Chart.Layout.FORCED);
    }]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.Chart, anychart.graphModule.Chart.OWN_DESCRIPTORS);


/**
 * Types of chart
 * @enum {string}
 * */
anychart.graphModule.Chart.Layout = {
  EXPLICIT: 'explicit',
  FORCED: 'forced'
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.graphModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.GRAPH;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.isNoData = function() {

};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {

};
//endregion


//region Tooltip data
/**
 * Creates context provider for tooltip.
 * @param {anychart.treeDataModule.Tree.DataItem} element Object with data for tooltip.
 * @return {anychart.format.Context}
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(element) {
  // if (!this.contextProvider_)
  //   this.contextProvider_ = new anychart.format.Context();
  //
  // var values = {};
  //
  // if (element) {
  //   values['value'] = {value: element.get('value'), type: anychart.enums.TokenType.STRING};
  //   values['weight'] = {value: element.meta('weight'), type: anychart.enums.TokenType.NUMBER};
  // }
  // this.contextProvider_.dataSource(element);
  // return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


//endregion
//region Event handlers and interactivity


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.dataInvalidated_ = function(event) {
  // if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
  //   this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  // }
};


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  // if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  // var tag = /**@type {anychart.graphModule.Chart.DOMdata}*/(event['domTarget'].tag);
  // if (tag && tag.node) {
  //   this.showAll();
  //   this.drillTo(tag.node);
  // }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  // var tag = /** @type {acgraph.vector.Path} */ (event['domTarget']).tag;
  // var tooltip;
  //
  // //Show tooltip only on nodes with data
  // if (tag && tag.node && !tag.isPlug) {
  //   var node = /** @type {anychart.treeDataModule.Tree.DataItem} */ (tag.node);
  //   tooltip = this.tooltip();
  //   tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(node));
  // } else {
  //   this.tooltip().hide();
  // }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  // this.tooltip().hide();
};


//endregion
//region Data manipulation


/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 * */
anychart.graphModule.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.data_ = opt_value;
    return this;
  }
  return this.data_;
};

//endregion


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
  }
};


//endregion
//region Serialize, setup, dispose
/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  anychart.graphModule.Chart.base(this, 'disposeInternal');
  //TODO dispose
  goog.disposeAll();
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;

})();


//endregion
