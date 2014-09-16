goog.provide('anychart.elements.Separator');
goog.require('acgraph');
goog.require('anychart.VisualBase');
goog.require('anychart.color');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('anychart.utils');
goog.require('anychart.utils.Margin');



/**
 * Class for a separator element.
 * @constructor
 * @extends {anychart.VisualBase}
 */
anychart.elements.Separator = function() {
  goog.base(this);

  /**
   * Path of the separator.
   * @type {acgraph.vector.Path}
   * @private
   */
  this.path_ = null;

  /**
   * Separator fill.
   * @type {acgraph.vector.Fill}
   * @private
   */
  this.fill_;

  /**
   * Separator stroke.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_;

  /**
   * Drawer function.
   * @type {function(acgraph.vector.Path, anychart.math.Rect)}
   * @private
   */
  this.drawer_;

  /**
   * Width settings for the separator.
   * @type {number|string|null}
   * @private
   */
  this.width_ = null;

  /**
   * Height settings for the separator.
   * @type {number|string|null}
   * @private
   */
  this.height_ = null;

  /**
   * Separator margin.
   * @type {anychart.utils.Margin}
   */
  this.margin_;

  /**
   * Separator left position.
   * @type {number}
   * @private
   */
  this.actualLeft_ = NaN;

  /**
   * Separator top position.
   * @type {number}
   * @private
   */
  this.actualTop_ = NaN;

  /**
   * Parent bounds stored.
   * @type {anychart.math.Rect}
   * @private
   */
  this.parentBounds_ = null;

  /**
   * Pixel bounds due to orientation, margins, etc.
   * @type {anychart.math.Rect}
   * @private
   */
  this.pixelBounds_ = null;

  /**
   * Separator orientation.
   * @type {anychart.enums.Orientation}
   * @private
   */
  this.orientation_;

  this.restoreDefaults();

  this.invalidate(anychart.ConsistencyState.ALL);
};
goog.inherits(anychart.elements.Separator, anychart.VisualBase);


/**
 * Dispatched consistency states.
 * @type {number}
 */
anychart.elements.Separator.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBase.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.elements.Separator.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.BOUNDS;


/**
 * Gets/Sets bounds to calculate position.
 * @param {anychart.math.Rect=} opt_value .
 * @return {!anychart.elements.Separator|anychart.math.Rect} .
 */
anychart.elements.Separator.prototype.parentBounds = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parentBounds_ != opt_value) {
      this.parentBounds_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.parentBounds_;
};


/**
 * Getter for separator width.
 * @return {number|string|null} Current width.
 *//**
 * Setter for separator width.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.Separator} An instance of the {@link anychart.elements.Separator} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Separator|number|string|null} .
 */
anychart.elements.Separator.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.width_ != opt_value) {
      this.width_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.width_;
};


/**
 * Getter for separator height.
 * @return {number|string|null} Current height.
 *//**
 * Setter for separator height.
 * @param {(number|string|null)=} opt_value Value to set.
 * @return {!anychart.elements.Separator} An instance of the {@link anychart.elements.Separator} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string|null)=} opt_value .
 * @return {!anychart.elements.Separator|number|string|null} .
 */
anychart.elements.Separator.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.height_ != opt_value) {
      this.height_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.height_;
};


/**
 * Margin of the separator
 * @param {(string|number|anychart.utils.Space)=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.elements.Separator|anychart.utils.Margin} .
 */
anychart.elements.Separator.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.utils.Margin();
    this.registerDisposable(this.margin_);
    this.margin_.listenSignals(this.marginInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.set.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Orientation of the separator.
 * @param {(anychart.enums.Orientation|string)=} opt_value .
 * @return {!anychart.elements.Separator|anychart.enums.Orientation} .
 */
anychart.elements.Separator.prototype.orientation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeOrientation(opt_value);
    if (this.orientation_ != opt_value) {
      this.orientation_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.orientation_;
};


/**
 * Separator fill.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.elements.Separator)} .
 */
anychart.elements.Separator.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var val = acgraph.vector.normalizeFill.apply(null, arguments);
    if (!anychart.color.equals(val, this.fill_)) {
      this.fill_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.fill_ || 'none';
  }
};


/**
 * Separator stroke.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
 * @param {number=} opt_thickness .
 * @param {string=} opt_dashpattern .
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
 * @return {(!anychart.elements.Separator|acgraph.vector.Stroke)} .
 */
anychart.elements.Separator.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var val = acgraph.vector.normalizeStroke.apply(null, arguments);
    if (!anychart.color.equals(val, this.stroke_)) {
      this.stroke_ = val;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.stroke_ || 'none';
  }
};


/**
 * Getter for function drawing separator.
 * @return {function(acgraph.vector.Path, anychart.math.Rect)} Drawer function.
 *//**
 * Setter for function drawing separator.
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {!anychart.elements.Separator} An instance of the {@link anychart.elements.Separator} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {function(acgraph.vector.Path, anychart.math.Rect)=} opt_value Drawer function.
 * @return {(function(acgraph.vector.Path, anychart.math.Rect)|anychart.elements.Separator)} Drawer function or self for method chaining.
 */
