goog.provide('anychart.timelineModule.series.Range');

goog.require('anychart.timelineModule.drawers.Event');
goog.require('anychart.timelineModule.drawers.Range');
goog.require('anychart.timelineModule.series.Base');



/**
 * @param {!anychart.core.IChart} chart
 * @param {!anychart.core.IPlot} plot
 * @param {string} type
 * @param {anychart.core.series.TypeConfig} config
 * @param {boolean} sortedMode
 * @constructor
 * @extends {anychart.timelineModule.series.Base}
 */
anychart.timelineModule.series.Range = function(chart, plot, type, config, sortedMode) {
  anychart.timelineModule.series.Range.base(this, 'constructor', chart, plot, type, config, sortedMode);

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', 0, 0]
  ]);
};
goog.inherits(anychart.timelineModule.series.Range, anychart.timelineModule.series.Base);


/**
 * Range series property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.HEIGHT
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.series.Range, anychart.timelineModule.series.Range.PROPERTY_DESCRIPTORS);


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.pushSeriesBasedPointData = function(data, dataPusher, xNormalizer) {
  var dataSource = /** @type {anychart.data.IView} */(this.data());
  var iterator = dataSource.getIterator();

  while (iterator.advance()) {
    var start = xNormalizer(iterator.get('start'));
    var end = xNormalizer(iterator.get('end'));
    var pointData = {};
    var meta = {};
    pointData['start'] = start;
    pointData['end'] = end;
    meta['rawIndex'] = iterator.getIndex();
    dataPusher(data, {data: pointData, meta: meta});
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.makePointMeta = function(rowInfo, yNames, yColumns) {
  var startXRatio = this.getXScale().transform(rowInfo.get('start'));
  var endXRatio = this.getXScale().transform(rowInfo.get('end'));
  rowInfo.meta('startXRatio', startXRatio);
  rowInfo.meta('endXRatio', endXRatio);
  for (var i = 0; i < this.metaMakers.length; i++) {
    this.metaMakers[i].call(this, rowInfo, yNames, yColumns, 0);
  }
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.makeTimelineMeta = function(rowInfo, yNames, yColumns, pointMissing, xRatio) {
  anychart.timelineModule.series.Range.base(this, 'makeTimelineMeta', rowInfo, yNames, yColumns, pointMissing, xRatio);
  var bounds = this.parentBounds();
  var startXRatio = /** @type {number} */(rowInfo.meta('startXRatio'));
  var startX = bounds.left + bounds.width * startXRatio;
  var endXRatio = rowInfo.meta('endXRatio');
  if (!goog.isNumber(endXRatio) || isNaN(endXRatio)) {
    endXRatio = 1;
  }
  var endX = bounds.left + bounds.width * endXRatio;
  rowInfo.meta('startX', startX);
  rowInfo.meta('endX', endX);

  var height = anychart.utils.normalizeSize(/** @type {number} */(this.getOption('height')), bounds.height);
  rowInfo.meta('height', height);
};


/** @inheritDoc */
anychart.timelineModule.series.Range.prototype.createPositionProvider = function(position, opt_shift3d) {
  var iterator = this.getIterator();
  var x, y;
  var height = /** @type {number} */(iterator.meta('height'));
  var stackLevel = /** @type {number} */(iterator.meta('stackLevel'));
  var zero = /** @type {number} */(iterator.meta('zero'));
  var startX = /** @type {number} */(iterator.meta('startX'));
  var direction = /** @type {anychart.enums.EventMarkerDirection} */(this.getFinalDirection());

  if (direction == anychart.enums.EventMarkerDirection.AUTO) {
    direction = anychart.enums.EventMarkerDirection.UP;
  }

  var yOffset = height * (stackLevel - 1) + height / 2;
  x = startX;
  y = zero + (direction == anychart.enums.EventMarkerDirection.UP ? -yOffset : yOffset);
  var point = {'x': x, 'y': y};
  return {'value': point};
};
