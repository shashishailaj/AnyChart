goog.provide('anychart.timelineModule.Chart');


//region -- Requirements.
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.scales.GanttDateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.timelineModule.Axis');
goog.require('anychart.timelineModule.series.Event');
goog.require('anychart.timelineModule.series.Range');



//endregion
//region -- Constructor.
/**
 *
 * @implements {anychart.core.IPlot}
 * @implements {anychart.core.IChart}
 * @constructor
 * @extends {anychart.core.ChartWithSeries}
 */
anychart.timelineModule.Chart = function() {
  anychart.timelineModule.Chart.base(this, 'constructor');
  this.addThemes('timeline');

  /**
   * @type {anychart.scales.GanttDateTime}
   * @private
   */
  this.xScale_ = new anychart.scales.GanttDateTime();
  this.setupCreated('scale', this.xScale_);

  /**
   * Whether scale range should be auto calculated.
   * When it is - it covers all dates in series.
   * @type {boolean}
   * @private
   */
  this.autoRange_ = true;
};
goog.inherits(anychart.timelineModule.Chart, anychart.core.ChartWithSeries);


//endregion
//region -- Consistency states and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.AXES_CHART_AXES |
    anychart.ConsistencyState.SCALE_CHART_SCALES;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


//endregion
//region -- Descriptors.


//endregion
//region -- Chart Infrastructure Overrides.
/** @inheritDoc */
anychart.timelineModule.Chart.prototype.calculate = function() {
  var dateMin = +Infinity;
  var dateMax = -Infinity;
  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    var it = series.getResetIterator();
    var seriesType = series.seriesType();
    while(it.advance()) {
      if (seriesType == anychart.enums.TimelineSeriesType.EVENT) {
        var date = anychart.utils.normalizeTimestamp(it.get('x'));
        dateMin = Math.min(dateMin, date);
        dateMax = Math.max(dateMax, date);
      } else if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
        var start = anychart.utils.normalizeTimestamp(it.get('start'));
        var end = anychart.utils.normalizeTimestamp(it.get('end'));
        if (!isNaN(end)) {
          dateMin = Math.min(dateMin, end);
          dateMax = Math.max(dateMax, end);
        }

        dateMin = Math.min(dateMin, start);
        dateMax = Math.max(dateMax, start);
      }
    }
  }
  this.dateMin = dateMin;
  this.dateMax = dateMax;

  this.drawingPlans = [];
  for (var i = 0; i < this.seriesList.length; i++) {
    var drawingPlan = this.seriesList[i].getScatterDrawingPlan(false, true);
    this.drawingPlans.push(drawingPlan);
  }
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  this.calculate();
  if (this.autoRange_)
    this.scale().setRange(this.dateMin, this.dateMax);

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dataBounds = bounds.clone();
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.SERIES_CHART_SERIES);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  var axis = this.getCreated('axis');
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    if (axis) {
      axis.scale(this.scale());
    }
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.AXES_CHART_AXES);
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    for (var i = 0; i < this.seriesList.length; i++) {
      var series = this.seriesList[i];
      series.parentBounds(this.dataBounds);
      series.container(this.rootElement);
      series.draw();
    }
    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    if (axis) {
      axis.parentBounds(this.dataBounds);
      axis.container(this.rootElement);
      axis.draw();
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }
};


/**
 *
 * @param {Object=} opt_value
 * @return {anychart.timelineModule.Chart|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Chart.prototype.axis = function(opt_value) {
  if (!this.axis_) {
    this.axis_ = new anychart.timelineModule.Axis();
    this.axis_.listenSignals(this.onAxisSignal_, this);
    anychart.measuriator.register(this.axis_);
    this.setupCreated('axis', this.axis_);
  }

  if (goog.isDef(opt_value)) {
    this.axis_.setup(opt_value);
    return this;
  }

  return this.axis_;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.xScale = function() {
  return this.scale();
};


/**
 *
 * @private
 */
anychart.timelineModule.Chart.prototype.onAxisSignal_ = function() {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW);
};


/**
 *
 * @param {Object=} opt_value
 * @return {anychart.timelineModule.Chart|anychart.scales.GanttDateTime}
 */
anychart.timelineModule.Chart.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.xScale_.setup(opt_value);
    return this;
  }

  return this.xScale_;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.createSeriesInstance = function(type, config) {
  if (type == anychart.enums.TimelineSeriesType.EVENT) {
    return new anychart.timelineModule.series.Event(this, this, type, config, true);
  } else {
    return new anychart.timelineModule.series.Range(this, this, type, config, true);
  }
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getYAxisByIndex = function(index) {
  return null;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getXAxisByIndex = function(index) {
  return null;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.yScale = function() {
  return null;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.isVertical = function(opt_value) {
  return false;
};


/**
 *
 * @param {string|number} startDate
 * @param {string|number} endDate
 * @return {anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.zoomTo = function(startDate, endDate) {
  this.autoRange_ = false;
  startDate = anychart.utils.normalizeTimestamp(startDate);
  endDate = anychart.utils.normalizeTimestamp(endDate);
  this.scale().zoomTo(startDate, endDate);
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Reset zoom/scroll manipulations.
 */
anychart.timelineModule.Chart.prototype.fit = function() {
  this.autoRange_ = true;
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Generating Series.
/**
 * Series config for Cartesian chart.
 * @type {!Object.<string, anychart.core.series.TypeConfig>}
 */
anychart.timelineModule.Chart.prototype.seriesConfig = (function() {
  var res = {};
  var capabilities = (anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
      anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
      // anychart.core.series.Capabilities.ALLOW_ERROR |
      // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);

  res[anychart.enums.TimelineSeriesType.EVENT] = {
    drawerType: anychart.enums.SeriesDrawerTypes.EVENT,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities | anychart.core.series.Capabilities.SUPPORTS_MARKERS,
    anchoredPositionTop: 'auto',
    anchoredPositionBottom: 'zero'
  };

  res[anychart.enums.TimelineSeriesType.RANGE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathFillStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'auto',
    anchoredPositionBottom: 'zero'
  };

  return res;
})();
anychart.core.ChartWithSeries.generateSeriesConstructors(anychart.timelineModule.Chart, anychart.timelineModule.Chart.prototype.seriesConfig);


//endregion
//region -- Palette.


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.timelineModule.Chart.base(this, 'setupByJSON', config, opt_default);

  //TODO (A.Kudryavtsev): TBA.
};


/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.serialize = function() {
  var json = anychart.timelineModule.Chart.base(this, 'serialize');

  //TODO (A.Kudryavtsev): TBA.

  return {'chart': json};
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.disposeInternal = function() {
  goog.disposeAll(this.axis_);
  this.axis_ = null;
  anychart.timelineModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.timelineModule.Chart.prototype;
  // proto['method'] = proto.method;
  proto['axis'] = proto.axis;
  proto['scale'] = proto.scale;
  proto['fit'] = proto.fit;
  proto['zoomTo'] = proto.zoomTo;
  proto['getSeriesAt'] = proto.getSeriesAt;
})();
//exports

//endregion