anychart.elements.Separator.prototype.drawer = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.drawer_ != opt_value) {
      this.drawer_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.drawer_;
};


/**
 * Draw separator.
 * @return {!anychart.elements.Separator} {@link anychart.elements.Separator} instance for method chaining.
 */
anychart.elements.Separator.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  var isInitial = !this.path_;

  if (isInitial) {
    this.path_ = acgraph.path();
    this.registerDisposable(this.path_);
  }

  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateSeparatorBounds_();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    this.path_.fill(/** @type {acgraph.vector.Fill} */ (this.fill()));
    this.path_.stroke(/** @type {acgraph.vector.Stroke} */ (this.stroke()));
    this.path_.clear();

    var bounds = new anychart.math.Rect(this.actualLeft_, this.actualTop_, this.separatorWidth_, this.separatorHeight_);
    if (this.drawer_ && goog.isFunction(this.drawer_)) {
      this.drawer_(this.path_, bounds);
    }
    //    this.drawInternal(bounds);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.enabled()) this.path_.parent(container);
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    var zIndex = /** @type {number} */ (this.zIndex());
    this.path_.zIndex(zIndex);
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (manualSuspend) stage.resume();
  return this;
};


/** @inheritDoc */
anychart.elements.Separator.prototype.remove = function() {
  if (this.path_) this.path_.parent(null);
};


/**
 * Return separator content bounds.
 * @return {anychart.math.Rect} Separator content bounds.
 */
anychart.elements.Separator.prototype.getContentBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS))
    this.calculateSeparatorBounds_();
  return new anychart.math.Rect(0, 0, this.pixelBounds_.width, this.pixelBounds_.height);
};


/**
 * @return {!anychart.math.Rect} Parent bounds without the space used by the title.
 */
anychart.elements.Separator.prototype.getRemainingBounds = function() {
  if (!this.pixelBounds_ || this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.calculateSeparatorBounds_();
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }
  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_.clone();
  } else {
    var container = /** @type {acgraph.vector.ILayer} */(this.container());
    var stage = container ? container.getStage() : null;
    if (stage) {
      parentBounds = stage.getBounds(); // cloned already
    } else {
      return new anychart.math.Rect(0, 0, 0, 0);
    }
  }

  if (!this.enabled()) return parentBounds;

  switch (this.orientation_) {
    case anychart.enums.Orientation.TOP:
      parentBounds.top += this.pixelBounds_.height;
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.RIGHT:
      parentBounds.width -= this.pixelBounds_.width;
      break;
    case anychart.enums.Orientation.BOTTOM:
      parentBounds.height -= this.pixelBounds_.height;
      break;
    case anychart.enums.Orientation.LEFT:
      parentBounds.left += this.pixelBounds_.width;
      parentBounds.width -= this.pixelBounds_.width;
      break;
  }
  return parentBounds;
};


/**
 * Calculates actual size of the separator due to different sizing cases.
 * @private
 */
