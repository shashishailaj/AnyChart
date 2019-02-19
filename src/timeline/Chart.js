goog.provide('anychart.timelineModule.Chart');


//region -- Requirements.
goog.require('anychart.core.ChartWithSeries');
goog.require('anychart.core.IChart');
goog.require('anychart.core.IPlot');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.timelineModule.Series');



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
};
goog.inherits(anychart.timelineModule.Chart, anychart.core.ChartWithSeries);


//endregion
//region -- Consistency states and signals.
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.ChartWithSeries.prototype.SUPPORTED_CONSISTENCY_STATES; //TODO (A.Kudryavtsev): States TBA.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


//endregion
//region -- Descriptors.


//endregion
//region -- Chart Infrastructure Overrides.
//TODO (A.Kudryavtsev): TBA
/** @inheritDoc */
anychart.timelineModule.Chart.prototype.createSeriesInstance = function(type, config) {
  return new anychart.timelineModule.Series(this, this, type, config, true);
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
      anychart.core.series.Capabilities.SUPPORTS_MARKERS |
      anychart.core.series.Capabilities.SUPPORTS_LABELS | 0);


  // res[anychart.enums.CartesianSeriesType.AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,
  //
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeFillConfig,
  //
  //     anychart.core.shapeManagers.pathHatchConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.BAR] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig,
  //
  //     anychart.core.shapeManagers.pathRisingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathFallingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.BOX] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.BOX,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //     anychart.core.shapeManagers.pathMedianStrokeConfig,
  //     anychart.core.shapeManagers.pathStemStrokeConfig,
  //     anychart.core.shapeManagers.pathWhiskerStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'highest',
  //   anchoredPositionBottom: 'lowest'
  // };
  // res[anychart.enums.CartesianSeriesType.BUBBLE] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.BUBBLE,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.circleFillStrokeConfig,
  //     anychart.core.shapeManagers.circleHatchConfig,
  //     anychart.core.shapeManagers.circleNegativeFillStrokeConfig,
  //     anychart.core.shapeManagers.circleNegativeHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.CANDLESTICK] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.CANDLESTICK,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathRisingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathFallingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.COLUMN] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.COLUMN,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig,
  //
  //     anychart.core.shapeManagers.pathRisingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathFallingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.JUMP_LINE] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.JUMP_LINE,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathNegativeStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.LINE] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.LINE,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.MARKER] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.MARKER,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathNegativeFillStrokeConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig,
  //
  //     anychart.core.shapeManagers.pathRisingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathFallingFillStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: (
  //   anychart.core.series.Capabilities.ALLOW_INTERACTIVITY |
  //   anychart.core.series.Capabilities.ALLOW_POINT_SETTINGS |
  //   anychart.core.series.Capabilities.ALLOW_ERROR |
  //   // anychart.core.series.Capabilities.SUPPORTS_MARKERS |
  //   anychart.core.series.Capabilities.SUPPORTS_LABELS |
  //   0),
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.OHLC] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.OHLC,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.RANGE_AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathLowStrokeConfig,
  //     anychart.core.shapeManagers.pathHighStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathHighFillConfig,
  //     anychart.core.shapeManagers.pathLowFillConfig,
  //     anychart.core.shapeManagers.pathHighHatchConfig,
  //     anychart.core.shapeManagers.pathLowHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.RANGE_BAR] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathHighFillStrokeConfig,
  //     anychart.core.shapeManagers.pathLowFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHighHatchConfig,
  //     anychart.core.shapeManagers.pathLowHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.RANGE_COLUMN] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_COLUMN,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathHighFillStrokeConfig,
  //     anychart.core.shapeManagers.pathLowFillStrokeConfig,
  //     anychart.core.shapeManagers.pathHighHatchConfig,
  //     anychart.core.shapeManagers.pathLowHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.RANGE_SPLINE_AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathHighStrokeConfig,
  //     anychart.core.shapeManagers.pathLowStrokeConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //
  //     anychart.core.shapeManagers.pathHighFillConfig,
  //     anychart.core.shapeManagers.pathLowFillConfig,
  //     anychart.core.shapeManagers.pathHighHatchConfig,
  //     anychart.core.shapeManagers.pathLowHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.RANGE_STEP_AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathHatchConfig,
  //     // anychart.core.shapeManagers.pathHighFillConfig,
  //     // anychart.core.shapeManagers.pathLowFillConfig,
  //     anychart.core.shapeManagers.pathHighStrokeConfig,
  //     anychart.core.shapeManagers.pathLowStrokeConfig
  //     // anychart.core.shapeManagers.pathHighHatchConfig,
  //     // anychart.core.shapeManagers.pathLowHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };
  // res[anychart.enums.CartesianSeriesType.SPLINE] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.SPLINE,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.SPLINE_AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.SPLINE_AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,
  //
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeFillConfig,
  //
  //     anychart.core.shapeManagers.pathHatchConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.STEP_AREA] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.STEP_AREA,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig,
  //
  //     anychart.core.shapeManagers.pathFillConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingFillConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeFillConfig,
  //
  //     anychart.core.shapeManagers.pathHatchConfig,
  //     anychart.core.shapeManagers.pathFallingHatchConfig,
  //     anychart.core.shapeManagers.pathRisingHatchConfig,
  //     anychart.core.shapeManagers.pathNegativeHatchConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.STEP_LINE] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.STEP_LINE,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_SERIES,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathContiniousNegativeStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'value'
  // };
  // res[anychart.enums.CartesianSeriesType.STICK] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.STICK,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //     anychart.core.shapeManagers.pathFallingStrokeConfig,
  //     anychart.core.shapeManagers.pathRisingStrokeConfig,
  //     anychart.core.shapeManagers.pathNegativeStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'value',
  //   anchoredPositionBottom: 'zero'
  // };
  // res[anychart.enums.CartesianSeriesType.HILO] = {
  //   drawerType: anychart.enums.SeriesDrawerTypes.RANGE_STICK,
  //   shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
  //   shapesConfig: [
  //     anychart.core.shapeManagers.pathStrokeConfig,
  //
  //     anychart.core.shapeManagers.pathHighStrokeConfig,
  //     anychart.core.shapeManagers.pathLowStrokeConfig
  //   ],
  //   secondaryShapesConfig: null,
  //   postProcessor: null,
  //   capabilities: capabilities,
  //   anchoredPositionTop: 'high',
  //   anchoredPositionBottom: 'low'
  // };



  res[anychart.enums.TimelineSeriesType.EVENT] = {
    drawerType: anychart.enums.SeriesDrawerTypes.EVENT,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig
    ],
    secondaryShapesConfig: null,
    postProcessor: null,
    capabilities: capabilities,
    anchoredPositionTop: 'auto',
    anchoredPositionBottom: 'zero'
  };

  res[anychart.enums.TimelineSeriesType.RANGE] = {
    drawerType: anychart.enums.SeriesDrawerTypes.RANGE,
    shapeManagerType: anychart.enums.ShapeManagerTypes.PER_POINT,
    shapesConfig: [
      anychart.core.shapeManagers.pathStrokeConfig,
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHatchConfig
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
  //TODO (A.Kudryavtsev): TBA.
  anychart.timelineModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.timelineModule.Chart.prototype;
  // proto['method'] = proto.method;
})();
//exports

//endregion
