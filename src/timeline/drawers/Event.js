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
anychart.timelineModule.drawers.Event.prototype.type = anychart.enums.SeriesDrawerTypes.EVENT;
