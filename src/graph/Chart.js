//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.graphModule.elements.Dragger');
goog.require('anychart.graphModule.elements.Edge');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.math.Coordinate');


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
    null);


  /**
   * Map where key is nodeId, value is node data.
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodesMap_ = {};

  /**
   * Map where key is groupId, value is settings for group.
   * @type {Object.<string, ?anychart.graphModule.elements.Group>}
   * @private
   * */
  this.groupsMap_ = {};

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
  this.edgesMap_ = {};

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

  /**
   * Events interceptor rectangle.
   * @type {acgraph.vector.Rect}
   * @private
   * */
  this.eventsInterceptor_ = null;

  /**
   * Dragger
   * @type {anychart.graphModule.elements.Dragger}
   * @private
   * */
  this.dragger_ = null;

  this.data_ = {}; //todo typedef

  /**
   *
   * */
  this.transformationMatrix = [1, 0, 0, 1, 0, 0];
  this.zoom_ = [1];
  this.move_ = [0, 0];
  this.rotateDegree_ = 0;
  this.chartRotation_ = 0;
  this.data(opt_data);
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


anychart.consistency.supportStates(anychart.graphModule.Chart, anychart.enums.Store.GRAPH, [
  anychart.enums.State.APPEARANCE,
  anychart.enums.State.DATA,
  anychart.enums.State.LABELS_BOUNDS,
  anychart.enums.State.LABELS_ENABLED,
  anychart.enums.State.LABELS_STYLE,
  anychart.enums.State.LAYOUT,
  anychart.enums.State.TRANSFORM,
  anychart.enums.State.ROTATE,
  anychart.enums.State.NODES,
  anychart.enums.State.EDGES
]);


