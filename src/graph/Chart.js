//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.graphModule.elements.Edge');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Coordinate');
goog.require('goog.structs.Set');


//endregion


//region Constructor
//TODO jsdoc
/**
 * @constructor
 * @param {Object=} opt_data
 * @extends {anychart.core.Chart}
 * */
anychart.graphModule.Chart = function(opt_data) {
  anychart.graphModule.Chart.base(this, 'constructor');

  this.addThemes('graph');

  this.bindHandlersToComponent(this,
    this.handleMouseOver,
    this.handleMouseOut,
    this.handleMouseClick,
    this.handleMouseMove,
    null,
    this.handleMouseDown);

  /**
   * Map where key is nodeId, value is node data.
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodes_ = {};

  /**
   * Map where key is groupId, value is settings for group.
   * @type {Object.<string, ?anychart.graphModule.elements.Group>}
   * @private
   * */
  this.groups_ = {};

  /**
   *
   * @type {Object.<string, Array.<string>>}
   * @private
   * */
  this.subGraphGroups_ = {};

  /**
   * Array with all nodes.
   * @type {?Array.<anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodesArray_ = null;

  /**
   * Array with all edges.
   * @type {?Array.<anychart.graphModule.Chart.Edge>}
   * @private
   * */
  this.edgesArray_ = null;

  /**
   * Map with all edges.
   * @type {Object.<string, anychart.graphModule.Chart.Edge>}
   * @private
   * */
  this.edges_ = {};

  /**
   * Selected node or edge.
   * @type {?Object.<string, anychart.SettingsState>}
   * @private
   * */
  this.selectedElement_ = null;

  /**
   * Mouse wheel handler.
   * @type {?goog.events.MouseWheelHandler}
   * @private
   * */
  this.mouseWheelHandler_ = null;


  this.dragger_ = null;

  this.zoom_ = [1];
  this.move_ = [0, 0];
  this.rotateDegree_ = 0;
  this.chartRotation_ = 0;
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, []);
  this.data(opt_data);
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


/**
 * Names for states.
 * @enum {string}
 */
anychart.graphModule.Chart.States = {
  LABELS_STYLE: 'labelsStyle',
  LABELS_ENABLED: 'labelsEnabled',
  LABELS_BOUNDS: 'labelsBounds',
  NODES: 'nodes',
  EDGES: 'edges',
  LAYOUT: 'layout',
  TRANSFORM: 'transform',
  ROTATE: 'rotate'
};


anychart.consistency.supportStates(anychart.graphModule.Chart, anychart.enums.Store.GRAPH, [
  anychart.enums.State.APPEARANCE,
  anychart.enums.State.DATA,
  anychart.graphModule.Chart.States.LABELS_BOUNDS,
  anychart.graphModule.Chart.States.LABELS_ENABLED,
  anychart.graphModule.Chart.States.LABELS_STYLE,
  anychart.graphModule.Chart.States.LAYOUT,
  anychart.graphModule.Chart.States.TRANSFORM,
  anychart.graphModule.Chart.States.ROTATE,
  anychart.graphModule.Chart.States.NODES,
  anychart.graphModule.Chart.States.EDGES
]);


/**
 * @typedef {{
 *  nodeId: string,
 *  groupId: (string|undefined),
 *  dataRow: number,
 *  position: {
 *    x:number,
 *    y:number
 *  },
 *  currentState: anychart.SettingsState,
 *  domElement: (acgraph.vector.Path|undefined),
 *  textElement: (anychart.core.ui.OptimizedText|undefined),
 *  connectedEdges: Array.<string>,
 *  coulombX: (number|undefined),
 *  coulombY: (number|undefined),
 *  harmonicX: (number|undefined),
 *  harmonicY: (number|undefined),
 *  velocityY: (number|undefined),
 *  velocityX: (number|undefined),
 *  subGraphId: (string|undefined),
 *  siblings: Array
 * }}
 * */
anychart.graphModule.Chart.Node;


/**
 * @typedef {{
 *  id: string,
 *  dataRow: number,
 *  from: string,
 *  to: string,
 *  currentState: anychart.SettingsState,
 *  domElement: (acgraph.vector.Path|undefined),
 *  textElement: (anychart.core.ui.OptimizedText|undefined)
 * }}
 * */
anychart.graphModule.Chart.Edge;


/**
 * @typedef {{
 *  id: string,
 *  type: anychart.graphModule.Chart.Element,
 *  currentState: anychart.SettingsState
 * }}
 * */
anychart.graphModule.Chart.Tag;


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 * */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/**
 * Supported consistency states.
 * @type {number}
 * */
anychart.graphModule.Chart.prototype.SUPPORTED_CONSISTENCY_STATES = anychart.core.Chart.prototype.SUPPORTED_CONSISTENCY_STATES |
  anychart.ConsistencyState.APPEARANCE;


/**
 * Z-index for graph chart.
 * @type {number}
 * */
anychart.graphModule.Chart.Z_INDEX = 30;


/**
 * Properties that should be defined in class prototype.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 * */
anychart.graphModule.Chart.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, []);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.Chart, anychart.graphModule.Chart.OWN_DESCRIPTORS);


/**
 * Enum for elements
 * @enum {string}
 * */
