goog.provide('anychart.timelineModule.Chart');


//region -- Requirements.
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.axisMarkers.Line');
goog.require('anychart.core.axisMarkers.Range');
goog.require('anychart.core.axisMarkers.Text');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.ChartScroller');
goog.require('anychart.scales.GanttDateTime');
goog.require('anychart.scales.Linear');
goog.require('anychart.timelineModule.Axis');
goog.require('anychart.timelineModule.series.Event');
goog.require('anychart.timelineModule.series.Range');
goog.require('goog.events.MouseWheelHandler');



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
  this.xScale_.listenSignals(this.scaleInvalidated_, this);

  /**
   * Base transformation matrix without any transformations/translations.
   * @type {Array.<number>}
   */
  this.baseTransform = [1, 0, 0, 1, 0, 0];

  /**
   * @type {Array.<anychart.core.axisMarkers.Line>}
   * @private
   */
  this.lineAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Text>}
   * @private
   */
  this.textAxesMarkers_ = [];

  /**
   * @type {Array.<anychart.core.axisMarkers.Range>}
   * @private
   */
  this.rangeAxesMarkers_ = [];
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
    anychart.ConsistencyState.SCALE_CHART_SCALES |
    anychart.ConsistencyState.AXES_CHART_AXES_MARKERS |
    anychart.ConsistencyState.CARTESIAN_X_SCROLLER;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_SIGNALS =
    anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Timeline chart states
 * @enum {string}
 */
anychart.timelineModule.Chart.States = {
  SCROLL: 'scroll'
};
anychart.consistency.supportStates(anychart.timelineModule.Chart, anychart.enums.Store.TIMELINE_CHART, [
      anychart.timelineModule.Chart.States.SCROLL]);


//endregion
//region -- Axis markers
/**
 * Getter/setter for rangeMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart range marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart range marker settings to set.
 * @return {!(anychart.core.axisMarkers.Range|anychart.timelineModule.Chart)} Range marker instance by index or itself for chaining call.
 */
anychart.timelineModule.Chart.prototype.rangeMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var rangeMarker = this.rangeAxesMarkers_[index];
  if (!rangeMarker) {
    rangeMarker = this.createRangeMarkerInstance();

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultRangeMarkerSettings');
    rangeMarker.addThemes(extendedThemes);

    rangeMarker.setChart(this);
    rangeMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.rangeAxesMarkers_[index] = rangeMarker;
    rangeMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    rangeMarker.setup(value);
    return this;
  } else {
    return rangeMarker;
  }
};


/**
 * Create rangeMarker instance.
 * @return {!(anychart.core.axisMarkers.Range)}
 * @protected
 */
anychart.timelineModule.Chart.prototype.createRangeMarkerInstance = function() {
  return new anychart.core.axisMarkers.Range();
};


/**
 * Getter/setter for textMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Text|anychart.timelineModule.Chart)} Text marker instance by index or itself for chaining call.
 */
anychart.timelineModule.Chart.prototype.textMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var textMarker = this.textAxesMarkers_[index];
  if (!textMarker) {
    textMarker = this.createTextMarkerInstance();

    // textMarker.addThemes('cartesianBase.defaultTextMarkerSettings');
    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultTextMarkerSettings');
    textMarker.addThemes(extendedThemes);

    textMarker.setChart(this);
    textMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.textAxesMarkers_[index] = textMarker;
    textMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    textMarker.setup(value);
    return this;
  } else {
    return textMarker;
  }
};


/**
 * Create textMarker instance.
 * @return {anychart.core.axisMarkers.Text}
 * @protected
 */
anychart.timelineModule.Chart.prototype.createTextMarkerInstance = function() {
  return new anychart.core.axisMarkers.Text();
};


/**
 * Getter/setter for lineMarker.
 * @param {(Object|boolean|null|number)=} opt_indexOrValue Chart line marker settings to set.
 * @param {(Object|boolean|null)=} opt_value Chart line marker settings to set.
 * @return {!(anychart.core.axisMarkers.Line|anychart.timelineModule.Chart)} Line marker instance by index or itself for method chaining.
 */
anychart.timelineModule.Chart.prototype.lineMarker = function(opt_indexOrValue, opt_value) {
  var index, value;
  index = anychart.utils.toNumber(opt_indexOrValue);
  if (isNaN(index)) {
    index = 0;
    value = opt_indexOrValue;
  } else {
    index = /** @type {number} */(opt_indexOrValue);
    value = opt_value;
  }
  var lineMarker = this.lineAxesMarkers_[index];
  if (!lineMarker) {
    lineMarker = this.createLineMarkerInstance();

    var extendedThemes = this.createExtendedThemes(this.getThemes(), 'defaultLineMarkerSettings');
    lineMarker.addThemes(extendedThemes);

    lineMarker.setChart(this);
    lineMarker.setDefaultLayout(anychart.enums.Layout.VERTICAL);
    this.lineAxesMarkers_[index] = lineMarker;
    lineMarker.listenSignals(this.markerInvalidated_, this);
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
  }

  if (goog.isDef(value)) {
    lineMarker.setup(value);
    return this;
  } else {
    return lineMarker;
  }
};


