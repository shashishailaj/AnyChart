goog.provide('anychart.timelineModule.Axis');

goog.require('anychart.core.VisualBase');


/**
 * Timeline Axis class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.timelineModule.Axis = function() {
  anychart.timelineModule.Axis.base(this, 'constructor');

  this.scale_ = null;
};
goog.inherits(anychart.timelineModule.Axis, anychart.core.VisualBase);


/**
 *
 * @param {Object=} opt_value
 * @return {*}
 */
anychart.timelineModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.scale_) {
      this.scale_ = opt_value;
    }
    return this;
  }

  return this.scale_;
};