anychart.graphModule.Chart.Element = {
  NODE: 'node',
  GROUP: 'group',
  EDGE: 'edge'
};


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.graphModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.GRAPH;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.isNoData = function() {
  return !this.data_ || !this.data_['nodes'] || (!this.data_['nodes'].getRowsCount());
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getAllSeries = function() {
  return [];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.getDataHolders = function() {
  return [this];
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.toCsv = function(opt_chartDataExportMode, opt_csvSettings) {

};
//endregion


//region Tooltip data


/**
 * Creates context provider for tooltip.
 * @param {anychart.graphModule.Chart.Tag} tag
 * @return {anychart.format.Context}
 * */
anychart.graphModule.Chart.prototype.createContextProvider = function(tag) {
  if (tag.type == anychart.graphModule.Chart.Element.NODE) {
    var node = this.getNodeById(tag.id);
    return this.nodesSettingObject_.createFormatProvider(node);
  } else {
    var edge = this.getEdgeById(tag.id);
    return this.edgeSettingsObject_.createFormatProvider(edge);
  }
};


//endregion
//region Event handlers and interactivity


/**
 * Mouse click internal handler.
 * Set selected state for selected element, deselect previous selected element if click on empty space.
 * @param {anychart.core.MouseEvent} event - Event object.
 * */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  if (this.selectedElement_) { //deselect previous selected element
    switch (this.selectedElement_.type) {
      case anychart.graphModule.Chart.Element.EDGE:
        this.updateEdgeById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
      case anychart.graphModule.Chart.Element.NODE:
        this.updateNodeById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
    }
    this.selectedElement_ = null;
  }
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(event['domTarget'].tag);
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      this.updateNodeById(tag.id, anychart.SettingsState.SELECTED);
      this.selectedElement_ = {
        type: anychart.graphModule.Chart.Element.NODE,
        id: tag.id
      };
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      this.updateEdgeById(tag.id, anychart.SettingsState.SELECTED);
      this.selectedElement_ = {
        type: anychart.graphModule.Chart.Element.EDGE,
        id: tag.id
      };
    }
  }
};


/**
 * Handle mouseOver event handler.
 * Show tooltip.
 * Change elements appearance if elements is't selected.
 * @param {anychart.core.MouseEvent} event - Event object.
 * */
anychart.graphModule.Chart.prototype.handleMouseOver = function(event) {
  var domTarget = event['domTarget'];
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  var tooltip;
  if (tag) {
    this.tooltip().hide();
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateNodeById(tag.id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.nodesSettingObject_.tooltip();
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateEdgeById(tag.id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.edgeSettingsObject_.tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {anychart.graphModule.Chart.Tag} */ (tag)));
  }
  else {
    this.tooltip().hide();
  }
};


/**
 * Mouse mouseMove handler.
 * Update only tooltip position.
 * Don't affect nodes appearance.
 * @param {anychart.core.MouseEvent} event - Event object.
 * */
anychart.graphModule.Chart.prototype.handleMouseMove = function(event) {
  var domTarget = event['domTarget'];
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  var tooltip;
  if (tag) {
    this.tooltip().hide();
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      tooltip = this.nodesSettingObject_.tooltip();
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      tooltip = this.edgeSettingsObject_.tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {anychart.graphModule.Chart.Tag} */ (tag)));
  }
  else {
    this.tooltip().hide();
  }
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.handleMouseWheel_ = function(event) {
  if (this.interactivity().getOption('enabled')) {
    var scale = 1;
    var dy = goog.math.clamp(event.deltaY, -5, 5);

    if (this.interactivity().getOption('zoomOnMouseWheel')) {
      var step = .3 / Math.abs(dy);
      if (dy > 0) {
        scale = 1 - step;
      } else if (dy < 0) {
        scale = 1 + step;
      }
      this.rootLayer.scale(scale, scale, event.clientX, event.clientY);
    }

    if (this.interactivity().getOption('scrollOnMouseWheel')) {
      this.rootLayer.translate(0, dy);
    }
    event.preventDefault();
  }
};


/**
 * Update edges appearance
 * */