/**
 * @return {anychart.core.axisMarkers.Line}
 */
anychart.timelineModule.Chart.prototype.createLineMarkerInstance = function() {
  return new anychart.core.axisMarkers.Line();
};


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.markerInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS, anychart.Signal.NEEDS_REDRAW);
};


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

  var axisHeight = this.axis().enabled() ? /** @type {number} */(this.axis().getOption('height')) : 0;
  var gap = 10;

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

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_SCALES)) {
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
        var seriesZIndex = anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - (i / 100);
        drawingPlan.series.zIndex(seriesZIndex);
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
            /*
            Individual zIndexes for points, so that intersecting points from same series correctly overlap.
             */
            point.meta['stateZIndex'] = 0.01 - stack.stackLevel / 1000;
          }
        }
      }
      //endregion

    }

    if (dateMin == dateMax) {
      dateMin--;
      dateMax++;
    }

    this.dateMin = dateMin;
    this.dateMax = dateMax;
    this.scale().setDataRange(this.dateMin, this.dateMax);

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
            minLength = (range.height + range.base) + gap;
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
        bounds.left = this.scale().transform(date) * this.dataBounds.width - bounds.width / 2;
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
          var newLength = length + firstPoint.bounds.height + gap;
          secondPointIterator.meta('minLength', newLength);
          secondPoint.bounds.top = newLength;
        }
      }
    }
    //endregion
  }
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.timelineLayer) {
    this.timelineLayer = this.rootElement.layer();
    this.timelineLayer.zIndex(1);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.dataBounds = bounds.clone();
    this.invalidate(anychart.ConsistencyState.AXES_CHART_AXES | anychart.ConsistencyState.SERIES_CHART_SERIES |
        anychart.ConsistencyState.AXES_CHART_AXES_MARKERS | anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
    this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CARTESIAN_X_SCROLLER)) {
    this.scroller().container(this.rootElement);
    this.scroller().draw();
    this.markConsistent(anychart.ConsistencyState.CARTESIAN_X_SCROLLER);
  }

  // calculate needs data bounds populated for event series overlap processing
  this.calculate();

  if (this.hasStateInvalidation(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL)) {
    // this.timelineLayer.setTransformationMatrix.apply(this.timelineLayer, this.baseTransform);// cleaning up transformations
    //
    // if (this.scroll_ < 0) {
    //   this.timelineLayer.translate(0, this.dataBounds.height / 2);
    // } else if (this.scroll_ > 0) {
    //   this.timelineLayer.translate(0, -this.dataBounds.height / 2);
    // }
    this.markStateConsistent(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL);
  }

  var axis = this.getCreated('axis');
  if (this.hasInvalidationState(anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    if (axis) {
      axis.scale(this.scale());
    }
    this.invalidate(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.AXES_CHART_AXES |
        anychart.ConsistencyState.AXES_CHART_AXES_MARKERS);
    this.markConsistent(anychart.ConsistencyState.SCALE_CHART_SCALES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES)) {
    for (var i = 0; i < this.seriesList.length; i++) {
      var series = this.seriesList[i];
      series.parentBounds(this.dataBounds);
      series.container(this.timelineLayer);
      series.draw();
    }

    this.markConsistent(anychart.ConsistencyState.SERIES_CHART_SERIES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES)) {
    if (axis) {
      axis.parentBounds(this.dataBounds);
      axis.container(this.timelineLayer);
      axis.draw();
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS)) {
    var markers = goog.array.concat(
        this.lineAxesMarkers_,
        this.rangeAxesMarkers_,
        this.textAxesMarkers_);

    for (i = 0; i < markers.length; i++) {
      var axesMarker = markers[i];
      /*
      When scale range changes - markers (except from text marker) do not redraw themselves.
      Invalidating their bounds fixes this problem.
       */
      axesMarker.invalidate(anychart.ConsistencyState.BOUNDS);
      if (axesMarker) {
        axesMarker.suspendSignalsDispatching();
        if (!axesMarker.scale())
          axesMarker.autoScale(this.xScale_);
        axesMarker.parentBounds(this.dataBounds);
        axesMarker.container(this.timelineLayer);
        axesMarker.draw();
        axesMarker.resumeSignalsDispatching(false);
      }
    }
    this.markConsistent(anychart.ConsistencyState.AXES_CHART_AXES_MARKERS);
  }

  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(
        this.container().getStage().getDomWrapper(), false);
    this.mouseWheelHandler_.listen('mousewheel', this.handleMouseWheel_, false, this);
  }
};