/**
 * @typedef {{
 *  id: string,
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


//endregion
//region Infrastructure
/** @inheritDoc */
anychart.graphModule.Chart.prototype.getType = function() {
  return anychart.enums.ChartTypes.GRAPH;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.isNoData = function() {
  return !this.data_['nodes'].getRowsCount();
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
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} id
 * @return {anychart.format.Context}
 * */
anychart.graphModule.Chart.prototype.createContextProvider = function(type, id) {
  var provider;
  if (type == anychart.graphModule.Chart.Element.NODE) {
    var node = this.getNodeById(id);
    provider = this.nodes_.createFormatProvider(node);
  } else {
    var edge = this.getEdgeById(id);
    provider = this.edges_.createFormatProvider(edge);
  }
  return provider;
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
        this.updateEdgeStateById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
      case anychart.graphModule.Chart.Element.NODE:
        this.updateNodeStateById(this.selectedElement_.id, anychart.SettingsState.NORMAL);
        break;
    }
    this.selectedElement_ = null;
  }
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(event['domTarget'].tag);
  if (tag) {
    switch (tag.type) {
      case anychart.graphModule.Chart.Element.NODE:
        this.updateNodeStateById(tag.id, anychart.SettingsState.SELECTED);
        this.selectedElement_ = {
          type: anychart.graphModule.Chart.Element.NODE,
          id: tag.id
        };
        break;
      case anychart.graphModule.Chart.Element.EDGE:
        this.updateEdgeStateById(tag.id, anychart.SettingsState.SELECTED);
        this.selectedElement_ = {
          type: anychart.graphModule.Chart.Element.EDGE,
          id: tag.id
        };
        break;
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
    var type = tag.type;
    var id = tag.id;
    var state = tag.currentState;
    this.tooltip().hide();
    if (type == anychart.graphModule.Chart.Element.NODE) {
      if (state != anychart.SettingsState.SELECTED) {
        this.updateNodeStateById(id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.nodes_.tooltip();
    } else if (type == anychart.graphModule.Chart.Element.EDGE) {
      if (state != anychart.SettingsState.SELECTED) {
        this.updateEdgeStateById(id, anychart.SettingsState.HOVERED);
      }
      tooltip = this.edges_.tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(type, id));
  } else {
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
    var type = tag.type;
    var id = tag.id;
    this.tooltip().hide();
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      tooltip = this.nodes_.tooltip();
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      tooltip = this.edges_.tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(type, id));
  } else {
    this.tooltip().hide();
  }
};


/**
 * Scale up layer with elements.
 * @param {number} scale Scale factor.
 * @param {number} x
 * @param {number} y
 * @private
 * */
anychart.graphModule.Chart.prototype.doLayerScale_ = function(scale, x, y) {
  this.mainLayer_.scale(scale, scale, x, y);
  this.mainLayer_.scale(scale, scale, x, y);
};


/**
 * Move layer with elements.
 * @param {number} dx
 * @param {number} dy
 * */
anychart.graphModule.Chart.prototype.doLayerTranslate = function(dx, dy) {
  this.mainLayer_.translate(dx, dy);
};


/**
 * Mouse wheel handler.
 * @param {goog.events.MouseWheelEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.handleMouseWheel_ = function(event) {
  if (!this.dragger_.isDragging()) {
    var interactivity = this.interactivity();
    if (interactivity.getOption('enabled')) {
      var dy = goog.math.clamp(event.deltaY, -5, 5) || 1;
      if (interactivity.getOption('zoomOnMouseWheel')) {
        var scale = 1;
        var step = .3 / Math.abs(dy);
        if (dy > 0) {
          scale = 1 - step;
        } else {
          scale = 1 + step;
        }
        this.doLayerScale_(scale, event.clientX, event.clientY);
      }

      if (interactivity.getOption('scrollOnMouseWheel')) {
        this.doLayerTranslate(0, dy);
      }
      event.preventDefault();
    }
  }
};


/**
 * Update edges appearance
 * */
anychart.graphModule.Chart.prototype.updateEdgesAppearance = function() {
  for (var edge in this.getEdgesMap()) {
    var edgeObj = this.getEdgeById(edge);
    this.edges_.updateAppearance(edgeObj);
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  for (var i = 0, length = node.connectedEdges.length; i < length; i++) {
    var edge = this.getEdgesMap()[node.connectedEdges[i]];

    this.edges_.updateLabelStyle(edge);

    var from = this.getNodesMap()[edge.from].position;
    var to = this.getNodesMap()[edge.to].position;
    var path = edge.domElement;
    path
      .clear()
      .moveTo(from.x, from.y)
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
  var width = this.nodes_.getWidth(node);
  var height = this.nodes_.getHeight(node);

  x -= (width / 2);
  y -= (height / 2);

  node.domElement.setPosition(x, y);
};


/**
 * Fit graph into bounds.
 * Calculate most values and offset graph depend on it.
 * */
anychart.graphModule.Chart.prototype.fitNodesCoordinatesIntoContentBounds = function() {
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
anychart.graphModule.Chart.prototype.updtateNodePosition = function(node, dx, dy) {
  node.position.x += dx;
  node.position.y += dy;
};


/**
 * Return transformation matrix of layer with elements.
 * @return {Array.<number>}
 * */
anychart.graphModule.Chart.prototype.getTransformationMatrix = function() {
  return this.mainLayer_.getTransformationMatrix();
};


/**
 * Return absolute x value
 * @param {number} x
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  var matrix = this.getTransformationMatrix();
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
  var matrix = this.getTransformationMatrix();
  var scale = matrix[0];
  var offsetY = matrix[5];
  return (-offsetY * scale + y / scale);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(domTarget.tag);
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateNodeStateById(tag.id, anychart.SettingsState.NORMAL);
      }
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      if (tag.currentState != anychart.SettingsState.SELECTED) {
        this.updateEdgeStateById(tag.id, anychart.SettingsState.NORMAL);
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
  this.nodes_.state(node, state);
  this.nodes_.updateAppearance(node);
  this.nodes_.updateLabelStyle(node);
};


/**
 * Update style of node.
 * @param {string} id
 * @param {anychart.SettingsState} state New State for node.
 * */
anychart.graphModule.Chart.prototype.updateNodeStateById = function(id, state) {
  var node = this.getNodeById(id);
  node.domElement.tag.currentState = state;
  this.updateNode(node, state);
};


/**
 * Update style of edge.
 * @param {anychart.graphModule.Chart.Edge} edge
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdge = function(edge, state) {
  this.edges_.state(edge, state);
  this.edges_.updateAppearance(edge);
  this.edges_.updateLabelStyle(edge);
};


/**
 * Update style of edge.
 * @param {string} edgeId
 * @param {anychart.SettingsState} state New state for edge.
 * */
anychart.graphModule.Chart.prototype.updateEdgeStateById = function(edgeId, state) {
  var edge = this.getEdgeById(edgeId);
  edge.domElement.tag.currentState = state;
  this.updateEdge(edge, state);
};


//endregion
//region Data manipulation
/**
 * Crete node object from data.
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedNode_ = function(i) {
  var nodes = this.data_['nodes'];
  var id = nodes.get(i, 'id');
  if (goog.isDefAndNotNull(id)) {
    id = String(id);
    if (!this.getNodeById(id)) {
      /**
       * @type {anychart.graphModule.Chart.Node}
       * */
      var nodeObj;
      nodeObj = this.nodesMap_[id] = {};
      nodeObj.id = id;
      nodeObj.dataRow = i;
      nodeObj.connectedEdges = [];
      nodeObj.siblings = [];
      nodeObj.currentState = anychart.SettingsState.NORMAL;
      nodeObj.position = {
        x: nodes.get(i, 'x'),
        y: nodes.get(i, 'y')
      };

      var groupId = nodes.get(i, 'group');
      if (goog.isDefAndNotNull(groupId)) {
        if (!this.groupsMap_[groupId]) {
          this.groupsMap_[groupId] = null;
        }
        nodeObj.groupId = groupId;
      }
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODE_ALREADY_EXIST, null, [id], true);
    }
  } else {

  }
};


