goog.provide('anychart.graphModule.elements.Group');

goog.require('anychart.graphModule.elements.Base');



/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.graphModule.elements.Base}
 * */
anychart.graphModule.elements.Group = function(chart) {
  anychart.graphModule.elements.Group.base(this, 'constructor', chart);

};
goog.inherits(anychart.graphModule.elements.Group, anychart.graphModule.elements.Base);


/**
 * Labels signal listener.
 * Proxy signal to chart.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 * */
anychart.graphModule.elements.Group.prototype.labelsInvalidated_ = function(event) {

  this.dispatchSignal(event.signals);
};