anychart.graphModule.Chart.prototype.updateEdgesAppearance = function() {
  for (var edge in this.getEdgesMap()) {
    var edgeObj = this.getEdgeById(edge);
    this.edgeSettingsObject_.updateAppearance(edgeObj);
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  for (var i = 0, length = node.connectedEdges.length; i < length; i++) {
    var edge = this.getEdgesMap()[node.connectedEdges[i]];

    this.edgeSettingsObject_.updateLabelStyle(edge);

    var from = this.getNodesMap()[edge.from].position;
    var to = this.getNodesMap()[edge.to].position;
    var path = edge.domElement;
    path.clear();
    path.moveTo(from.x, from.y)
      .lineTo(to.x, to.y);
  }
};


/**
 * Set position for dom element depend on node size.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateNodeDOMElementPosition = function(node) {
  var x = node.position.x;
  var y = node.position.y;
  var width = this.nodesSettingObject_.getWidth(node);
  var height = this.nodesSettingObject_.getHeight(node);

  x -= (width / 2);
  y -= (height / 2);

  node.domElement.setPosition(x, y);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseDown = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;

  if (this.interactivity().getOption('enabled')) {
    if (tag && tag.type == anychart.graphModule.Chart.Element.NODE && this.interactivity().getOption('node')) {
      var node = this.getNodeById(tag.id);
      this.nodeDragInteractivity(node, domTarget, event);
    } else if (!tag) {
      this.layerDragInteractivity(domTarget, event);
    }
  }
};


/**
 * Fit graph into bounds.
 * Calculate most values and offset graph depend on it.
 * */
anychart.graphModule.Chart.prototype.setOffset = function() {
  var nodes = this.getNodesArray();

  var mostTop = Infinity;
  var mostLeft = Infinity;
  var mostRight = -Infinity;
  var mostBottom = -Infinity;

  var length = nodes.length;

  var i, x, y;
  for (i = 0; i < length; i++) {
    x = nodes[i].position.x;
    y = nodes[i].position.y;
    mostTop = Math.min(y, mostTop);
    mostRight = Math.max(x, mostRight);
    mostBottom = Math.max(y, mostBottom);
    mostLeft = Math.min(x, mostLeft);
  }

  mostBottom += -mostTop;
  mostRight += -mostLeft;
  var gapFactor = 0.05; //don't let nodes to stick close to bounds.
  var widthGap = this.contentBounds.width * gapFactor;
  var heightGap = this.contentBounds.height * gapFactor;
  var height = this.contentBounds.height - 2 * heightGap;
  var width = this.contentBounds.width - 2 * widthGap;

  var scaleFactor = Math.min(width / mostRight, height / mostBottom);

  var centerX = this.contentBounds.getCenter().getX();
  var centerY = this.contentBounds.getCenter().getY();

  var offsetX = 0;
  var offsetY = 0;
  for (i = 0; i < length; i++) {
    x = nodes[i].position.x;
    y = nodes[i].position.y;
    x += -mostLeft;
    y += -mostTop;
    x *= scaleFactor;
    y *= scaleFactor;
    //calculate offset from center of bounds.
    if (x < centerX) {
      offsetX += centerX - x;
    } else {
      offsetX -= x - centerX;
    }

    if (y < centerY) {
      offsetY += centerY - y;
    } else {
      offsetY -= y - centerY;
    }
    nodes[i].position.x = x;
    nodes[i].position.y = y;
  }
  //average offset
  offsetX /= nodes.length;
  offsetY /= nodes.length;

  //push all nodes to center.
  for (i = 0; i < length; i++) {
    nodes[i].position.x += offsetX;
    nodes[i].position.y += offsetY;
  }
};


/**
 * Set new position for node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {number} dx
 * @param {number} dy
 * */
anychart.graphModule.Chart.prototype.setNodePosition = function(node, dx, dy) {
  node.position.x += dx;
  node.position.y += dy;
};


/**
 * Return absolute x value
 * @param {number} x
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  var matrix = this.rootLayer.getTransformationMatrix();
  var scale = matrix[0];
  var offsetX = matrix[4];
  return (-offsetX * scale + x / scale);
};


/**
 * Return absolute y value
 * @param {number} y
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getYWithTranslate = function(y) {
  var matrix = this.rootLayer.getTransformationMatrix();
  var scale = matrix[0];
  var offsetY = matrix[5];
  return (-offsetY * scale + y / scale);
};


/**
 * Change position of dragged node.
 * @param {anychart.graphModule.Chart.Node} node Current dragged node.
 * @param {acgraph.vector.Path} domTarget
 * @param {anychart.core.MouseEvent} event
 * */
anychart.graphModule.Chart.prototype.nodeDragInteractivity = function(node, domTarget, event) {
  var dragger = new goog.fx.Dragger(domTarget['domElement']());
  var startX, startY;

  dragger.listen(goog.fx.Dragger.EventType.START, /** @this {anychart.graphModule.Chart}*/ function(e) {
    startX = this.getXWithTranslate(event.clientX);
    startY = this.getYWithTranslate(event.clientY);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.DRAG, /** @this {anychart.graphModule.Chart}*/ function(e) {
    var x = this.getXWithTranslate(e.clientX);
    var y = this.getYWithTranslate(e.clientY);
    //this.edges().getLabelsLayer().parent(null);
    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;

    this.setNodePosition(node, dx, dy);
    this.updateNodeDOMElementPosition(node);
    this.updateEdgesConnectedToNode(node);
    this.updateNode(node, anychart.SettingsState.HOVERED);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    if (this.interactivity().getOption('magnetize')) {
      this.nodesSettingObject_.stickNode(node);
      this.updateNodeDOMElementPosition(node);
      this.updateEdgesConnectedToNode(node);
    }

    // this.edges().getLabelsLayer().parent(this.rootLayer);
    dragger.dispose();
  }, false, this);

  dragger.startDrag(event['getOriginalEvent']());
};


/**
 * @param {acgraph.vector.Path} domTarget
 * @param {anychart.core.MouseEvent} event
 * */
anychart.graphModule.Chart.prototype.layerDragInteractivity = function(domTarget, event) {
  var dragger = new goog.fx.Dragger(domTarget['domElement']());
  var startX = 0, startY = 0;

  dragger.listen(goog.fx.Dragger.EventType.START, function(e) {
    startX = event.clientX;
    startY = event.clientY;
    console.log(startX, startY);
  }, false, this);
  dragger.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
    var scale = this.rootLayer.getTransformationMatrix()[0];
    var x = e.clientX;
    var y = e.clientY;
    var dx = (x - startX) / scale; //slowdown drag when zoom are used
    var dy = (y - startY) / scale;
    startX = x;
    startY = y;

    this.rootLayer.translate(dx, dy);

  }, false, this);
  dragger.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    dragger.dispose();
  }, false, this);
  dragger.startDrag(event['getOriginalEvent']());
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateNodeById(tag.id, anychart.SettingsState.NORMAL);
      }
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateEdgeById(tag.id, anychart.SettingsState.NORMAL);
      }
    }
  }
};