/**
 * Create edge object from dataRow.
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedEdge_ = function(i) {
  var edges = this.data_['edges'];
  var fromId = edges.get(i, 'from');
  var toId = edges.get(i, 'to');
  var edgeId = edges.get(i, 'id');

  if (goog.isDefAndNotNull(edgeId)) {
    edgeId = String(edgeId);
  } else {
    edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + i;
  }

  if (fromId != toId) {
    var from = this.getNodeById(fromId);
    var to = this.getNodeById(toId);

    if (from && to) {
      var edge = {};

      edge.id = edgeId;
      edge.from = from.id;
      edge.to = to.id;
      edge.dataRow = i;
      edge.currentState = anychart.SettingsState.NORMAL;

      var sibling;
      //check if two node already connected
      for (i = 0; i < from.siblings.length; i++) {
        sibling = from.siblings[i];
        if (sibling == from.id || sibling == to.id) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [from.id, to.id], true);
          return;
        }
      }
      //check if two node already connected
      for (i = 0; i < to.siblings.length; i++) {
        sibling = to.siblings[i];
        if (sibling == from.id || sibling == to.id) {
          anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NODES_ALREADY_CONNECTED, null, [to.id, from.id], true);
          return;
        }
      }
      from.connectedEdges.push(edge.id);
      to.connectedEdges.push(edge.id);
      from.siblings.push(to.id);
      to.siblings.push(from.id);

      this.edgesMap_[edgeId] = edge;
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
  var nodesForProceed = []; // already processed nodes.
  var proceededNodes = []; // nodes we need to process
  var node;
  var gid = 0; //subGraph id

  for (var i = 0, length = nodes.length; i < length; i++) {
    node = nodes[i];
    if (goog.array.indexOf(proceededNodes, node) == -1) {
      var groupId = String(gid);
      this.subGraphGroups_[groupId] = [];
      nodesForProceed.push(node.id);
      nodesForProceed.push.apply(nodesForProceed, node.siblings);
      var proceedNode;
      while (proceedNode = nodesForProceed.pop()) {
        var nodeObject = this.getNodeById(proceedNode);
        if (goog.array.indexOf(proceededNodes, nodeObject) == -1) {
          nodesForProceed.push.apply(nodesForProceed, nodeObject.siblings);
          proceededNodes.push(nodeObject);
          this.subGraphGroups_[groupId].push(proceedNode);
          nodeObject.subGraphId = String(gid);
        }
      }
      gid++;
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
      this.proceedNode_(i);
    }
  }

  for (i = 0, length = edges.getRowsCount(); i < length; i++) {
    dataRow = /**@type {Object}*/(edges.getRow(i));
    if (dataRow) {
      this.proceedEdge_(i);
    }
  }
};


