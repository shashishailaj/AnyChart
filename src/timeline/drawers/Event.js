goog.provide('anychart.timelineModule.drawers.Event');


//region -- Requirements.
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');



//endregion
//region -- Constructor.
/**
 * Timeline series Event drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.timelineModule.drawers.Event = function(series) {
  anychart.timelineModule.drawers.Event.base(this, 'constructor', series);
};
goog.inherits(anychart.timelineModule.drawers.Event, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.EVENT] = anychart.timelineModule.drawers.Event;


//endregion
/** @inheritDoc */
anychart.timelineModule.drawers.Event.prototype.type = anychart.enums.SeriesDrawerTypes.EVENT;


/** @inheritDoc */
anychart.timelineModule.drawers.Event.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);

  var names = this.getShapeNames(value, this.prevValue);

  var shapeNames = {};
  shapeNames[names.stroke] = true;
  point.meta('names', names);
  var shapes = /** @type {Object.<acgraph.vector.Path>} */(shapesManager.getShapesGroup(state, shapeNames));

  this.drawPointShape(point, shapes[names.stroke]);
};


/**
 * Draws point.
 * @param {anychart.data.IRowInfo} point
 * @param {acgraph.vector.Path} path
 */
anychart.timelineModule.drawers.Event.prototype.drawPointShape = function(point, path) {
  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var length = /** @type {number} */(point.meta('length'));
  var thickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(path.stroke()));
  x = anychart.utils.applyPixelShift(x, thickness);
  anychart.core.drawers.move(path, this.isVertical, x, zero);
  anychart.core.drawers.line(path, this.isVertical, x, zero - length);
};
