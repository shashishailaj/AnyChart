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
  this.drawingPlansEvent = [];


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
  }

  //region populate array of intersecting bounds
  /** @type {anychart.timelineModule.Chart.SeriesIntersectionBounds} */

  var pointBounds;
  var sX, eX, sY, eY, direction, pointId;
  var k, point;
  var data;
  for (var i = 0; i < this.drawingPlansRange.length; i++) {
    var drawingPlan = this.drawingPlansRange[i];
    data = drawingPlan.data;
    series = drawingPlan.series;
    for (k = 0; k < data.length; k++) {
      point = data[k];
      sX = this.scale().transform(point.data['start']) * this.dataBounds.width;
      eX = this.scale().transform(point.data['end']) * this.dataBounds.width;
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

      // todo(i.kurnoy) temporary!!!!!
      point.meta['stackLevel'] = 1;
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

      //todo(i.kurnoy) temporary!!!!!!
      point.meta['minLength'] = 50;
    }
  }
  //endregion
  debugger;

  var sortCallback = function(a, b) {
    var diff = a.sX - b.sX;
    if (diff == 0) {
      return b.eX - a.eX;
    }
    return diff;
  };

  goog.array.sort(intersectingBoundsRangeUp, sortCallback);
  goog.array.sort(intersectingBoundsRangeDown, sortCallback);

  this.stackRanges(intersectingBoundsRangeUp);
  this.stackRanges(intersectingBoundsRangeDown);

  var eventSortCallback = function(a, b) {
    var diff = a.sX - b.sX;
    if (diff == 0) {
      return a.eX - b.eX;
    }
    return diff;
  };
  goog.array.sort(intersectingBoundsEventUp, eventSortCallback);
  goog.array.sort(intersectingBoundsEventDown, eventSortCallback);

  var intersections = new anychart.timelineModule.Intersections();
  for (var i = 0; i < intersectingBoundsRangeUp.length; i++) {
    var range = intersectingBoundsRangeUp[i];
    var id = range.pointId;
    intersections.add(range);
    var drawingPlanData = range.drawingPlan.data[id];
    drawingPlanData.meta['startY'] = range.sY;
    drawingPlanData.meta['endY'] = range.eY;
  }

  for (var i = intersectingBoundsEventUp.length - 1; i >= 0; i--) {
    var range = intersectingBoundsEventUp[i];
    var id = range.pointId;
    intersections.add(range);
    var drawingPlanData = range.drawingPlan.data[id];
    drawingPlanData.meta['minLength'] = range.sY + (range.eY - range.sY) / 2;
  }


  // console.timeStamp('Start');
  // this.stackOverlapEvents(intersectingBoundsEventUp, intersectingBoundsRangeUp);
  // console.timeStamp('End');
  // this.stackOverlapEvents(intersectingBoundsEventDown, intersectingBoundsRangeDown);
};


/**
 *
 * @param {Array.<anychart.timelineModule.Chart.SeriesIntersectionBounds>} ranges sorted array of range series point bounds
 */
anychart.timelineModule.Chart.prototype.stackRanges = function(ranges) {
  for (var i = 0; i < ranges.length; i++) {
    var currentPoint = ranges[i];
    var previousIntersecting = [];
    var maxStack = 0;

    for (var k = 0; k < i; k++) {
      if (ranges[k].sX < currentPoint.sX && (ranges[k].eX > currentPoint.sX || isNaN(ranges[k].eX)) ||
          (ranges[k].sX == currentPoint.sX && ranges[k].eX == currentPoint.eX)) {
        previousIntersecting.push(ranges[k]);
        var id = ranges[k].pointId;
        var stack = ranges[k].drawingPlan.data[id].meta['stackLevel'];
        if (stack > maxStack) {
          maxStack = stack;
        }
      }
    }

    maxStack++;
    currentPoint.drawingPlan.data[currentPoint.pointId].meta['stackLevel'] = maxStack;
    currentPoint.eY = maxStack * (currentPoint.eY - currentPoint.sY);
    currentPoint.drawingPlan.data[currentPoint.pointId].meta['stateZIndex'] = 1 - maxStack / 1000;
  }
};


/**
 * Events and ranges should be of one direction.
 * @param {Array.<anychart.timelineModule.Chart.SeriesIntersectionBounds>} events
 * @param {Array.<anychart.timelineModule.Chart.SeriesIntersectionBounds>} ranges
 */