/**
 * Reset DOM of all drawn elements.
 * Dispose all created elements.
 * @private
 * */
anychart.graphModule.Chart.prototype.dropCurrentData_ = function() {
  if (this.nodesMap_) {
    for (var id in this.nodesMap_) {
      var node = this.getNodeById(id);
      this.nodes_.clear(node);
    }
  }

  if (this.edgesMap_) {
    for (var edgeId in this.edgesMap_) {
      var edge = this.getEdgeById(edgeId);
      this.edges_.clear(edge);
    }
  }
  this.nodes().resetLabelSettings();
  this.edges().resetLabelSettings();
  this.nodesMap_ = {};
  this.edgesMap_ = {};
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
  var states = [];
  if (!event.hasSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS))
    states.push(anychart.enums.State.NODES);

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.nodes_.needsMeasureLabels();
    states.push(anychart.enums.State.LABELS_BOUNDS, anychart.enums.State.LABELS_STYLE, anychart.enums.State.LABELS_ENABLED);
  }

  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (event.hasSignal(anychart.Signal.BOUNDS_CHANGED)) {
    states.push(anychart.enums.State.LABELS_ENABLED);
  }
  if (states.length)
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Edge signal handler.
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onEdgeSignal_ = function(event) {
  var states = [];
  if (!event.hasSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS))
    states.push(anychart.enums.State.EDGES);
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.edges_.needsMeasureLabels();
    states.push(anychart.enums.State.LABELS_BOUNDS, anychart.enums.State.LABELS_STYLE, anychart.enums.State.LABELS_ENABLED);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (states.length)
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
};


/**
 * Edge signal handler
 * @param {anychart.SignalEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.onGroupSignal_ = function(event) {
  var states = [];
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW |
    anychart.Signal.BOUNDS_CHANGED |
    anychart.Signal.NEEDS_REAPPLICATION |
    anychart.Signal.ENABLED_STATE_CHANGED)
  ) {
    this.nodes_.needsMeasureLabels();
    states.push(anychart.enums.State.LABELS_BOUNDS, anychart.enums.State.LABELS_STYLE, anychart.enums.State.LABELS_ENABLED);
  }
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    states.push(anychart.enums.State.APPEARANCE);
  }
  if (states.length)
    this.invalidateMultiState(anychart.enums.Store.GRAPH, states, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
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
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_BOUNDS,
      anychart.enums.State.LABELS_ENABLED,
      anychart.enums.State.LAYOUT
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
    anychart.enums.State.LABELS_STYLE,
    anychart.enums.State.LABELS_BOUNDS,
    anychart.enums.State.LABELS_ENABLED,
    anychart.enums.State.LAYOUT
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
  if (!this.nodes_) {
    this.nodes_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nodes_);
    this.nodes_.setupElements();
    this.nodes_.listenSignals(this.onNodeSignal_, this);
    this.nodes_.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }
  if (opt_value) {
    this.nodes_.setup(opt_value);
    return this;
  }
  return this.nodes_;
};


/**
 * Settings object for interactivity.
 * @param {Object=} opt_value Object with interactivity settings
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
 * @suppress {checkTypes}
 * */
anychart.graphModule.Chart.prototype.interactivity = function(opt_value) {
  if (!this.interactivity_) {
    this.interactivity_ = new anychart.graphModule.elements.Interactivity();
    this.setupCreated('interactivity', this.interactivity_);
  }
  if (opt_value) {
    return this;
  }
  return this.interactivity_;
};


/**
 *
 * @param {string} id Id of group
 * @param {Object=} opt_value Config object
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
 * */
anychart.graphModule.Chart.prototype.groups = function(id, opt_value) {
  if (goog.isDefAndNotNull(id)) {
    if (goog.isDef(this.groupsMap_[id])) {
      if (goog.isNull(this.groupsMap_[id])) {
        var group = new anychart.graphModule.elements.Group(this);
        group.listenSignals(this.onGroupSignal_, this);
        this.groupsMap_[id] = group;
      }
      if (opt_value) {
        this.groupsMap_[id].setup(opt_value);
        return this;
      }
      return this.groupsMap_[id];
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_GROUP, null, [id], true);
    }
  }
  return this;
};