anychart.elements.Separator.prototype.calculateSeparatorBounds_ = function() {
  var container = /** @type {acgraph.vector.ILayer} */(this.container());
  var stage = container ? container.getStage() : null;

  var margin = this.margin();

  /** @type {anychart.math.Rect} */
  var parentBounds;
  if (this.parentBounds_) {
    parentBounds = this.parentBounds_;
  } else if (stage) {
    parentBounds = stage.getBounds();
  } else {
    parentBounds = null;
  }

  var parentWidth, parentHeight;
  if (parentBounds) {
    if (this.orientation_ == anychart.enums.Orientation.TOP ||
        this.orientation_ == anychart.enums.Orientation.BOTTOM) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    } else {
      parentWidth = parentBounds.height;
      parentHeight = parentBounds.width;
    }
  } else {
    parentWidth = parentHeight = undefined;
  }

  var width = anychart.utils.isNone(this.width_) ? '100%' : this.width_;
  var height = anychart.utils.isNone(this.height_) ? '100%' : this.height_;

  var separatorWidth = anychart.utils.normalizeSize(/** @type {number} */ (width), parentWidth);
  if (parentBounds && parentWidth < margin.widenWidth(separatorWidth)) {
    separatorWidth = margin.tightenWidth(parentWidth);
  }

  var separatorHeight = anychart.utils.normalizeSize(/** @type {number} */ (height), parentHeight);
  if (parentBounds && parentHeight < margin.widenHeight(separatorHeight)) {
    separatorHeight = margin.tightenHeight(parentHeight);
  }

  var widthWithMargin = margin.widenWidth(separatorWidth);
  var heightWithMargin = margin.widenHeight(separatorHeight);

  var leftMargin = anychart.utils.normalizeSize(/** @type {number} */ (margin.left()), parentWidth);
  var topMargin = anychart.utils.normalizeSize(/** @type {number} */ (margin.top()), parentHeight);

  if (parentBounds) {
    switch (this.orientation_) {
      case anychart.enums.Orientation.TOP:
        this.actualLeft_ = parentBounds.getLeft() + leftMargin;
        this.actualTop_ = parentBounds.getTop() + topMargin;
        this.separatorWidth_ = separatorWidth;
        this.separatorHeight_ = separatorHeight;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getTop(),
            widthWithMargin,
            heightWithMargin);
        break;

      case anychart.enums.Orientation.BOTTOM:
        this.actualLeft_ = parentBounds.getLeft() + leftMargin;
        this.actualTop_ = parentBounds.getBottom() - heightWithMargin + topMargin;
        this.separatorWidth_ = separatorWidth;
        this.separatorHeight_ = separatorHeight;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getBottom() - heightWithMargin,
            widthWithMargin,
            heightWithMargin);
        break;

      case anychart.enums.Orientation.LEFT:
        this.actualLeft_ = parentBounds.getLeft() + topMargin;
        this.actualTop_ = parentBounds.getBottom() - leftMargin - separatorWidth;
        this.separatorWidth_ = separatorHeight;
        this.separatorHeight_ = separatorWidth;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getLeft(),
            parentBounds.getTop(),
            heightWithMargin,
            widthWithMargin);
        break;

      case anychart.enums.Orientation.RIGHT:
        this.actualLeft_ = parentBounds.getRight() - topMargin - separatorHeight;
        this.actualTop_ = parentBounds.getTop() + leftMargin;
        this.separatorWidth_ = separatorHeight;
        this.separatorHeight_ = separatorWidth;

        this.pixelBounds_ = new anychart.math.Rect(
            parentBounds.getRight() - heightWithMargin,
            parentBounds.getTop(),
            heightWithMargin,
            widthWithMargin);
        break;
    }
  } else {
    this.actualLeft_ = leftMargin;
    this.actualTop_ = topMargin;
    switch (this.orientation_) {
      case anychart.enums.Orientation.TOP:
      case anychart.enums.Orientation.BOTTOM:
        this.pixelBounds_ = new anychart.math.Rect(0, 0, widthWithMargin, heightWithMargin);
        break;
      case anychart.enums.Orientation.LEFT:
      case anychart.enums.Orientation.RIGHT:
        this.pixelBounds_ = new anychart.math.Rect(0, 0, heightWithMargin, widthWithMargin);
        break;
    }
  }
};


/**
 * Listener for margin invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.elements.Separator.prototype.marginInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.APPEARANCE,
        anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Restore separator default settings.
 */
anychart.elements.Separator.prototype.restoreDefaults = function() {
  this.suspendSignalsDispatching();
  this.enabled(true)
      .margin(0, 3, 3, 3)
      .orientation(anychart.enums.Orientation.TOP)
      .width('100%')
      .height(1)
      .fill({
        'keys': [
          '0 #333333 0',
          '0.5 #333333 1',
          '1 #333333 0'
        ]
      })
      .stroke('none');

  this.drawer(function(path, bounds) {
    path
        .moveTo(bounds.left, bounds.top)
        .lineTo(bounds.getRight(), bounds.top)
        .lineTo(bounds.getRight(), bounds.getBottom())
        .lineTo(bounds.left, bounds.getBottom())
        .close();
  });
  this.resumeSignalsDispatching(true);
};


/**
 * @inheritDoc
 */
anychart.elements.Separator.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['width'] = this.width();
  json['height'] = this.height();
  json['orientation'] = this.orientation();
  json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  if (this.margin()) json['margin'] = this.margin().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.elements.Separator.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.width(config['width']);
  this.height(config['height']);
  this.orientation(config['orientation']);
  this.fill(config['fill']);
  this.stroke(config['stroke']);
  if (config['margin']) this.margin().deserialize(config['margin']);

  this.resumeSignalsDispatching(true);

  return this;
};


/**
 * Constructor function.
 * @return {!anychart.elements.Separator}
 */
anychart.elements.separator = function() {
  return new anychart.elements.Separator();
};


//exports
goog.exportSymbol('anychart.elements.separator', anychart.elements.separator);
anychart.elements.Separator.prototype['parentBounds'] = anychart.elements.Separator.prototype.parentBounds;
anychart.elements.Separator.prototype['width'] = anychart.elements.Separator.prototype.width;
anychart.elements.Separator.prototype['height'] = anychart.elements.Separator.prototype.height;
anychart.elements.Separator.prototype['margin'] = anychart.elements.Separator.prototype.margin;
anychart.elements.Separator.prototype['orientation'] = anychart.elements.Separator.prototype.orientation;
anychart.elements.Separator.prototype['fill'] = anychart.elements.Separator.prototype.fill;
anychart.elements.Separator.prototype['stroke'] = anychart.elements.Separator.prototype.stroke;
anychart.elements.Separator.prototype['drawer'] = anychart.elements.Separator.prototype.drawer;
anychart.elements.Separator.prototype['draw'] = anychart.elements.Separator.prototype.draw;
anychart.elements.Separator.prototype['getRemainingBounds'] = anychart.elements.Separator.prototype.getRemainingBounds;