anychart.timelineModule.Chart.prototype.stackOverlapEvents = function(events, ranges) {
  /**
   * debug range: {min: 1030110818057.4343, max: 1327969734452.1423}
   * and take a look at "28 Days Later" in the left part
   * chart.zoomTo(1030110818057.4343, 1327969734452.1423)
   */
  /**
   *
   * @param {{sY: number, eY: number}} a
   * @param {{sY: number, eY: number}} b
   * @return {boolean}
   */
  var checkYIntersection = function(a, b) {
    var intersect = (a.sY <= b.eY && a.sY >= b.sY) || (a.eY <= b.eY && a.eY >= b.sY) ||
        (b.sY <= a.eY && b.sY >= a.sY) || (b.eY <= a.eY && b.eY >= a.sY);
    return intersect;
  };
  //check case, when there is one event and some ranges, that should up the event
  if (events.length >= 1) {
    /*
    Here we start from the item before last and go to the first one (backwards),
    checking intersections with items in front of us.
    */
    for (var i = events.length - 1; i >= 0; i--) {
      var currentPoint = events[i];
      var intersections = [];
      var maxY = -Infinity;
      var maxYRange = 0; //heighest range for given event labels box
      for (var k = i + 1; k < events.length; k++) {
        var pointToCompare = events[k];
        if ((pointToCompare.sX <= currentPoint.eX && pointToCompare.sX >= currentPoint.sX) ||//find intersections over x axis
            (pointToCompare.eX <= currentPoint.eX && pointToCompare.eX >= currentPoint.sX)) {
          intersections.push(pointToCompare);
          if (pointToCompare.eY > maxY)
            maxY = pointToCompare.eY;
        }
      }

      for (var ri = 0; ri < ranges.length; ri++) {
        // intersections with ranges
        var pointToCompare = ranges[ri];
        if (((currentPoint.sX <= pointToCompare.eX || isNaN(pointToCompare.eX)) && currentPoint.sX >= pointToCompare.sX) ||
            ((currentPoint.eX <= pointToCompare.eX || isNaN(pointToCompare.eX)) && currentPoint.eX >= pointToCompare.sX) ||
            (pointToCompare.sX <= currentPoint.eX && pointToCompare.sX >= currentPoint.sX) ||
            (pointToCompare.eX <= currentPoint.eX && pointToCompare.eX >= currentPoint.sX)) {
          // intersections.push(pointToCompare);
          if (pointToCompare.eY > maxYRange)
            maxYRange = pointToCompare.eY;
        }
      }

      //checking if we can put currentPoint somewhere down, to not grow very tall event grass
      goog.array.sort(intersections, function(a, b) {
        return a.sY - b.sY;
      });
      var yDelta = currentPoint.eY - currentPoint.sY;
      var okBox = {
        sY: maxYRange + 3,
        eY: maxYRange + yDelta + 3,
        sX: currentPoint.sX,
        eX: currentPoint.eX
      };
      for (var ii = 0; ii < intersections.length; ii++) {
        var currentIntersectionPoint = intersections[ii];
        if (checkYIntersection(okBox, currentIntersectionPoint)) {
          okBox.sY = currentIntersectionPoint.eY + 3;
          okBox.eY = okBox.sY + yDelta + 3;
        }
      }

      maxY = okBox.sY;

      if (maxYRange > maxY)
        maxY = maxYRange;

      yDelta = currentPoint.eY - currentPoint.sY;
      currentPoint.sY = maxY;
      currentPoint.eY = maxY + yDelta;
      currentPoint.drawingPlan.data[currentPoint.pointId].meta['minLength'] = maxY + yDelta / 2;
    }
  }
};


/** @typedef {{
 * sX: number,
 * eX: number,
 * sY: number,
 * eY: number,
 * direction: anychart.enums.EventMarkerDirection,
 * series: anychart.core.series.Base,
 * pointId: number,
 * drawingPlan: Object
 * }}
 */
anychart.timelineModule.Chart.SeriesIntersectionBounds;


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
  var range = this.scale().getRange();
  var totalRange = this.scale().getTotalRange();
  var ratio = 0.1;//how much of current range we want to cut after zoom
  var matrix;
  if (event['shiftKey'] && this.interactivity().getOption('zoomOnMouseWheel')) {//zooming
    var zoomIn = event['deltaY'] < 0;
    if ((range['min']) <= totalRange['min'] && (range['max']) >= totalRange['max'] && !zoomIn)
      return;

    var cutOutPart = (range['max'] - range['min']) * ratio;
    var mouseX = event['clientX'];
    mouseX -= this.dataBounds.left;
    var currentDate = this.scale().inverseTransform(mouseX / this.dataBounds.width);

    var leftDelta, rightDelta;
    if (currentDate - range['min'] !== range['max'] - currentDate) {
      leftDelta = cutOutPart * ((currentDate - range['min']) / (range['max'] - range['min']));
      rightDelta = cutOutPart - leftDelta;
    } else {
      leftDelta = rightDelta = cutOutPart / 2;
    }
    rightDelta = -rightDelta;
    if (event['deltaY'] > 0) {
      leftDelta = -leftDelta;
      rightDelta = -rightDelta;
    }
    this.zoomTo(range['min'] + leftDelta, range['max'] + rightDelta);
  } else if (!event['shiftKey'] && this.interactivity().getOption('scrollOnMouseWheel')) {//scrolling
    var horizontalScroll = event['deltaX'] != 0;
    var verticalScroll = event['deltaY'] != 0;
    var horizontalScrollForward = horizontalScroll && event['deltaX'] > 0;
    var verticalScrollDown = verticalScroll && event['deltaY'] > 0;

    matrix = this.timelineLayer.getTransformationMatrix();
    if (horizontalScroll) {
      if (horizontalScrollForward) {
        matrix[4] -= 0.1 * (matrix[3] * this.dataBounds.width);
        // if (matrix[4] < -(matrix[3] * this.dataBounds.width - this.dataBounds.width))
        //   matrix[4] = -(matrix[3] * this.dataBounds.width - this.dataBounds.width);
      } else {
        matrix[4] += 0.1 * (matrix[3] * this.dataBounds.width);
        // if (matrix[4] > 0)
        //   matrix[4] = 0;
      }
    }

    if (verticalScroll) {
      if (verticalScrollDown) {
        matrix[5] -= 0.1 * (matrix[0] * this.dataBounds.height);
        // if (matrix[5] < -(matrix[0] * this.dataBounds.height - this.dataBounds.height))
        //   matrix[5] = -(matrix[0] * this.dataBounds.height - this.dataBounds.height);
      } else {
        matrix[5] += 0.1 * (matrix[0] * this.dataBounds.height);
        // if (matrix[5] > 0)
        //   matrix[5] = 0;
      }
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