/**
 * Layout object.
 * Contains layout functions.
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
 * Edges object.
 * Contains settings for edges.
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Edge)}
 * */
anychart.graphModule.Chart.prototype.edges = function(opt_value) {
  if (!this.edges_) {
    this.edges_ = new anychart.graphModule.elements.Edge(this);
    this.setupCreated('edges', this.edges_);
    this.edges_.setupElements();
    this.edges_.listenSignals(this.onEdgeSignal_, this);
    this.edges_.dispatchSignal(anychart.Signal.MEASURE_COLLECT | anychart.Signal.MEASURE_BOUNDS);
  }
  if (opt_value) {
    this.edges_.setup(opt_value);
    return this;
  }
  return this.edges_;
};


/**
 * Dispatch signal we need measure labels on source elements, and return states for invalidate.
 * @param {anychart.SignalEvent} event
 * @param {anychart.graphModule.Chart.Element} source
 * @return {Array.<anychart.enums.State>} states for invalidate.
 * @private
 * */
anychart.graphModule.Chart.prototype.labelsSettingsInvalidated_ = function(event, source) {
  var states = [anychart.enums.State.LABELS_BOUNDS, anychart.enums.State.LABELS_STYLE, anychart.enums.State.LABELS_ENABLED];
  switch (source) {
    case anychart.graphModule.Chart.Element.GROUP:
    case anychart.graphModule.Chart.Element.NODE:
      states.push(anychart.enums.State.NODES);
      this.nodes_.needsMeasureLabels();
      break;
    case anychart.graphModule.Chart.Element.EDGE:
      states.push(anychart.enums.State.EDGES);
      this.edges_.needsMeasureLabels();
      break;
    default:
      states.push(anychart.enums.State.EDGES, anychart.enums.State.NODES);
      this.nodes_.needsMeasureLabels();
      this.edges_.needsMeasureLabels();
  }
  return states;
};


/**
 * Labels setting object.
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 * */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labels_);
  }

  if (goog.isDef(opt_value)) {
    this.labels_.setup(opt_value);
    return this;
  }

  return this.labels_;
};


/**
 * Return map with edges.
 * @return {Object.<string, anychart.graphModule.Chart.Edge>}
 * */
