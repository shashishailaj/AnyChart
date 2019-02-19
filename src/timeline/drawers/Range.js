goog.provide('anychart.timelineModule.drawers.Range');


//region -- Requirements.
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');



//endregion
//region -- Constructor.
/**
 * Timeline series Range drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.timelineModule.drawers.Range = function(series) {
  anychart.timelineModule.drawers.Range.base(this, 'constructor', series);
};
goog.inherits(anychart.timelineModule.drawers.Range, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE] = anychart.timelineModule.drawers.Range;


//endregion
anychart.timelineModule.drawers.Event.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE;