/**
 * Update style of node.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState} state New State for node.
 * */
anychart.graphModule.Chart.prototype.updateNode = function(node, state) {
  this.nodesSettingObject_.state(node, state);
  this.nodesSettingObject_.updateAppearance(node);
  this.nodesSettingObject_.updateLabelStyle(node);
};


/**
 * Update style of node.
 * @param {string} nodeId
 * @param {anychart.SettingsState} state New State for node.
 * */
anychart.graphModule.Chart.prototype.updateNodeById = function(nodeId, state) {
  var node = this.getNodeById(nodeId);
  node.domElement.tag.currentState = state;
  this.updateNode(node, state);
};


/**
 * Update style of edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdge = function(edge, state) {
  this.edgeSettingsObject_.state(edge, state);
  this.edgeSettingsObject_.updateAppearance(edge);
  this.edgeSettingsObject_.updateLabelStyle(edge);
};


/**
 * Update style of edge.
 * @param {string} edgeId
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdgeById = function(edgeId, state) {
  var edge = this.getEdgeById(edgeId);
  edge.domElement.tag.currentState = state;
  this.updateEdge(edge, state);
};

//endregion
//region Data manipulation


/**
 * @param {Object} dataRow
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedNode_ = function(dataRow, i) {
  var nodeId = dataRow['id'];
  if (goog.isDef(nodeId)) {
    nodeId = nodeId.toString();
  } else {
    nodeId = 'node_' + i;
    dataRow['id'] = nodeId;
  }
  if (!this.getNodeById(nodeId)) {
    /**
     * @type {anychart.graphModule.Chart.Node}
     * */
    var nodeObj;
    nodeObj = this.nodes_[nodeId] = {};
    nodeObj.nodeId = nodeId;
    nodeObj.dataRow = i;
    nodeObj.connectedEdges = [];
    nodeObj.siblings = [];
    nodeObj.currentState = anychart.SettingsState.NORMAL;
    nodeObj.position = {
      x: dataRow['x'],
      y: dataRow['y']
    };

    var groupId = dataRow['group'];
    if (goog.isDefAndNotNull(groupId)) {
      if (!this.groups_[groupId]) {
        this.groups_[groupId] = null;
      }
      nodeObj.groupId = groupId;
    }
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODE_ALREADY_EXIST, null, [nodeId], true);
  }
};


/**
 * @param {Object} edgeRow
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedEdge_ = function(edgeRow, i) {
  var fromId = edgeRow['from'];
  var toId = edgeRow['to'];
  var edgeId = edgeRow['id'];

  if (goog.isDefAndNotNull(edgeId)) {
    edgeId = edgeId.toString();
  } else {
    edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + i;
  }

  if (fromId != toId) {
    var from = this.getNodeById(fromId);
    var to = this.getNodeById(toId);

    if (from && to) {
      var edge = {};

      edge.id = edgeId;
      edge.from = from.nodeId;
      edge.to = to.nodeId;
      edge.dataRow = i;
      edge.currentState = anychart.SettingsState.NORMAL;

      var sibling;
      //check if two node already connected
      for (i = 0; i < from.siblings.length; i++) {
        sibling = from.siblings[i];
        if (sibling == from.nodeId || sibling == to.nodeId) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [from.nodeId, to.nodeId], true);
          return;
        }
      }
      //check if two node already connected
      for (i = 0; i < to.siblings.length; i++) {
        sibling = from.siblings[i];
        if (sibling == from.nodeId || sibling == to.nodeId) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [to.nodeId, from.nodeId], true);
          return;
        }
      }
      from.connectedEdges.push(edge.id);
      to.connectedEdges.push(edge.id);
      from.siblings.push(to.nodeId);
      to.siblings.push(from.nodeId);

      this.edges_[edgeId] = edge;
    } else {
      if (!from) {
        anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_NODE_TO_CONNECT_EDGE, null, [edgeId, fromId], true);
      }
      if (!to) {
        anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_NODE_TO_CONNECT_EDGE, null, [edgeId, toId], true);
      }
    }
  } else {
    anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_CONNECT_SAME_NODE, null, [edgeId, toId], true);
  }
};


/**
 * Calculate number of disconnected graphs.
 * Setup id for each graph.
 * @private
 * @suppress {deprecated}
 * */