anychart.graphModule.Chart.prototype.getEdgesMap = function() {
  return this.edgesMap_;
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesMap = function() {
  return this.nodesMap_;
};


/**
 * @return {Object.<string, anychart.graphModule.elements.Group>}
 * */
anychart.graphModule.Chart.prototype.getGroupsMap = function() {
  return this.groupsMap_;
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
    for (var id in this.getNodesMap()) {
      var nodes = this.getNodeById(id);
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
    this.nodes_.updateAppearance(node);
  }
};


//region Draw
/**
 * Append passed node into DOM.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.appendNodeOnLayer = function(node) {
  var domElement = this.nodes_.createDOM(node);
  domElement.parent(this.nodesLayer_);
};


/**
 * Append all nodes on layer
 * */
anychart.graphModule.Chart.prototype.appendNodesOnLayer = function() {
  for (var node in this.getNodesMap()) {
    node = this.getNodeById(node);
    this.appendNodeOnLayer(node);
  }
  this.nodes_.needsMeasureLabels();
};


/**
 * Append edge into layer.
 * @param {anychart.graphModule.Chart.Edge} edge
 * */
anychart.graphModule.Chart.prototype.appendEdgeOnLayer = function(edge) {
  var domElement = this.edges_.createDOM(edge);
  var from = this.getNodeById(edge.from);
  var to = this.getNodeById(edge.to);

  domElement.moveTo(from.position.x, from.position.y);
  domElement.lineTo(to.position.x, to.position.y);

  domElement.parent(this.edgesLayer_);
};


/**
 * Append all nodes on layer.
 * */
anychart.graphModule.Chart.prototype.appendEdgesOnLayer = function() {
  for (var i in this.edgesMap_) {
    var edge = this.getEdgeById(i);
    this.appendEdgeOnLayer(edge);
  }
  this.edges_.needsMeasureLabels();
};


/**
 * Init dragger
 * @param {acgraph.events.BrowserEvent} event
 * @private
 * */
anychart.graphModule.Chart.prototype.initDragger_ = function(event) {
  this.dragger_ = new anychart.graphModule.elements.Dragger(this.rootLayer.domElement(), this.rootLayer);
  var startX, startY;
  var element = null;
  var tag, x, y, dx, dy;
  var node;
  var interactivityEnabled;
  var nodeInteractivityEnabled;
  this.dragger_.listen(goog.fx.Dragger.EventType.START, function(e) {
    interactivityEnabled = this.interactivity().getOption('enabled');
    nodeInteractivityEnabled = this.interactivity().getOption('node');
    if (interactivityEnabled) {
      element = this.dragger_.getTargetElement();
      tag = element.tag;

      if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
        if (nodeInteractivityEnabled) {
          node = this.getNodeById(tag.id);
          startX = this.getXWithTranslate(e.clientX);
          startY = this.getYWithTranslate(e.clientY);
        }
      } else {
        startX = e.clientX;
        startY = e.clientY;
      }

    }
  }, false, this);
  this.dragger_.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
    if (interactivityEnabled) {
      var scale = this.getTransformationMatrix()[0];

      var x = e.clientX;
      var y = e.clientY;

      if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
        if (nodeInteractivityEnabled) {
          x = this.getXWithTranslate(x);
          y = this.getYWithTranslate(y);
          //this.edges().getLabelsLayer().parent(null);
          dx = x - startX;
          dy = y - startY;
          startX = x;
          startY = y;

          this.updtateNodePosition(node, dx, dy);
          this.updateNodeDOMElementPosition(node);
          this.updateEdgesConnectedToNode(node);
          this.updateNode(node, anychart.SettingsState.HOVERED);
        }
      } else {
        dx = (x - startX) / scale; //slowdown drag when zoom are used
        dy = (y - startY) / scale;
        startX = x;
        startY = y;
        this.doLayerTranslate(dx, dy);
      }

    }
  }, false, this);
  this.dragger_.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    if (interactivityEnabled) {
      if (tag && tag.type == anychart.graphModule.Chart.Element.NODE) {
        if (nodeInteractivityEnabled) {
          if (this.interactivity().getOption('magnetize')) {
            this.nodes_.stickNode(node);
            this.updateNodeDOMElementPosition(node);
            this.updateEdgesConnectedToNode(node);
          }
        }
      } else {

      }
    }
  }, false, this);
};


/**
 * Initialize mouseWheel handler.
 * @private
 * */
anychart.graphModule.Chart.prototype.initMouseWheel_ = function() {
  if (!this.mouseWheelHandler_) {
    var element = this.rootLayer.domElement();
    this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(element, false);
    this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.handleMouseWheel_, false, this);
  }
};


/**
 * Update bounds of elements.
 * @param {anychart.math.Rect} bounds
 * @private
 * */
