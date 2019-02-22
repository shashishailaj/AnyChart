goog.provide('anychart.timelineModule.Axis');

goog.require('anychart.core.VisualBase');


/**
 * Timeline Axis class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.timelineModule.Axis = function() {
  anychart.timelineModule.Axis.base(this, 'constructor');

  this.height_ = 10;
};
goog.inherits(anychart.timelineModule.Axis, anychart.core.VisualBase);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.timelineModule.Axis.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.AXIS_TITLE |
        anychart.ConsistencyState.AXIS_LABELS |
        anychart.ConsistencyState.AXIS_TICKS;


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


/**
 * Timeline axis drawing.
 * @return {anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.draw = function() {
  var scale = this.scale();

  if (!scale) {
    anychart.core.reporting.error(anychart.enums.ErrorCode.SCALE_NOT_SET);
    return this;
  }

  if (!this.checkDrawingNeeded()) {
    return this;
  }

  if (!this.rootElement) {
    this.rootElement = this.container().layer();
    if (!this.line_) {
      this.line_ = this.rootElement.path();
    }
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.rootElement.zIndex(this.zIndex());
  }

  var bounds = this.parentBounds();
  var center = bounds.top + bounds.height / 2;

  var halfHeight = this.height_ / 2;
  this.line_.clear();
  this.line_.moveTo(bounds.left, center - halfHeight).
      lineTo(bounds.getRight(), center - halfHeight).
      lineTo(bounds.getRight(), center + halfHeight).
      lineTo(bounds.left, center + halfHeight).close();
  this.line_.stroke('black');

  return this;
};


/** @inheritDoc */
anychart.timelineModule.Axis.prototype.checkDrawingNeeded = function() {
  if (this.isConsistent())
    return false;

  if (!this.enabled()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
      this.remove();
      // this.markConsistent(anychart.ConsistencyState.ENABLED);
      // this.title().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.ticks().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.minorTicks().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.labels().invalidate(anychart.ConsistencyState.CONTAINER);
      // this.minorLabels().invalidate(anychart.ConsistencyState.CONTAINER);
      this.invalidate(
          anychart.ConsistencyState.CONTAINER |
          anychart.ConsistencyState.AXIS_TITLE |
          anychart.ConsistencyState.AXIS_TICKS |
          anychart.ConsistencyState.AXIS_LABELS
      );
    }
    return false;
  }
  this.markConsistent(anychart.ConsistencyState.ENABLED);
  return true;
};