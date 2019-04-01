goog.provide('anychart.graphModule.elements.Dragger');

goog.require('goog.fx.Dragger');



/**
 * @constructor
 * @param {Element} target The element that will be dragged.
 * @param {Element=} opt_handle An optional handle to control the drag, if null
 *     the target is used.
 * @param {goog.math.Rect=} opt_limits Object containing left, top, width,
 *     and height.
 * @extends {goog.fx.Dragger}
 * */
anychart.graphModule.elements.Dragger = function(target, opt_handle, opt_limits) {
  anychart.graphModule.elements.Dragger.base(this, 'constructor', target, opt_handle, opt_limits);

  /**
   * Element
   * @private
   * */
  this.targetElement_ = null;
};
goog.inherits(anychart.graphModule.elements.Dragger, goog.fx.Dragger);


/**
 * Return element we drag.
 * @return {(acgraph.vector.Rect|acgraph.vector.Path)} Target element.
 * */
anychart.graphModule.elements.Dragger.prototype.getTargetElement = function() {
  return this.targetElement_;
};


/** @inheritDoc */
anychart.graphModule.elements.Dragger.prototype.startDrag = function(e) {
  //Save target element we need access to it
  this.targetElement_ = e.target;
  anychart.graphModule.elements.Dragger.base(this, 'startDrag', e);
};