anychart.graphModule.Chart.prototype.setupGroupsForChart_ = function() {
  var nodes = this.getNodesArray();

  /**
   * Returns array with sibling of passed node and node id
   * @param {anychart.graphModule.Chart.Node} node
   * @return {Array.<string>}
   * */
  function getSiblings (node) {
    return [node.nodeId].concat(node.siblings);
  }

  if (nodes.length) {
    /**
     * @type {Array.<goog.structs.Set>}
     * */
    var allNodes = [new goog.structs.Set(getSiblings(nodes[0]))];

    for (var i = 1, length = nodes.length; i < length; i++) {
      var currentNode = nodes[i];
      var siblings = getSiblings(currentNode);
      var isSubSet = false;
      var set = 0;
      for (var setLength = allNodes.length; set < setLength; set++) {
        for (var element = 0, siblingsLength = siblings.length; element < siblingsLength; element++) {
          if (allNodes[set].contains(siblings[element])) {
            isSubSet = true;
            break;
          }
        }
        if (isSubSet) {
          break;
        }
      }
      if (isSubSet) {
        allNodes[set].addAll(siblings);
      } else {
        allNodes.push((new goog.structs.Set(siblings)));
      }

    }
    for (var groupNumber = 0; groupNumber < allNodes.length; groupNumber++) {
      var groupElements = allNodes[groupNumber].getValues();
      for (var groupElement = 0; groupElement < groupElements.length; groupElement++) {
        var nodeId = groupElements[groupElement];
        var node = this.getNodeById(nodeId);
        node.subGraphId = groupNumber.toString();

        var graphId = groupNumber.toString();
        if (!(graphId in this.subGraphGroups_)) {
          this.subGraphGroups_[graphId] = [];
        }
        this.subGraphGroups_[graphId].push(node.nodeId);
      }
    }
  }
};


/**
 * Create node and edge object for internal manipulation.
 * @private
 * */
anychart.graphModule.Chart.prototype.prepareNewData_ = function() {
  var edges = this.data_['edges'];
  var nodes = this.data_['nodes'];
  var dataRow;
  var length;
  var i;

  for (i = 0, length = nodes.getRowsCount(); i < length; i++) {
    dataRow = /**@type {Object}*/(nodes.getRow(i));
    if (dataRow) {
      this.proceedNode_(dataRow, i);
    }
  }

  for (i = 0, length = edges.getRowsCount(); i < length; i++) {
    dataRow = /**@type {Object}*/(edges.getRow(i));
    if (dataRow) {
      this.proceedEdge_(dataRow, i);
    }
  }
};


/**
 * Reset DOM of all drawn elements.
 * Dispose all created elements.
 * @private
 * */
anychart.graphModule.Chart.prototype.dropCurrentData_ = function() {
  if (this.nodes_) {
    for (var nodeId in this.nodes_) {
      var node = this.getNodeById(nodeId);
      this.nodesSettingObject_.clear(node);
    }
  }

  if (this.edges_) {
    for (var edgeId in this.edges_) {
      var edge = this.getEdgeById(edgeId);
      this.edgeSettingsObject_.clear(edge);
    }
  }
  this.nodes().resetLabelSettings();
  this.edges().resetLabelSettings();
  this.nodes_ = {};
  this.edges_ = {};
  this.nodesArray_ = null;
  this.edgesArray_ = null;
  this.subGraphGroups_ = {};
  this.selectedElement_ = null;
};


/**
 * Node signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onNodeSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event, anychart.graphModule.Chart.Element.NODE);
  }

  var states = [];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    states.push(anychart.graphModule.Chart.States.LABELS_ENABLED);
  }
  this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Edge signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onEdgeSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event, anychart.graphModule.Chart.Element.EDGE);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
  }
};


/**
 * Edge signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onGroupSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.labelsSettingsInvalidated_(event, anychart.graphModule.Chart.Element.GROUP);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
  }
};


/**
 * Layout signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onLayoutSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    var states = [
      anychart.enums.State.APPEARANCE,
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.graphModule.Chart.States.LABELS_ENABLED,
      anychart.graphModule.Chart.States.LAYOUT
    ];
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Data signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.dataInvalidated_ = function(event) {
  var statesForInvalidate = [
    anychart.enums.State.DATA,
    anychart.enums.State.APPEARANCE,
    anychart.graphModule.Chart.States.LABELS_STYLE,
    anychart.graphModule.Chart.States.LABELS_BOUNDS,
    anychart.graphModule.Chart.States.LABELS_ENABLED,
    anychart.graphModule.Chart.States.LAYOUT
  ];
  this.dropCurrentData_();
  this.prepareNewData_();
  this.setupGroupsForChart_();
  this.invalidate(anychart.ConsistencyState.BOUNDS);
  this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region Elements
/**
 * Settings object for nodes.
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 * */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nodesSettingObject_) {
    this.nodesSettingObject_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nodesSettingObject_);
    this.nodesSettingObject_.setupElements();
    this.nodesSettingObject_.listenSignals(this.onNodeSignal_, this);
    this.nodesSettingObject_.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }
  if (opt_value) {
    this.nodesSettingObject_.setup(opt_value);
    return this;
  }
  return this.nodesSettingObject_;
};


/**
 * Settings object for interactivity.
 * @param {Object=} opt_value Object with interactivity settings
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
 * @suppress {checkTypes}
 * */
anychart.graphModule.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivitySettingsObject_) {
    this.interactivitySettingsObject_ = new anychart.graphModule.elements.Interactivity();
    this.setupCreated('interactivity', this.interactivitySettingsObject_);
  }
  if (opt_value) {
    return this;
  }
  return this.interactivitySettingsObject_;
};


/**
 *
 * @param {string} id Id of group
 * @param {Object=} opt_value Config object
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
 * */
