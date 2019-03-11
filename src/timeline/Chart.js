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
   * Base transformation matrix without any transformations/translations.
   * @type {Array.<number>}
   */
  this.baseTransform = [1, 0, 0, 1, 0, 0];

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
/**
 * Base z index of range series, used for z index calculation.
 * @type {number}
 */
anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX = 32;


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.calculate = function() {
  var dateMin = +Infinity;
  var dateMax = -Infinity;

  var directions = [anychart.enums.EventMarkerDirection.UP, anychart.enums.EventMarkerDirection.DOWN];
  var rangeNum = 0;
  var eventNum = 0;

  this.drawingPlans = [];
  this.drawingPlansRange = [];

  this.eventSeriesList = [];
  this.rangeSeriesList = [];

  var axisHeight = /** @type {number} */(this.axis().getOption('height'));

  /**
   * Checks if given value is inside range min and max.
   * If range max is NaN, it's thought to be +Infinity.
   * @param {number} value
   * @param {number} rangeMin
   * @param {number} rangeMax
   * @return {boolean}
   */
  var valueInsideRange = function(value, rangeMin, rangeMax) {
    return (value > rangeMin && (value < rangeMax || isNaN(rangeMax)));
  };
  var stacked = true;
  var stacks = [];

  for (var i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    var seriesType = series.seriesType();

    switch (seriesType) {
      case anychart.enums.TimelineSeriesType.EVENT:
        this.eventSeriesList.push(series);
        break;
      case anychart.enums.TimelineSeriesType.RANGE:
        this.rangeSeriesList.push(series);
        break;
    }

    //region searching min/max values
    var it = series.getResetIterator();
    if (seriesType == anychart.enums.TimelineSeriesType.EVENT) {
      while (it.advance()) {
        var date = anychart.utils.normalizeTimestamp(it.get('x'));
        dateMin = Math.min(dateMin, date);
        dateMax = Math.max(dateMax, date);
      }
    } else if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
      while (it.advance()) {
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
    //endregion

    //region setting auto directions for series if needed
    if (series.getOption('direction') == anychart.enums.EventMarkerDirection.AUTO) {
      if (series.seriesType() == anychart.enums.TimelineSeriesType.RANGE) {
        series.autoDirection(directions[rangeNum & 1]);
        rangeNum++;
      } else if (series.seriesType() == anychart.enums.TimelineSeriesType.EVENT) {
        series.autoDirection(directions[eventNum & 1]);
        eventNum++;
      }
    }
    //endregion

    //region obtaining drawing plan for series
    var drawingPlan = series.getScatterDrawingPlan(false, true);
    this.drawingPlans.push(drawingPlan);
    if (drawingPlan.series.getType() == anychart.enums.TimelineSeriesType.RANGE) {
      this.drawingPlansRange.push(drawingPlan);
    }
    //endregion

    //region stacking ranges
    if (drawingPlan.series.getType() == anychart.enums.TimelineSeriesType.RANGE) {
      drawingPlan.series.zIndex(anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - (i / 100));
      var data = drawingPlan.data;
      if (stacked) {
        for (var k = 0; k < data.length; k++) {
          var point = data[k];
          var stack = {};
          stack.start = point.data['start'];
          stack.end = point.data['end'];
          stack.direction = /** @type {anychart.enums.EventMarkerDirection} */(drawingPlan.series.getFinalDirection());

          // find in already stacked ranges all of those, that contain current range start or end value
          var intersectingStacks = stacks.filter(function(value) {
            if (stack.direction == value.direction)
              return valueInsideRange(stack.start, value.start, value.end) ||
                     valueInsideRange(stack.end, value.start, value.end) ||
                     valueInsideRange(value.start, stack.start, stack.end) ||
                     valueInsideRange(value.end, stack.start, stack.end);
            return false;
          });

          var seriesHeight = /** @type {number} */(series.getOption('height'));
          seriesHeight = anychart.utils.normalizeSize(seriesHeight, this.dataBounds.height);
          // no intersections, so it's placed on the first level
          if (intersectingStacks.length == 0) {
            stack.height = seriesHeight;
            stack.base = 0;
            stack.stackLevel = 1;
            stacks.push(stack);
          } else {// if there are intersections - find range that is stacked the highest, so that we stack above it
            var stackLevel = 0;
            var baseHeight = 0;
            for (var j = 0; j < intersectingStacks.length; j++) {
              if (intersectingStacks[j].stackLevel > stackLevel) {
                stackLevel = intersectingStacks[j].stackLevel;
                baseHeight = intersectingStacks[j].base + intersectingStacks[j].height;
              }
            }
            stackLevel++;

            stack.base = baseHeight;
            stack.height = seriesHeight;
            stack.stackLevel = stackLevel;
            stacks.push(stack);
          }

          point.meta['stackLevel'] = stack.stackLevel;
          point.meta['axisHeight'] = axisHeight;
        }
      }
    }
    //endregion

  }

  this.dateMin = dateMin;
  this.dateMax = dateMax;
  if (this.autoRange_)
    this.scale().setRange(this.dateMin, this.dateMax);

  var points = [];
  //region where event series length is calculated and labels overlap data prepared
  for (var i = 0; i < this.eventSeriesList.length; i++) {
    series = this.eventSeriesList[i];
    var direction = series.getFinalDirection();
    it = series.getResetIterator();

    var factory = series.labels();
    var needsCreateLabels = factory.labelsCount() == 0;

    while (it.advance()) {
      var date = anychart.utils.normalizeTimestamp(it.get('x'));
      var intersectingRanges = stacks.filter(function(value) {
        if (direction == value.direction)
          return valueInsideRange(date, value.start, value.end);
        return false;
      });
      var minLength = anychart.utils.normalizeSize(series.connector().getOption('length'), this.dataBounds.height);
      for (var j = 0; j < intersectingRanges.length; j++) {
        var range = intersectingRanges[j];
        if (minLength < (range.height + range.base))
          minLength = (range.height + range.base);
      }
      it.meta('minLength', minLength);
      it.meta('axisHeight', axisHeight);

      //preparing data for labels overlap calculation
      var label;
      if (needsCreateLabels) {
        var formatProvider = series.createLabelsContextProvider();
        var positionProvider = series.createPositionProvider(anychart.enums.Position.CENTER);
        label = factory.add(formatProvider, positionProvider);
      } else {
        label = factory.getLabel(it.getIndex());
      }
      label.draw();

      var bounds = label.getTextElement().getBounds();
      bounds.top = it.meta('minLength');
      bounds.left = this.scale().transform(date) * this.dataBounds.width;
      points.push({bounds: bounds, date: date, series: series, id: it.getIndex(), direction: direction});
    }
  }
  //endregion

  //region with event labels overlap handling
  points = points.sort(function(a, b) {return a.date - b.date;});
  for (var i = 0; i < points.length; i++) {
    var firstPoint = points[i];
    for (var k = i + 1; k < points.length; k++) {
      var secondPoint = points[k];
      if (firstPoint.bounds.intersection(secondPoint.bounds) && firstPoint.direction == secondPoint.direction) {
        var secondPointIterator = secondPoint.series.getResetIterator();
        secondPointIterator.select(secondPoint.id);
        var length = secondPointIterator.meta('minLength');
        secondPointIterator.meta('minLength', length + firstPoint.bounds.height);
      }
    }
  }
  //endregion
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;


  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dataBounds = bounds.clone();
    this.rootElement.setTransformationMatrix.apply(this.rootElement, this.baseTransform);// cleaning up transformations

    if (this.scroll_ < 0) {
      this.rootElement.translate(0, this.dataBounds.height / 2);
    } else if (this.scroll_ > 0) {
      this.rootElement.translate(0, -this.dataBounds.height / 2);
    }

    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.SERIES_CHART_SERIES);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  this.calculate();

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
anychart.timelineModule.Chart.prototype.onAxisSignal_ = function(event) {
  var consistency = anychart.ConsistencyState.AXES_CHART_AXES;
  if (event.signal & anychart.Signal.NEEDS_RECALCULATION) {
    consistency |= anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.BOUNDS;
  }
  this.invalidate(consistency, anychart.Signal.NEEDS_REDRAW);
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
  if (!this.yScale_) {
    this.yScale_ = new anychart.scales.Linear();
  }
  return this.yScale_;
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


/**
 * Scrolls chart vertically.
 * @param {number} value
 */
anychart.timelineModule.Chart.prototype.scroll = function(value) {
  if (this.scroll_ != value) {
    this.scroll_ = value;
    // TODO(Ilya): Invalidating bounds is a bit too much. Consider another consistency state.
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW);
  }
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
  proto['scroll'] = proto.scroll;
})();
//exports

//endregion