/**
 * @param {goog.events.MouseWheelEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.handleMouseWheel_ = function(event) {

  var matrix;
  if (event['shiftKey'] && this.interactivity().getOption('zoomOnMouseWheel')) {//zooming
    var zoomIn = event['deltaY'] < 0;

    matrix = this.timelineLayer.getTransformationMatrix();
    if (zoomIn) {
      matrix[0] += 0.1;
      matrix[3] += 0.1;
      var yDelta = 1 - matrix[3];
      matrix[5] = this.dataBounds.height * (yDelta / 2);
    } else {
      matrix[0] -= 0.1;
      matrix[3] -= 0.1;
      if (matrix[0] < 1) {
        matrix[0] = 1;
        matrix[3] = 1;
      }
      var yDelta = 1 - matrix[3];
      matrix[5] = this.dataBounds.height * (yDelta / 2);
    }
    this.timelineLayer.setTransformationMatrix.apply(this.timelineLayer, matrix);
  } else if (!event['shiftKey'] && this.interactivity().getOption('scrollOnMouseWheel')) {//scrolling
    var scrollForward = event['deltaY'] < 0;

    matrix = this.timelineLayer.getTransformationMatrix();
    if (scrollForward) {
      matrix[4] -= 0.1 * (matrix[3] * this.dataBounds.width);
      if (matrix[4] < -(matrix[3] * this.dataBounds.width - this.dataBounds.width))
        matrix[4] = -(matrix[3] * this.dataBounds.width - this.dataBounds.width);
    } else {
      matrix[4] += 0.1 * (matrix[3] * this.dataBounds.width);
      if (matrix[4] > 0)
        matrix[4] = 0;
    }
    this.timelineLayer.setTransformationMatrix.apply(this.timelineLayer, matrix);
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
    this.axis_.listenSignals(this.axisInvalidated_, this);
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
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.axisInvalidated_ = function(event) {
  var consistency = anychart.ConsistencyState.AXES_CHART_AXES;
  if (event.hasSignal(anychart.Signal.ENABLED_STATE_CHANGED | anychart.Signal.NEEDS_RECALCULATION)) {
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


/**
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.scaleInvalidated_ = function(event) {
  this.suspendSignalsDispatching();
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  this.resumeSignalsDispatching(true);
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
  var scroller = this.getCreated('scroller');
  if (scroller) {
    var totalRange = this.scale().getTotalRange();
    var delta = totalRange['max'] - totalRange['min'];
    scroller.setRangeInternal((startDate - totalRange['min']) / delta, (endDate - totalRange['min']) / delta);
  }
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  return this;
};


/**
 * Reset zoom/scroll manipulations.
 */
anychart.timelineModule.Chart.prototype.fit = function() {
  this.suspendSignalsDispatching();
  this.scale().fitAll();
  this.scroll(0);
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES, anychart.Signal.NEEDS_REDRAW);
  this.resumeSignalsDispatching(true);
};


/**
 * Scrolls chart vertically.
 * @param {number=} opt_value scroll value, negative means showing upper half of chart, positive - lower half,
 * zero - center chart.
 * @return {number|anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.scroll = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = +opt_value;
    if (this.scroll_ != opt_value) {
      this.scroll_ = opt_value;
      this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);
      return this;
    }
  }

  return this.scroll_;
};


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.TIMELINE;
};


/**
 * Scroller getter/setter.
 * @param {(Object|boolean|null)=} opt_value
 * @return {anychart.core.ui.ChartScroller|anychart.timelineModule.Chart}
 */
anychart.timelineModule.Chart.prototype.scroller = function(opt_value) {
  if (!this.scroller_) {
    this.scroller_ = new anychart.core.ui.ChartScroller();
    this.scroller_.setParentEventTarget(this);
    this.scroller_.listenSignals(this.scrollerInvalidated_, this);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE, this.scrollerChangeHandler);
    this.eventsHandler.listen(this.scroller_, anychart.enums.EventType.SCROLLER_CHANGE_FINISH, this.scrollerChangeHandler);
    this.invalidate(
        anychart.ConsistencyState.CARTESIAN_X_SCROLLER |
        anychart.ConsistencyState.BOUNDS,
        anychart.Signal.NEEDS_REDRAW);

    this.setupCreated('scroller', this.scroller_);
  }

  if (goog.isDef(opt_value)) {
    this.scroller_.setup(opt_value);
    return this;
  } else {
    return this.scroller_;
  }
};