anychart.graphModule.Chart.prototype.groups = function(id, opt_value) {
  if (goog.isDefAndNotNull(id)) {
    if (goog.isDef(this.groups_[id])) {
      if (goog.isNull(this.groups_[id])) {
        var group = new anychart.graphModule.elements.Group(this);
        group.listenSignals(this.onGroupSignal_, this);
        this.groups_[id] = group;
      }
      if (opt_value) {
        this.groups_[id].setup(opt_value);
        return this;
      }
      return this.groups_[id];
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_GROUP, null, [id], true);
    }
  }
  return this;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Layout)}
 * */
anychart.graphModule.Chart.prototype.layout = function(opt_value) {
  if (!this.layout_) {
    this.layout_ = new anychart.graphModule.elements.Layout(this);
    this.setupCreated('layout', this.layout_);
    this.layout_.listenSignals(this.onLayoutSignal_, this);
  }
  if (opt_value) {
    this.layout_.setup(opt_value);
    return this;
  }
  return this.layout_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Edge)}
 * */
anychart.graphModule.Chart.prototype.edges = function(opt_value) {
  if (!this.edgeSettingsObject_) {
    this.edgeSettingsObject_ = new anychart.graphModule.elements.Edge(this);
    this.setupCreated('edges', this.edgeSettingsObject_);
    this.edgeSettingsObject_.setupElements();
    this.edgeSettingsObject_.listenSignals(this.onEdgeSignal_, this);
    this.edgeSettingsObject_.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }
  if (opt_value) {
    this.edgeSettingsObject_.setup(opt_value);
    return this;
  }
  return this.edgeSettingsObject_;
};


/**
 * Labels handler
 * @param {anychart.SignalEvent} event
 * @param {anychart.graphModule.Chart.Element} source
 * @private
 * */
anychart.graphModule.Chart.prototype.labelsSettingsInvalidated_ = function(event, source) {
  var state = [];
  var signal = anychart.Signal.NEEDS_REDRAW;
  state.push(
    anychart.graphModule.Chart.States.LABELS_BOUNDS,
    anychart.graphModule.Chart.States.LABELS_STYLE,
    anychart.graphModule.Chart.States.LABELS_ENABLED
  );
  switch (source) {
    case anychart.graphModule.Chart.Element.GROUP:
    case anychart.graphModule.Chart.Element.NODE:
      state.push(anychart.graphModule.Chart.States.NODES);
      this.nodesSettingObject_.needsMeasureLabels();
      break;
    case anychart.graphModule.Chart.Element.EDGE:
      state.push(anychart.graphModule.Chart.States.EDGES);
      this.edgeSettingsObject_.needsMeasureLabels();
      break;
    default:
      state.push(anychart.graphModule.Chart.States.EDGES, anychart.graphModule.Chart.States.NODES);
      this.nodesSettingObject_.needsMeasureLabels();
      this.edgeSettingsObject_.needsMeasureLabels();
  }
  this.invalidateMultiState(anychart.enums.Store.GRAPH, state, signal);
};


/**
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 * */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labelsSettings_);
  }

  if (goog.isDef(opt_value)) {
    this.labelsSettings_.setup(opt_value);
    return this;
  }

  return this.labelsSettings_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Edge>}
 * */
anychart.graphModule.Chart.prototype.getEdgesMap = function() {
  return this.edges_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesMap = function() {
  return this.nodes_;
};


/**
 * @return {Object.<string, anychart.graphModule.elements.Group>}
 * */
anychart.graphModule.Chart.prototype.getGroupsMap = function() {
  return this.groups_;
};


/**
 * @return {Object.<string, Array.<string>>}
 * */
anychart.graphModule.Chart.prototype.getSubGraphsMap = function() {
  return this.subGraphGroups_;
};


/**
 * Return array with all nodes.
 * @return {Array.<anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesArray = function() {
  if (!this.nodesArray_) {
    this.nodesArray_ = [];
    for (var nodeId in this.getNodesMap()) {
      var nodes = this.getNodeById(nodeId);
      this.nodesArray_.push(nodes);
    }
  }
  return this.nodesArray_;
};


/**
 * Return array with all edges.
 * @return {Array.<anychart.graphModule.Chart.Edge>}
 * */
anychart.graphModule.Chart.prototype.getEdgesArray = function() {
  if (!this.edgesArray_) {
    this.edgesArray_ = [];
    for (var edgeId in this.getEdgesMap()) {
      var edge = this.getEdgeById(edgeId);
      this.edgesArray_.push(edge);
    }
  }
  return this.edgesArray_;
};


/**
 * Return node object by id.
 * @param {string} id
 * @return {anychart.graphModule.Chart.Node}
 * */
anychart.graphModule.Chart.prototype.getNodeById = function(id) {
  return this.getNodesMap()[id];
};


/**
 * Return edge object by id.
 * @param {string} id
 * @return {anychart.graphModule.Chart.Edge}
 * */
anychart.graphModule.Chart.prototype.getEdgeById = function(id) {
  return this.getEdgesMap()[id];
};
//endregion


/**
 * Update appearance of all nodes.
 * */
anychart.graphModule.Chart.prototype.updateNodesAppearance = function() {
  var nodes = this.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.nodesSettingObject_.updateAppearance(node);
  }
};


/**
 * Draw passed node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.drawNode = function(node) {
  var domElement = this.nodesSettingObject_.createDOM(node);
  domElement.parent(this.nodesLayer_);
};


/**
 * Draw all nodes of graph.
 * */
anychart.graphModule.Chart.prototype.drawNodes = function() {
  for (var node in this.getNodesMap()) {
    node = this.getNodeById(node);
    this.drawNode(node);
  }
  this.nodesSettingObject_.needsMeasureLabels();
};


