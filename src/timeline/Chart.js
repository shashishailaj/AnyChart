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
goog.require('anychart.timelineModule.Intersections');
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

  /**
   * Saved vertical translate.
   * @type {number}
   */
  this.verticalTranslate = 0;

  /**
   * Saved horizontal translate.
   * @type {number}
   */
  this.horizontalTranslate = 0;

  /**
   * Automagically translate chart so, that there are no white spaces.
   * Works only if one side has free space and other don't.
   * @type {boolean}
   */
  this.autoChartTranslating = true;
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
anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX = 34;


/** @inheritDoc */
anychart.timelineModule.Chart.prototype.calculate = function() {
  var dateMin = +Infinity;
  var dateMax = -Infinity;

  var directions = [anychart.enums.EventMarkerDirection.UP, anychart.enums.EventMarkerDirection.DOWN];
  var rangeNum = 0;
  var eventNum = 0;

  this.drawingPlans = [];
  this.drawingPlansRange = [];
  this.drawingPlansEvent = [];


  var axisHeight = this.axis().enabled() ? /** @type {number} */(this.axis().getOption('height')) : 0;

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

  var intersectingBounds = [];
  var intersectingBoundsRange = [];
  var intersectingBoundsRangeUp = [];
  var intersectingBoundsRangeDown = [];
  var intersectingBoundsEvent = [];
  var intersectingBoundsEventUp = [];
  var intersectingBoundsEventDown = [];


  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_CHART_SERIES | anychart.ConsistencyState.SCALE_CHART_SCALES)) {
    this.eventSeriesList = [];
    this.rangeSeriesList = [];
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

      //region setting auto directions for series if needed
      if (series.getOption('direction') == anychart.enums.EventMarkerDirection.AUTO) {
        if (series.seriesType() == anychart.enums.TimelineSeriesType.RANGE) {
          series.autoDirection(directions[rangeNum & 1]);
          // if (directions[rangeNum & 1] == anychart.enums.EventMarkerDirection.DOWN) {
          //   series.labels().anchor(anychart.enums.Anchor.LEFT_BOTTOM);
          // } else {}
          rangeNum++;
        } else if (series.seriesType() == anychart.enums.TimelineSeriesType.EVENT) {
          series.autoDirection(directions[eventNum & 1]);
          eventNum++;
        }
      }
      //endregion

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

      //region obtaining drawing plan for series
      var drawingPlan = series.getScatterDrawingPlan(false, true);
      this.drawingPlans.push(drawingPlan);
      if (seriesType == anychart.enums.TimelineSeriesType.RANGE) {
        this.drawingPlansRange.push(drawingPlan);
      } else {
        this.drawingPlansEvent.push(drawingPlan);
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


    //region populate array of intersecting bounds
    /** @type {anychart.timelineModule.Intersections.Range} */
    var pointBounds;
    var sX, eX, sY, eY, direction, pointId;
    var k, point;
    var data;
    for (var i = 0; i < this.drawingPlansRange.length; i++) {
      var drawingPlan = this.drawingPlansRange[i];
      data = drawingPlan.data;
      series = drawingPlan.series;
      var maxTotalRange = this.scale().getTotalRange()['max'];
      for (k = 0; k < data.length; k++) {
        point = data[k];
        sX = this.scale().transform(point.data['start']) * this.dataBounds.width;
        eX = isNaN(point.data['end']) ? this.scale().transform(maxTotalRange) * this.dataBounds.width :
          this.scale().transform(point.data['end']) * this.dataBounds.width;
        sY = 0;
        eY = anychart.utils.normalizeSize(series.getOption('height'), this.dataBounds.height);
        direction = series.getFinalDirection();
        pointId = k;

        pointBounds = {
          sX: sX,
          eX: eX,
          sY: sY,
          eY: eY,
          direction: direction,
          series: series,
          pointId: pointId,
          drawingPlan: this.drawingPlansRange[i]
        };

        intersectingBounds.push(pointBounds);
        intersectingBoundsRange.push(pointBounds);
        if (direction == anychart.enums.EventMarkerDirection.UP) {
          intersectingBoundsRangeUp.push(pointBounds);
        } else {
          intersectingBoundsRangeDown.push(pointBounds);
        }
        point.meta['axisHeight'] = axisHeight;
      }
    }

    for (var i = 0; i < this.drawingPlansEvent.length; i++) {
      var drawingPlan = this.drawingPlansEvent[i];
      series = drawingPlan.series;
      data = this.drawingPlansEvent[i].data;
      for (k = 0; k < data.length; k++) {
        var factory = series.labels();
        var formatProvider = series.createLabelsContextProvider();
        var it = series.getResetIterator();
        it.select(k);
        var text = it.get('value');
        formatProvider['value'] = text;
        var positionProvider = series.createPositionProvider(series.labels().anchor());
        var label = factory.getLabel(k);// = factory.add(formatProvider, positionProvider);
        if (goog.isNull(label)) {
          label = factory.add(formatProvider, positionProvider);
        }
        label.draw();
        var bounds = label.getTextElement().getBounds();
        if (factory.background().enabled())
          bounds = factory.padding().widenBounds(bounds);

        point = data[k];
        sX = this.scale().transform(point.data['x']) * this.dataBounds.width;
        eX = sX + bounds.width;
        sY = 50 - bounds.height / 2;
        eY = 50 + bounds.height / 2;
        direction = series.getFinalDirection();
        pointId = k;

        pointBounds = {
          sX: sX,
          eX: eX,
          sY: sY,
          eY: eY,
          direction: direction,
          series: series,
          pointId: pointId,
          drawingPlan: this.drawingPlansEvent[i],
          text: text
        };

        intersectingBounds.push(pointBounds);
        intersectingBoundsEvent.push(pointBounds);

        if (direction == anychart.enums.EventMarkerDirection.UP) {
          intersectingBoundsEventUp.push(pointBounds);
        } else {
          intersectingBoundsEventDown.push(pointBounds);
        }

        point.meta['axisHeight'] = axisHeight;
      }
    }
    //endregion

    var sortCallback = function (a, b) {
      var diff = a.sX - b.sX;
      if (diff == 0) {
        return b.eX - a.eX;
      }
      return diff;
    };

    goog.array.sort(intersectingBoundsRangeUp, sortCallback);
    goog.array.sort(intersectingBoundsRangeDown, sortCallback);

    var eventSortCallback = function (a, b) {
      var diff = a.sX - b.sX;
      if (diff == 0) {
        return a.eX - b.eX;
      }
      return diff;
    };
    goog.array.sort(intersectingBoundsEventUp, eventSortCallback);
    goog.array.sort(intersectingBoundsEventDown, eventSortCallback);

    var scaleTotalRange = this.scale().getTotalRange();

    this.totalRange = {
      sX: +Infinity,
      eX: -Infinity,
      sY: +Infinity,
      eY: -Infinity
    };
    this.totalRange.sX = Math.min(this.totalRange.sX, this.scale().transform(scaleTotalRange.min) * this.dataBounds.width);
    this.totalRange.eX = Math.max(this.totalRange.eX, this.scale().transform(scaleTotalRange.max) * this.dataBounds.width);

    //region upper range and event overlap calculation
    var rangeSeries = [];

    var intersectionsUpper = new anychart.timelineModule.Intersections();

    for (var i = 0; i < intersectingBoundsRangeUp.length; i++) {
      var range = intersectingBoundsRangeUp[i];

      /*
      Note! Per point zIndex doesn't work cross series. We have to set zIndexes by series first
      and then inside series we can use per point zIndex.
       */
      if (!rangeSeries.includes(range.series)) {
        range.series.zIndex(anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - rangeSeries.length / 100);
        rangeSeries.push(range.series);
      }

      var id = range.pointId;
      var drawingPlanData = range.drawingPlan.data[id];
      intersectionsUpper.add(range, true);
      this.enlargeTotalRange_(range);
      drawingPlanData.meta['startY'] = range.sY;
      drawingPlanData.meta['endY'] = range.eY;
      drawingPlanData.meta['stateZIndex'] = 1 - range.eY / 1000000;
    }

    for (var i = intersectingBoundsEventUp.length - 1; i >= 0; i--) {
      var range = intersectingBoundsEventUp[i];
      var id = range.pointId;
      intersectionsUpper.add(range);
      this.enlargeTotalRange_(range);
      var drawingPlanData = range.drawingPlan.data[id];
      drawingPlanData.meta['minLength'] = range.sY + (range.eY - range.sY) / 2;
    }
    //endregion

    //region lower range and event overlap calculation
    var intersectionsLower = new anychart.timelineModule.Intersections();

    rangeSeries = [];
    for (var i = 0; i < intersectingBoundsRangeDown.length; i++) {
      var range = intersectingBoundsRangeDown[i];

      /*
      Note! Per point zIndex doesn't work cross series. We have to set zIndexes by series first
      and then inside series we can use per point zIndex.
       */
      if (!rangeSeries.includes(range.series)) {
        range.series.zIndex(anychart.timelineModule.Chart.RANGE_BASE_Z_INDEX - rangeSeries.length / 100);
        rangeSeries.push(range.series);
      }

      var id = range.pointId;
      var drawingPlanData = range.drawingPlan.data[id];
      intersectionsLower.add(range, true);
      drawingPlanData.meta['startY'] = range.sY;
      drawingPlanData.meta['endY'] = range.eY;
      drawingPlanData.meta['stateZIndex'] = 1 - range.eY / 1000000;
      this.enlargeTotalRange_({sX: range.sX, eX: range.eX, sY: -range.eY, eY: -range.sY});
    }

    for (var i = intersectingBoundsEventDown.length - 1; i >= 0; i--) {
      var range = intersectingBoundsEventDown[i];
      var id = range.pointId;
      intersectionsLower.add(range);
      var drawingPlanData = range.drawingPlan.data[id];
      drawingPlanData.meta['minLength'] = range.sY + (range.eY - range.sY) / 2;
      this.enlargeTotalRange_({sX: range.sX, eX: range.eX, sY: -range.eY, eY: -range.sY});
    }
    //endregion

    if (this.autoChartTranslating) {
      //fixing white space under the axis
      if (this.totalRange.sY > -(this.dataBounds.height / 2) && this.totalRange.eY > (this.dataBounds.height / 2)) {
        this.verticalTranslate = this.totalRange.sY + this.dataBounds.height / 2;
        this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);
      } else if (this.totalRange.eY < (this.dataBounds.height / 2) && this.totalRange.sY < -(this.dataBounds.height / 2)) {//white space over the axis
        this.verticalTranslate = this.totalRange.eY - this.dataBounds.height / 2;
        this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);
      }
    }

  }
};


