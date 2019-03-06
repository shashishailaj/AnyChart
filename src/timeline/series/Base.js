goog.provide('anychart.timelineModule.series.Base');
goog.require('anychart.core.series.Cartesian');



/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.core.series.Cartesian}
 */
anychart.timelineModule.series.Base = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Base.base(this, 'constructor', chart, plot, type, config, sortedMode);

  this.autoDirection_ = anychart.enums.EventMarkerDirection.UP;
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['direction', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.timelineModule.series.Base, anychart.core.series.Cartesian);


/**
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.DIRECTION
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.series.Base, anychart.timelineModule.series.Base.PROPERTY_DESCRIPTORS);


/**
 * @param {anychart.enums.EventMarkerDirection=} opt_value
 * @return {anychart.enums.EventMarkerDirection|anychart.timelineModule.series.Base}
 */
anychart.timelineModule.series.Base.prototype.autoDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.autoDirection_ = opt_value;
    return this;
  }
  return this.autoDirection_;
};


/**
 * Returns UP or DOWN direction. Handles auto direction.
 * @return {anychart.enums.EventMarkerDirection}
 */
anychart.timelineModule.series.Base.prototype.getFinalDirection = function() {
  var direction = /** @type {anychart.enums.EventMarkerDirection} */(this.getOption('direction'));
  if (direction == anychart.enums.EventMarkerDirection.AUTO) {
    return this.autoDirection_;
  }
  return direction;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.getCategoryWidth = function(opt_category) {
  return 0;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.needsExtremums = function() {
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.isPointVisible = function(point) {
  var x = anychart.utils.normalizeTimestamp(point.getX());
  var range = this.chart.xScale().getRange();
  if (x >= range['min'] || x <= range['max']) {
    return true;
  }
  return false;
};


/**
 * Meta maker for timeline.
 * @param {anychart.data.IRowInfo} rowInfo
 * @param {Array.<string>} yNames
 * @param {Array.<string|number>} yColumns
 * @param {number} pointMissing
 * @param {number} xRatio
 */
anychart.timelineModule.series.Base.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  var direction = /** @type {anychart.enums.EventMarkerDirection} */(this.getOption('direction'));
  if (direction == anychart.enums.EventMarkerDirection.AUTO) {
    direction = this.autoDirection();
  }
  rowInfo.meta('direction', direction);
  var bounds = this.parentBounds();
  rowInfo.meta('zero', bounds.top + bounds.height / 2);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.planIsStacked = function() {
  return false;
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.prepareMetaMakers = function(yNames, yColumns) {
  this.metaMakers.push(this.makeTimelineMeta);
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  if (this.drawer.type == anychart.enums.SeriesDrawerTypes.RANGE) {
    var startXRatio = this.getXScale().transform(rowInfo.get('start'));
    var endXRatio = this.getXScale().transform(rowInfo.get('end'));
    rowInfo.meta('startXRatio', startXRatio);
    rowInfo.meta('endXRatio', endXRatio);
  } else {
    var xRatio = this.getXScale().transform(rowInfo.getX());
    rowInfo.meta('xRatio', xRatio);
  }
  for (var i = 0; i < this.metaMakers.length; i++) {
    this.metaMakers[i].call(this, rowInfo, yNames, yColumns, 0, xRatio);
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Base.prototype.getDrawingData = function(data, dataPusher, xNormalizer, xMissingChecker) {
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();
  var hasXErrors = false;
  var hasYErrors = false;

  var nonMissingCount = 0;
  while (iterator.advance()) {
    if (this.drawer.type == anychart.enums.SeriesDrawerTypes.RANGE) {
      var start = xNormalizer(iterator.get('start'));
      var end = xNormalizer(iterator.get('end'));
      var pointData = {};
      var meta = {};
      pointData['start'] = start;
      pointData['end'] = end;
      meta['rawIndex'] = iterator.getIndex();
    } else {
      var xValue = xNormalizer(iterator.get('x'));
      var pointData = {};
      var meta = {};
      pointData['x'] = xValue;
      meta['rawIndex'] = iterator.getIndex();
    }
    var point = {
      data: pointData,
      meta: meta
    };
    dataPusher(data, point);
  }
  this.invalidate(anychart.ConsistencyState.SERIES_DATA);
  this.drawingPlan = {
    data: data,
    series: this,
    nonMissingCount: nonMissingCount,
    hasPointLabels: this.supportsLabels() &&
        (
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('label') ||
            dataSource.checkFieldExist('hoverLabel') ||
            dataSource.checkFieldExist('selectLabel') ||
            dataSource.checkFieldExist('minLabel') ||
            dataSource.checkFieldExist('hoverMinLabel') ||
            dataSource.checkFieldExist('selectMinLabel') ||
            dataSource.checkFieldExist('maxLabel') ||
            dataSource.checkFieldExist('hoverMaxLabel') ||
            dataSource.checkFieldExist('selectMaxLabel')
        ),
    hasPointMarkers: this.supportsMarkers() &&
        (
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('marker') ||
            dataSource.checkFieldExist('hoverMarker') ||
            dataSource.checkFieldExist('selectMarker')
        ),
    hasPointOutliers: this.supportsOutliers() &&
        (
            dataSource.checkFieldExist('outliers') ||
            dataSource.checkFieldExist('normal') ||
            dataSource.checkFieldExist('hovered') ||
            dataSource.checkFieldExist('selected') ||
            dataSource.checkFieldExist('outlierMarker') ||
            dataSource.checkFieldExist('hoverOutlierMarker') ||
            dataSource.checkFieldExist('selectOutlierMarker')
        ),
    hasPointXErrors: hasXErrors,
    hasPointYErrors: hasYErrors,
    hasPointErrors: hasXErrors || hasYErrors
  };

  return this.drawingPlan;
};