/**
 * Move all nodes of graph.
 * Update position of all nodes.
 * Update connected edges.
 * */
anychart.graphModule.Chart.prototype.moveNodes = function() {
  var nodes = this.getNodesArray();
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    this.updateNode(node, /**@type {anychart.SettingsState}*/(this.nodesSettingObject_.state(node)));
    this.updateEdgesConnectedToNode(node);
  }
};


/**
 * Draw passed edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.Chart.prototype.drawEdge = function(edge) {
  var domElement = this.edgeSettingsObject_.createDOM(edge);
  var from = this.getNodeById(edge.from);
  var to = this.getNodeById(edge.to);

  domElement.moveTo(from.position.x, from.position.y);
  domElement.lineTo(to.position.x, to.position.y);

  domElement.parent(this.edgesLayer_);
};


/**
 * Draw all edges of chart.
 * */
anychart.graphModule.Chart.prototype.drawEdges = function() {
  for (var i in this.edges_) {
    var edge = this.getEdgeById(i);
    this.drawEdge(edge);
  }
  this.edgeSettingsObject_.needsMeasureLabels();
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
    this.nodesLayer_ = acgraph.layer();
    this.edgesLayer_ = acgraph.layer();
    this.edgesLayer_.parent(this.rootLayer);
    this.edgeSettingsObject_.getLabelsLayer().parent(this.rootLayer);
    this.nodesSettingObject_.getLabelsLayer().parent(this.rootLayer);
    this.nodesLayer_.parent(this.rootLayer);
    this.nodes();
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LAYOUT)) {
    this.layout().getCoordinatesForCurrentLayout();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LAYOUT);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.ROTATE)) {
    var nodes = this.getNodesArray();
    var center = this.contentBounds.getCenter();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var coordinate = new goog.math.Coordinate(node.position.x, node.position.y);
      coordinate.rotateDegrees(this.rotateDegree_, center);
      node.position.x = coordinate.getX();
      node.position.y = coordinate.getY();
    }
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.ROTATE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    if (this.layout().type() == anychart.graphModule.elements.LayoutType.FORCE) {
      this.setOffset();
    }
    this.drawEdges();
    this.drawNodes();

    this.invalidateMultiState(anychart.enums.Store.GRAPH, [
      anychart.graphModule.Chart.States.EDGES,
      anychart.graphModule.Chart.States.NODES,
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_ENABLED,
      // anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.enums.State.APPEARANCE

    ]);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }


  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE)) {
    this.updateEdgesAppearance();
    this.updateNodesAppearance();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.APPEARANCE);
  }

  if (this.hasMultiStateInvalidation(anychart.enums.Store.GRAPH,
    [
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.graphModule.Chart.States.LABELS_ENABLED
    ])) {
    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_STYLE)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.NODES)) {
        this.nodesSettingObject_.applyLabelsStyle();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.EDGES)) {
        this.edgeSettingsObject_.applyLabelsStyle();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_STYLE);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_BOUNDS)) {
      anychart.measuriator.measure();
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_BOUNDS);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_ENABLED)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.EDGES)) {
        this.edgeSettingsObject_.drawLabels();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.NODES)) {
        this.nodesSettingObject_.drawLabels();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LABELS_ENABLED);
    }
    this.markMultiStateConsistent(anychart.enums.Store.GRAPH,
      [anychart.graphModule.Chart.States.EDGES, anychart.graphModule.Chart.States.NODES]);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.TRANSFORM)) {
    this.rootLayer.scale(this.zoom_[0], this.zoom_[0], this.zoom_[1], this.zoom_[2]);
    this.rootLayer.translate(this.move_[0], this.move_[1]);
    this.zoom_[0] = 1;
    this.zoom_[1] = this.contentBounds.width / 2;
    this.zoom_[2] = this.contentBounds.height / 2;
    this.move_[0] = 0;
    this.move_[1] = 0;
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.TRANSFORM);
  }

  if (!this.mouseWheelHandler_) {
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(this.container().getStage().getDomWrapper(), false);
    this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_, false, this);
  }

};


/**
 * @param {number=} opt_value Zoom factor.
 * @param {number=} opt_cx scaling point x.
 * @param {number=} opt_cy scaling point y.
 * @return {number | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.zoom = function(opt_value, opt_cx, opt_cy) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.zoom_[0] = opt_value;
    this.zoom_[1] = opt_cx;
    this.zoom_[2] = opt_cy;
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  var matrix = this.rootLayer.getTransformationMatrix();
  return matrix[0];
};


/**
 * @param {number=} opt_dx movement x.
 * @param {number=} opt_dy movement y.
 * @return {Array.<number> | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.move = function(opt_dx, opt_dy) {
  if (goog.isDefAndNotNull(opt_dx) && goog.isDefAndNotNull(opt_dy)) {
    this.move_[0] = opt_dx;
    this.move_[1] = opt_dy;
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  var matrix = this.rootLayer.getTransformationMatrix();
  return [matrix[4], matrix[5]];
};


/**
 * Return chart back to initial state.
 * */
anychart.graphModule.Chart.prototype.fit = function() {
  this.rootLayer.setTransformationMatrix(1, 0, 0, 1, 0, 0);
};