anychart.graphModule.Chart.prototype.updateBoundsOfElements_ = function(bounds) {
  var clipShape = this.clipArea_.shape();

  clipShape.setX(bounds.left);
  clipShape.setY(bounds.top);
  clipShape.setWidth(bounds.width);
  clipShape.setHeight(bounds.height);

  this.eventsInterceptor_.setX(bounds.left);
  this.eventsInterceptor_.setY(bounds.top);
  this.eventsInterceptor_.setWidth(bounds.width);
  this.eventsInterceptor_.setHeight(bounds.height);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.nodes();
    this.edges();
    this.layout();
    this.interactivity();
    console.log(bounds);
    this.mainLayer_ = acgraph.layer();
    this.clipArea_ = acgraph.clip(bounds);
    this.interceptorLayer_ = acgraph.layer();
    this.eventsInterceptor_ = acgraph.rect(bounds.left, bounds.top, bounds.width, bounds.height);
    this.eventsInterceptor_.fill(anychart.color.TRANSPARENT_HANDLER);
    this.eventsInterceptor_.stroke(null);

    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.MOUSEMOVE, this.initDragger_);
    this.eventsHandler.listenOnce(this.eventsInterceptor_, acgraph.events.EventType.MOUSEMOVE, this.initMouseWheel_);
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);

    this.leayerForElements_ = acgraph.layer();
    this.nodesLayer_ = acgraph.layer();
    this.edgesLayer_ = acgraph.layer();
    this.edgesLayer_.parent(this.leayerForElements_);
    this.nodesLayer_.parent(this.leayerForElements_);
    this.edges_.getLabelsLayer().parent(this.leayerForElements_);
    this.nodes_.getLabelsLayer().parent(this.leayerForElements_);
    this.leayerForElements_.parent(this.mainLayer_);

    this.rootLayer.clip(this.clipArea_);
    this.eventsInterceptor_.parent(this.interceptorLayer_);

    this.interceptorLayer_.parent(this.rootLayer);
    this.mainLayer_.parent(this.rootLayer);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT)) {
    this.layout().getCoordinatesForCurrentLayout();
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.ROTATE)) {
    var nodes = this.getNodesArray();
    var center = this.contentBounds.getCenter();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var coordinate = new goog.math.Coordinate(node.position.x, node.position.y);
      coordinate.rotateDegrees(this.rotateDegree_, center);
      node.position.x = coordinate.getX();
      node.position.y = coordinate.getY();
    }
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.ROTATE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.updateBoundsOfElements_(bounds);
    if (this.layout().type() == anychart.graphModule.elements.LayoutType.FORCE) {
      this.fitNodesCoordinatesIntoContentBounds();
    }
    this.appendEdgesOnLayer();
    this.appendNodesOnLayer();

    this.invalidateMultiState(anychart.enums.Store.GRAPH, [
      anychart.enums.State.EDGES,
      anychart.enums.State.NODES,
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_ENABLED,
      anychart.enums.State.LABELS_BOUNDS,
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
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.LABELS_BOUNDS,
      anychart.enums.State.LABELS_ENABLED
    ])) {
    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_STYLE)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.NODES)) {
        this.nodes_.applyLabelsStyle();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.EDGES)) {
        this.edges_.applyLabelsStyle();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_STYLE);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_BOUNDS)) {
      anychart.measuriator.measure();
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_BOUNDS);
    }

    if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_ENABLED)) {
      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.EDGES)) {
        this.edges_.drawLabels();
      }

      if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.NODES)) {
        this.nodes_.drawLabels();
      }
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LABELS_ENABLED);
    }
    this.markMultiStateConsistent(anychart.enums.Store.GRAPH, [anychart.enums.State.EDGES, anychart.enums.State.NODES]);
  }

  if (this.hasStateInvalidation(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM)) {
    this.doLayerScale_(this.zoom_[0], this.zoom_[1], this.zoom_[2]);
    this.doLayerTranslate(this.move_[0], this.move_[1]);

    this.zoom_[0] = 1;
    this.zoom_[1] = this.contentBounds.width / 2;
    this.zoom_[2] = this.contentBounds.height / 2;
    this.move_[0] = 0;
    this.move_[1] = 0;
    this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM);
  }
};


//endregion
//region Chart transform
/**
 * Increase zoom on passed value.
 * @param {number=} opt_value Zoom factor.
 * @param {number=} opt_cx scaling point x.
 * @param {number=} opt_cy scaling point y.
 * @return {number | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.zoom = function(opt_value, opt_cx, opt_cy) {
  var matrix = this.rootLayer.getTransformationMatrix();
  if (goog.isDef(opt_value)) {
    if (!goog.isNull(opt_value)) {
      this.zoom_[0] = opt_value;
    } else {
      this.zoom_[0] = 1 / matrix[0];
    }
    this.zoom_[1] = opt_cx;
    this.zoom_[2] = opt_cy;
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return matrix[0];
};


/**
 * Move chart on passed values.
 * @param {number=} opt_dx movement x.
 * @param {number=} opt_dy movement y.
 * @return {Array.<number> | anychart.graphModule.Chart}
 * */
