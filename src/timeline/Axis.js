goog.provide('anychart.timelineModule.Axis');

goog.require('anychart.core.VisualBase');



/**
 * Timeline Axis class.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.timelineModule.Axis = function() {
  anychart.timelineModule.Axis.base(this, 'constructor');

  /**
   * Axis box height.
   * @type {number}
   * @private
   */
  this.height_ = 10;

  /**
   * Pixel coordinates of zero line.
   * Axis is drawn around this zero line.
   * @type {number}
   * @private
   */
  this.zero_ = 0;

  /**
   * Array of text elements for testing purpose.
   * @type {Array.<acgraph.vector.Text>}
   */
  this.testLabelsArray = [];


  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.timelineModule.Axis, anychart.core.VisualBase);


/**
 * Timeline Axis property descriptors.
 * @type {!Object<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.timelineModule.Axis.PROPERTY_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  var d = anychart.core.settings.descriptors;
  anychart.core.settings.createDescriptors(map, [
    d.STROKE,
    d.FILL
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.timelineModule.Axis, anychart.timelineModule.Axis.PROPERTY_DESCRIPTORS);


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
 * @return {anychart.scales.GanttDateTime|anychart.timelineModule.Axis}
 */
anychart.timelineModule.Axis.prototype.scale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.scale_) {
      if (this.scale_) {
        this.scale_.unlistenSignals(this.onScaleSignal_, this);
      }
      this.scale_ = opt_value;
      this.scale_.listenSignals(this.onScaleSignal_, this);

    }
    return this;
  }

  return this.scale_;
};


/**
 * Scale signals listener.
 * @private
 */
anychart.timelineModule.Axis.prototype.onScaleSignal_ = function() {
  this.invalidate(anychart.ConsistencyState.AXIS_TICKS, anychart.Signal.NEEDS_REDRAW);
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
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateZero();
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.AXIS_TICKS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.drawAxis();
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TICKS)) {
    this.drawTicks();
    this.markConsistent(anychart.ConsistencyState.AXIS_TICKS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_TITLE)) {

    this.markConsistent(anychart.ConsistencyState.AXIS_TITLE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.AXIS_LABELS)) {

    this.markConsistent(anychart.ConsistencyState.AXIS_LABELS);
  }
  return this;
};


/**
 * Calculate zero line position.
 */
anychart.timelineModule.Axis.prototype.calculateZero = function() {
  var bounds = this.parentBounds();
  this.zero_ = bounds.top + bounds.height / 2;
};


/**
 * Test draw ticks.
 */
anychart.timelineModule.Axis.prototype.drawTicks = function() {
  var ticksArray = this.scale().getSimpleTicks(anychart.enums.Interval.YEAR, 1);
  if (!this.ticksPath_) {
    this.ticksPath_ = this.rootElement.path();
  }

  this.ticksPath_.clear();
  this.ticksPath_.stroke('red');
  var bounds = this.parentBounds();
  for (var i = 0; i < ticksArray.length; i++) {
    var label = this.testLabelsArray[i];
    if (!label) {
      label = this.rootElement.text();
      this.testLabelsArray[i] = label;
    }
    label.parent(this.rootElement);
    var tick = ticksArray[i];
    var d = new Date(tick);
    var tickRatio = this.scale_.transform(tick);
    var tickX = bounds.left + bounds.width * tickRatio;

    this.ticksPath_.moveTo(tickX, this.zero_).lineTo(tickX, this.zero_ + this.height_ / 2);
    label.text(d.getFullYear().toString());
    label.x(tickX);
    label.y(this.zero_ - this.height_ / 2);
    label.selectable(false);
  }

  for (var i = ticksArray.length; i < this.testLabelsArray.length; i++) {
    this.testLabelsArray[i].remove();
  }
};


/**
 * Draws axis rectangle.
 */
anychart.timelineModule.Axis.prototype.drawAxis = function() {
  var bounds = this.parentBounds();
  var center = this.zero_;

  var halfHeight = this.height_ / 2;

  var stroke = /** @type {acgraph.vector.Stroke} */(this.getOption('stroke'));
  var fill = /** @type {acgraph.vector.Fill} */(this.getOption('fill'));

  var thickness = anychart.utils.extractThickness(stroke);

  var left = bounds.left;
  var right = bounds.getRight();
  var top = center - halfHeight;
  var bottom = center + halfHeight;

  left = anychart.utils.applyPixelShift(left, thickness);
  right = anychart.utils.applyPixelShift(right, thickness);
  top = anychart.utils.applyPixelShift(top, thickness);
  bottom = anychart.utils.applyPixelShift(bottom, thickness);

  this.line_.clear();
  this.line_.moveTo(left, top).
      lineTo(right, top).
      lineTo(right, bottom).
      lineTo(left, bottom).close();
  this.line_.stroke(stroke);
  this.line_.fill(fill);
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


/** @inheritDoc */
anychart.timelineModule.Axis.prototype.remove = function() {
  if (this.rootElement) {
    this.rootElement.parent(null);
  }
};