anychart.timelineModule.Chart.prototype.enlargeTotalRange_ = function(range) {
  this.totalRange.sX = Math.min(this.totalRange.sX, range.sX);
  this.totalRange.eX = Math.max(this.totalRange.eX, range.eX);
  this.totalRange.sY = Math.min(this.totalRange.sY, range.sY);
  this.totalRange.eY = Math.max(this.totalRange.eY, range.eY);
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
    var matrix = this.timelineLayer.getTransformationMatrix();
    matrix[4] = -this.horizontalTranslate;
    matrix[5] = this.verticalTranslate;
    this.timelineLayer.setTransformationMatrix.apply(this.timelineLayer, matrix);
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
  var range = this.scale().getRange();
  var totalRange = this.scale().getTotalRange();
  var ratio = 0.1;//how much of current range we want to cut after zoom
  var matrix;

  var dx = event['deltaX'];
  var dy = event['deltaY'];

  if (goog.userAgent.WINDOWS) {
    dx *= 15;
    dy *= 15;
  }

  if (event['shiftKey'] && this.interactivity().getOption('zoomOnMouseWheel')) {//zooming
    var zoomIn = event['deltaY'] < 0;
    if ((range['min']) <= totalRange['min'] && (range['max']) >= totalRange['max'] && !zoomIn)
      return;

    var cutOutPart = (range['max'] - range['min']) * ratio;
    var mouseX = event['clientX'];
    var currentDate = this.scale().inverseTransform((mouseX + this.horizontalTranslate) / this.dataBounds.width);
    var leftDate = this.scale().inverseTransform(this.horizontalTranslate / this.dataBounds.width);
    var rightDate = this.scale().inverseTransform((this.horizontalTranslate + this.dataBounds.width) / this.dataBounds.width);

    this.suspendSignalsDispatching();
    this.zoomTo(currentDate - ((currentDate - leftDate) * 0.9),
        currentDate + ((rightDate - currentDate) * 0.9));
    this.horizontalTranslate = 0;
    this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);
    this.resumeSignalsDispatching(true);
  } else if (!event['shiftKey'] && this.interactivity().getOption('scrollOnMouseWheel')) {//scrolling
    this.autoChartTranslating = false;
    var preventDefault = true;

    matrix = this.timelineLayer.getTransformationMatrix();
    this.horizontalTranslate += dx;
    this.verticalTranslate -= dy;

    if (dx != 0) {
      if (this.horizontalTranslate + this.dataBounds.getRight() > this.totalRange.eX) {
        this.horizontalTranslate = (this.totalRange.eX - this.dataBounds.getRight());
        preventDefault = false;
      }
      else if (this.horizontalTranslate + this.dataBounds.getLeft() < this.totalRange.sX) {
        this.horizontalTranslate = (this.totalRange.sX - this.dataBounds.getLeft());
        preventDefault = false;
      }
    }

    if (dy != 0) {
      if (this.verticalTranslate + this.dataBounds.height / 2 > Math.max(this.totalRange.eY, (this.dataBounds.height / 2))) {
        this.verticalTranslate = Math.max(this.totalRange.eY, (this.dataBounds.height / 2)) - this.dataBounds.height / 2;
        preventDefault = false;
      }
      else if (this.verticalTranslate - this.dataBounds.height / 2 < Math.min(this.totalRange.sY, -(this.dataBounds.height / 2))) {
        this.verticalTranslate = Math.min(this.totalRange.sY, -(this.dataBounds.height / 2)) + this.dataBounds.height / 2;
        preventDefault = false;
      }
    }

    if (preventDefault) {
      event.preventDefault();
    }

    this.invalidateState(anychart.enums.Store.TIMELINE_CHART, anychart.timelineModule.Chart.States.SCROLL, anychart.Signal.NEEDS_REDRAW);
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
  this.invalidate(anychart.ConsistencyState.SCALE_CHART_SCALES | anychart.ConsistencyState.AXES_CHART_AXES, anychart.Signal.NEEDS_REDRAW);
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
  return this;
};


/**
 * Reset zoom/scroll manipulations.
 */
anychart.timelineModule.Chart.prototype.fit = function() {
  this.suspendSignalsDispatching();
  this.horizontalTranslate = 0;
  this.verticalTranslate = 0;
  this.scale().fitAll();
  this.timelineLayer.setTransformationMatrix.apply(this.timelineLayer, this.baseTransform);// cleaning up transformations
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

  goog.disposeAll(this.axis_, this.xScale_, this.yScale_, this.lineAxesMarkers_, this.textAxesMarkers_, this.rangeAxesMarkers_, this.timelineLayer);
  this.axis_ = null;
  this.xScale_ = null;
  this.yScale_ = null;
  this.lineAxesMarkers_.length = 0;
  this.textAxesMarkers_.length = 0;
  this.rangeAxesMarkers_.length = 0;
  this.timelineLayer = null;
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