anychart.graphModule.Chart.prototype.move = function(opt_dx, opt_dy) {
  var matrix = this.rootLayer.getTransformationMatrix();
  if (goog.isDef(opt_dx) || goog.isDef(opt_dx)) {
    if (goog.isDef(opt_dx)) {
      if (!goog.isNull(opt_dx))
        this.move_[0] = opt_dx;
      else
        this.move_[0] = -matrix[4];
    }
    if (goog.isDef(opt_dy)) {
      if (!goog.isNull(opt_dy))
        this.move_[1] = opt_dy;
      else
        this.move_[1] = -matrix[5];
    }
    this.invalidateState(anychart.enums.Store.GRAPH, anychart.enums.State.TRANSFORM, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return [matrix[4], matrix[5]];
};


/**
 * Return chart back to initial state.
 * Reset zoom and move of chart.
 * */
anychart.graphModule.Chart.prototype.fit = function() {
  this.mainLayer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
};


/**
 * Rotate coordinates of graph on passed degree.
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
      anychart.enums.State.LABELS_STYLE,
      anychart.enums.State.ROTATE,
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
    if (goog.isNull(opt_value) || (goog.isDef(opt_value['nodes']) && goog.isDef(opt_value['edges']))) {
      var nodes = opt_value && opt_value['nodes'] ? opt_value['nodes'] : null;
      var edges = opt_value && opt_value['edges'] ? opt_value['edges'] : null;
      var data;

      var dataElement = nodes;
      if (this.rawDataForNodes !== dataElement) {
        this.rawDataForNodes = dataElement;
        if (this.data_ && this.data_['nodes']) {
          this.data_['nodes'].unlistenSignals(this.dataInvalidated_);
          goog.dispose(this.data_['nodes']);
        }

        if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
          data = dataElement.mapAs();
        } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
          data = dataElement.derive();
        } else {
          data = anychart.data.set(dataElement).mapAs();
        }
        data.listenSignals(this.dataInvalidated_, this);
        this.data_['nodes'] = data;
      }

      dataElement = edges;
      if (this.rawDataForEdges !== dataElement) {
        this.rawDataForEdges = dataElement;
        if (this.data_ && this.data_['edges']) {
          this.data_['edges'].unlistenSignals(this.dataInvalidated_);
          goog.dispose(this.data_['edges']);
        }
        if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
          data = dataElement.mapAs();
        } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
          data = dataElement.derive();
        } else {
          data = anychart.data.set(dataElement).mapAs();
        }
        data.listenSignals(this.dataInvalidated_, this);
        this.data_['edges'] = data;
      }

      this.dropCurrentData_();
      this.prepareNewData_();
      this.setupGroupsForChart_();

      var statesForInvalidate = [
        anychart.enums.State.DATA,
        anychart.enums.State.APPEARANCE,
        anychart.enums.State.LABELS_STYLE,
        anychart.enums.State.LABELS_BOUNDS,
        anychart.enums.State.LABELS_ENABLED,
        anychart.enums.State.LAYOUT
      ];
      this.invalidate(anychart.ConsistencyState.BOUNDS);
      this.invalidateMultiState(anychart.enums.Store.GRAPH, statesForInvalidate, anychart.Signal.NEEDS_REDRAW);
    } else {
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_DATA_HAS_NO_FIELD, null, [], true);
    }
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

  for (i in this.groupsMap_) {
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

  if ('rotate' in config)
    this.rotate(config['rotate']);

  if ('labels' in config)
    this.labels().setup(config['labels']);

  if ('tooltip' in config)
    this.tooltip().setup(config['tooltip']);

  if ('layout' in config) {
    this.layout().setup(config['layout']);
    if (config['layout']['type'] == anychart.graphModule.elements.LayoutType.FORCE) {
      this.markStateConsistent(anychart.enums.Store.GRAPH, anychart.enums.State.LAYOUT);
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
  goog.disposeAll(
    this.edges_,
    this.nodes_,
    this.interactivity_,
    this.layout_,
    this.dragger_
  );
  this.edges().disposeInternal();
  this.nodes().disposeInternal();
  this.nodesArray_ = null;
  this.edgesArray_ = null;

  this.edges_ = null;
  this.nodes_ = null;
  this.interactivity_ = null;
  this.layout_ = null;

  this.edgesMap_ = {};
  this.nodesMap_ = {};
  this.groupsMap_ = {};

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
  proto['noData'] = proto.noData;
})();
//endregion