/**
 * Rotate root layer.
 * @param {number=} opt_degree
 * @return {anychart.graphModule.Chart|?number}
 * */
anychart.graphModule.Chart.prototype.rotate = function(opt_degree) {
  if (goog.isDef(opt_degree)) {
    if (goog.isNull(opt_degree)) {
      opt_degree = -this.chartRotation_;
    }
    this.rotateDegree_ = goog.math.standardAngle(opt_degree);
    this.chartRotation_ += opt_degree;
    var states = [
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.ROTATE,
      anychart.enums.State.APPEARANCE
    ];
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
    return this;
  } else {
    return this.chartRotation_;
  }
};


//endregion
//region Serialize, setup, dispose


/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 * */
anychart.graphModule.Chart.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var nodes = opt_value && opt_value['nodes'] ? opt_value['nodes'] : null;
    var edges = opt_value && opt_value['edges'] && nodes ? opt_value['edges'] : null;

    var data = {
      'nodes': nodes,
      'edges': edges
    };

    var dataElement = data['nodes'];
    if (this.rawDataForNodes != dataElement) {
      this.rawDataForNodes = dataElement;
      if (this.data_ && this.data_['nodes']) {
        this.data_['nodes'].unlistenSignals(this.dataInvalidated_);
        goog.dispose(this.data_['nodes']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['nodes'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['nodes'] = dataElement.derive();
      } else {
        data['nodes'] = anychart.data.set(dataElement).mapAs();
      }
      data['nodes'].listenSignals(this.dataInvalidated_, this);
    }

    dataElement = data['edges'];
    if (this.rawDataForEdges != dataElement) {
      this.rawDataForEdges = dataElement;
      if (this.data_ && this.data_['edges']) {
        this.data_['edges'].unlistenSignals(this.dataInvalidated_);
        goog.dispose(this.data_['edges']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['edges'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['edges'] = dataElement.derive();
      } else {
        data['edges'] = anychart.data.set(dataElement).mapAs();
      }
      data['edges'].listenSignals(this.dataInvalidated_, this);
    }

    this.dropCurrentData_();
    this.data_ = data;
    this.prepareNewData_();
    this.setupGroupsForChart_();

    var statesForInvalidate = [
      anychart.enums.State.DATA,
      anychart.enums.State.APPEARANCE,
      anychart.graphModule.Chart.States.LABELS_STYLE,
      anychart.graphModule.Chart.States.LABELS_BOUNDS,
      anychart.graphModule.Chart.States.LABELS_ENABLED,
      anychart.graphModule.Chart.States.LAYOUT
    ];
    this.invalidate(anychart.ConsistencyState.BOUNDS);
    this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);

  var dataNodes = this.data()['nodes'].serialize();
  var dataEdges = this.data()['edges'].serialize();
  var i;
  for (i = 0; i < dataNodes.length; i++) {
    var dataNode = dataNodes[i];
    var node = this.getNodeById(dataNode['id']);
    dataNode['x'] = node.position.x;
    dataNode['y'] = node.position.y;
  }
  json['data'] = {
    'nodes': dataNodes,
    'edges': dataEdges
  };

  json['nodes'] = this.nodes().serialize();
  json['edges'] = this.edges().serialize();
  json['labels'] = this.labels().serialize();
  json['tooltip'] = this.tooltip().serialize();

  json['groups'] = [];

  for (i in this.groups_) {
    var group = {};
    group['id'] = i;
    group['settings'] = this.groups(i).serialize();
    json['groups'].push(group);
  }
  json['layout'] = this.layout().serialize();
  json['interactivity'] = this.interactivity().serialize();
  json['zoom'] = this.zoom();
  json['move'] = this.move();
  json['rotate'] = this.rotate();
  return {'chart': json};
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('data' in config)
    this.data(config['data']);

  if ('edges' in config)
    this.edges().setup(config['edges']);

  if ('nodes' in config)
    this.nodes().setup(config['nodes']);

  if ('zoom' in config)
    this.zoom(config['zoom']);

  if ('move' in config)
    this.move(config['move'][0], config['move'][1]);

  if ('rotate')
    this.rotate(config['rotate']);

  if ('labels')
    this.labels().setup(config['labels']);

  if ('tooltip')
    this.tooltip().setup(config['tooltip']);

  if ('layout') {
    this.layout().setup(config['layout']);
    if (config['layout']['type'] == anychart.graphModule.elements.LayoutType.FORCE) {
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.graphModule.Chart.States.LAYOUT);
    }
  }
  if ('groups' in config) {
    var groups = config['groups'];
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      this.groups(group['id'], group['settings']);
    }
  }

  if ('interactivity' in config)
    this.interactivity().setup(config['interactivity']);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  this.edges().disposeInternal();
  this.nodes().disposeInternal();
  this.nodesArray_ = null;
  this.edgesArray_ = null;

  this.edges_ = {};
  this.nodes_ = {};
  this.groups_ = {};

  anychart.graphModule.Chart.base(this, 'disposeInternal');
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['edges'] = proto.edges;
  proto['fit'] = proto.fit;
  proto['zoom'] = proto.zoom;
  proto['move'] = proto.move;
  proto['groups'] = proto.groups;
  proto['rotate'] = proto.rotate;
  proto['nodes'] = proto.nodes;
  proto['layout'] = proto.layout;
  proto['interactivity'] = proto.interactivity;
})();
//endregion