/**
 * Scroller invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.timelineModule.Chart.prototype.scrollerInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.CARTESIAN_X_SCROLLER, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Scroller zoom change handler.
 * @param {anychart.core.ui.Scroller.ScrollerChangeEvent} event
 */
anychart.timelineModule.Chart.prototype.scrollerChangeHandler = function(event) {
  var totalRange = this.scale().getTotalRange();
  var rangeDelta = totalRange['max'] - totalRange['min'];
  var startRatio = event['startRatio'];
  var endRatio = event['endRatio'];
  this.zoomTo(totalRange['min'] + startRatio * rangeDelta, totalRange['min'] + endRatio * rangeDelta);
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
  if (config['scale']) {
    this.scale(config['scale']);
  }

  if (config['axis']) {
    this.axis(config['axis']);
  }

  this.scroll(config['scroll']);

  this.setupElements(config['lineAxesMarkers'], this.lineMarker);
  this.setupElements(config['textAxesMarkers'], this.textMarker);
  this.setupElements(config['rangeAxesMarkers'], this.rangeMarker);

  this.setupSeriesByJSON(config);
};


/**
 * Creates series from passed json config.
 * @param {Object} config
 */
anychart.timelineModule.Chart.prototype.setupSeriesByJSON = function(config) {
  var json;
  var series = config['series'];
  for (var i = 0; i < series.length; i++) {
    json = series[i];
    var seriesType = json['seriesType'] || this.getOption('defaultSeriesType');
    var data = json['data'];
    var seriesInstance = this.createSeriesByType(seriesType, json);
    if (seriesInstance) {
      seriesInstance.setup(json);
    }
  }
};


/**
 * @param {Object} config
 * @param {Function} itemConstructor
 */
anychart.timelineModule.Chart.prototype.setupElements = function(config, itemConstructor) {
  for (var i = 0; i < config.length; i++) {
    var item = itemConstructor.call(this, i);
    item.setup(config[i]);
  }
};


/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.serialize = function() {
  var json = anychart.timelineModule.Chart.base(this, 'serialize');

  json['scale'] = this.scale().serialize();
  json['axis'] = this.axis().serialize();

  var i;
  json['lineAxesMarkers'] = [];
  for (i = 0; i < this.lineAxesMarkers_.length; i++) {
    json['lineAxesMarkers'].push(this.lineAxesMarkers_[i].serialize());
  }

  json['textAxesMarkers'] = [];
  for (i = 0; i < this.textAxesMarkers_.length; i++) {
    json['textAxesMarkers'].push(this.textAxesMarkers_[i].serialize());
  }

  json['rangeAxesMarkers'] = [];
  for (i = 0; i < this.rangeAxesMarkers_.length; i++) {
    json['rangeAxesMarkers'].push(this.rangeAxesMarkers_[i].serialize());
  }

  this.serializeSeries(json);

  json['type'] = this.getType();
  json['scroll'] = this.scroll();

  return {'chart': json};
};


/**
 * @param {!Object} json
 */
anychart.timelineModule.Chart.prototype.serializeSeries = function(json) {
  var i;
  var config;
  var seriesList = [];
  for (i = 0; i < this.seriesList.length; i++) {
    var series = this.seriesList[i];
    config = series.serialize();
    seriesList.push(config);
  }
  if (seriesList.length)
    json['series'] = seriesList;
};


//endregion
//region -- Disposing.
/**
 * @inheritDoc
 */
anychart.timelineModule.Chart.prototype.disposeInternal = function() {
  this.xScale_.unlistenSignals(this.scaleInvalidated_, this);
  this.axis_.unlistenSignals(this.axisInvalidated_, this);

  goog.disposeAll(this.axis_, this.xScale_, this.yScale_, this.lineAxesMarkers_, this.textAxesMarkers_, this.rangeAxesMarkers_);
  this.axis_ = null;
  this.xScale_ = null;
  this.yScale_ = null;
  this.lineAxesMarkers_.length = 0;
  this.textAxesMarkers_.length = 0;
  this.rangeAxesMarkers_.length = 0;
  anychart.timelineModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.timelineModule.Chart.prototype;
  proto['axis'] = proto.axis;
  proto['scale'] = proto.scale;
  proto['fit'] = proto.fit;
  proto['zoomTo'] = proto.zoomTo;
  proto['getSeriesAt'] = proto.getSeriesAt;
  proto['scroll'] = proto.scroll;
  proto['lineMarker'] = proto.lineMarker;
  proto['textMarker'] = proto.textMarker;
  proto['rangeMarker'] = proto.rangeMarker;
  proto['scroller'] = proto.scroller;
})();
//exports

//endregion
