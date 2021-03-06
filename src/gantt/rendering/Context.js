goog.provide('anychart.ganttModule.rendering.Context');



/**
 *
 * @param {anychart.ganttModule.elements.TimelineElement} element - Related element.
 * @param {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem} item - Related data item.
 * @param {anychart.math.Rect} predictedBounds - Default predicted bounds to display element.
 * @param {Object} tag - Tag data object. NOTE: not optional because current implementation (16 Jan 2018) depends on this data a lot.
 * @param {number=} opt_periodIndex - Period index for resources timeline.
 * @param {boolean=} opt_selected - Whether is selected. TODO (A.Kudryavtsev): Replace this with State in future implementation.
 * @constructor
 */
anychart.ganttModule.rendering.Context = function(element, item, predictedBounds, tag, opt_periodIndex, opt_selected) {
  /**
   *
   * @type {anychart.ganttModule.elements.TimelineElement}
   */
  this.element = element;

  /**
   *
   * @type {Object}
   */
  this.tag = tag;

  /**
   *
   * @type {anychart.math.Rect}
   */
  this['predictedBounds'] = predictedBounds;

  /**
   *
   * @type {anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem}
   */
  this['item'] = item;
  var state = opt_selected ? anychart.PointState.SELECT : anychart.PointState.NORMAL;

  this['shapes'] = this.element.shapeManager.getShapesGroup(item, tag, state, void 0, void 0, void 0, opt_periodIndex);

  if (goog.isDef(opt_periodIndex)) {
    /**
     *
     * @type {number}
     */
    this['periodIndex'] = opt_periodIndex;

    /**
     *
     * @type {Object}
     */
    this['period'] = item.get(anychart.enums.GanttDataFields.PERIODS, opt_periodIndex);
  }
};


/**
 * Generates a shapes group.
 * @param {anychart.PointState} state - State.
 * @param {Object.<string>=} opt_only If set - contains a subset of shape names that should be returned.
 * @param {number=} opt_baseZIndex - zIndex that is used as a base zIndex for all shapes of the group.
 * @param {acgraph.vector.Shape=} opt_shape Foreign shape.
 * @return {Object.<string, acgraph.vector.Shape>}
 */
anychart.ganttModule.rendering.Context.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  return this.element.shapeManager.getShapesGroup(this['item'], this.tag, state, opt_only, opt_baseZIndex, opt_shape, this['periodIndex']);
};
