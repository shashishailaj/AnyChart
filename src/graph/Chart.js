//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.core.ui.LabelsSettings');
goog.require('anychart.graphModule.elements.Edge');
// goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Interactivity');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');
goog.require('goog.fx.Dragger');


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
    this.handleMouseOverAndMove,
    this.handleMouseOut,
    this.handleMouseClick,
    this.handleMouseOverAndMove,
    function(mouseEvent) {
      // console.log(mouseEvent);
    },
    this.handleMouseDown);


  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   * @const
   * */
  this.pathes_ = [];

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Node>}
   * @private
   * */
  this.nodes_ = {}; //todo should use Map here
  this.groups_ = {};

  /**
   * @type {Object.<string, anychart.graphModule.Chart.Edge>}
   * @private
   * */
  this.edges_ = {};

  this.shapes = {};

  this.scale_ = 1;
  this.xDifference = 0;
  this.yDifference = 0;

  /**
   * @type {anychart.graphModule.elements.Interactivity}
   * @private
   * */
  this.interactivity_;


  /**
   * Layer for edge's labels
   * */
  this.edgesLabelsLayer = this.edges().getLabelsLayer();
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, []);
  this.data(opt_data);

  this.mouseWheelHandler_;
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


//todo
/**
 * @typedef {{
 *  nodeId: (string|number),
 *  groupId: (string|number),
 *  settings: Object,
 *  dataRow: number,
 *  fill: acgraph.vector.Fill,
 *  stroke: acgraph.vector.Stroke,
 *  shape: (anychart.enums.MarkerType|string),
 *  position: {
 *    x:number,
 *    y:number
 *  },
 *  currentState: anychart.SettingsState,
 *  domElement: anychart.vector.Path,
 *  textElement: anychart.core.ui.OptimizedText,
 *  labelsSettings: {
 *    position: {
 *      x: number,
 *      y: number
 *    }
 *  },
 *  connectedEdges: Array.<string>,
 *  value: string
 * }}
 * */
anychart.graphModule.Chart.Node;


/**
 * @typedef {{
 *  id: (string|number),
 *  dataRow: number,
 *  from: string,
 *  to: string,
 *  stroke: acgraph.vector.Stroke,
 *  labelsSettings: {
 *    position: {
 *      x: number,
 *      y: number
 *    },
 *    rotation: number
 *  },
 *  currentState: anychart.SettingsState,
 *  domElement: anychart.vector.Path,
 *  textElement: anychart.core.ui.OptimizedText
 * }}
 * */
anychart.graphModule.Chart.Edge;


/**
 * @typedef {{
 *  id: string,
 *  type: anychart.graphModule.Chart.Element
 * }}
 * */
anychart.graphModule.Chart.Tag;


//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS |
  anychart.Signal.NEEDS_REDRAW_APPEARANCE;


/**
 * Supported consistency states.
 * @type {number}
 */
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
 */
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


/**
 * @param {Object} coordinates
 * */
anychart.graphModule.Chart.prototype.setCoordinatesForNodes = function(coordinates) {
  for (var i = 0, length = coordinates.length; i < length; i++) {
    var coord = coordinates[i];
    this.getNodeById(coord.nodeId).position = coord.position;
  }
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
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(tag) {
  if (tag.type == anychart.graphModule.Chart.Element.NODE) {
    var node = this.getNodeById(tag.id);
    return this.nodes().createFormatProvider(node);
  } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
    var edge = this.getEdgeById(tag.id); //todo
    return this.edges().createFormatProvider(edge);
  }
};


//endregion
//region Event handlers and interactivity


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  var tag = /**@type {anychart.graphModule.Chart.Tag}*/(event['domTarget'].tag);
  if (tag && (tag.type == anychart.graphModule.Chart.Element.NODE)) {
    // console.log('clc', event);
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  var tooltip;
  if (tag) {
    this.tooltip().hide();
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      var node = this.getNodesMap()[tag.id];
      node.currentState = anychart.SettingsState.HOVERED;
      tooltip = this.nodes().tooltip();
      this.updateNodesState(node);
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      tooltip = this.edges().tooltip();
    }
    tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(/** @type {Object} */ (tag)));
  }
  else {
    this.tooltip().hide();
  }
};


/**
 * Update path data of each edge connected to node.
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateEdgesConnectedToNode = function(node) {
  for (var i = 0, length = node.connectedEdges.length; i < length; i++) {
    var edge = this.getEdgesMap()[node.connectedEdges[i]];
    this.edges().updateLabelPosition(edge);
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
  var size = this.nodes().resolveSettings(node, 'size');
  x -= size / 2;
  y -= size / 2;
  node.domElement.setPosition(x, y);
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseDown = function(event) {
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
 * @param {anychart.graphModule.Chart.Node} node
 * @param {number} dx
 * @param {number} dy
 * */
anychart.graphModule.Chart.prototype.setNodePosition = function(node, dx, dy) {
  node.position.x += dx; //Coordinates -> data?
  node.position.y += dy;

  node.labelsSettings.position.x += dx;
  node.labelsSettings.position.y += dy;
};


/**
 * Return absolute x value
 * @param {number} x
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getXWithTranslate = function(x) {
  return (-this.xDifference + x) / this.scale_;
};


/**
 * Return absolute y value
 * @param {number} y
 * @return {number}
 * */
anychart.graphModule.Chart.prototype.getYWithTranslate = function(y) {
  return (-this.yDifference + y) / this.scale_;
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.nodeDragInteractivity = function(node, domTarget, event) {
  var dragger = new goog.fx.Dragger(domTarget['domElement']());
  var startX, startY;

  dragger.listen(goog.fx.Dragger.EventType.START, /** @this {anychart.graphModule.Chart}*/ function(e) {
    startX = this.getXWithTranslate(event.clientX);
    startY = this.getYWithTranslate(event.clientY);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.DRAG, /** @this {anychart.graphModule.Chart}*/ function(e) {
    this.edges().getLabelsLayer().parent(null);
    var x = this.getXWithTranslate(e.clientX);
    var y = this.getYWithTranslate(e.clientY);

    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;

    this.setNodePosition(node, dx, dy);
    this.updateNodeDOMElementPosition(node);
    this.updateEdgesConnectedToNode(node);
    this.nodes().updateLabelPosition(node);
  }, false, this);

  dragger.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    if (this.interactivity().getOption('magnetize')) {
      this.nodes().stickNode(node);
      this.updateNodeDOMElementPosition(node);
      this.updateEdgesConnectedToNode(node);
    }
    this.nodes().updateLabelPosition(node);
    this.edges().getLabelsLayer().parent(this.rootLayer);
    dragger.dispose();
  }, false, this);

  dragger.startDrag(event['getOriginalEvent']());
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.layerDragInteractivity = function(domTarget, event) {
  var domElement = new goog.fx.Dragger(domTarget['domElement']());
  var startX = 0, startY = 0;
  domElement.listen(goog.fx.Dragger.EventType.START, function(e) {
    startX = event.clientX;
    startY = event.clientY;
  }, false, this);
  domElement.listen(goog.fx.Dragger.EventType.DRAG, function(e) {
    var x = e.clientX;
    var y = e.clientY;
    var dx = x - startX;
    var dy = y - startY;
    startX = x;
    startY = y;
    this.xDifference += dx;
    this.yDifference += dy;

    this.rootLayer.translate(dx, dy);

  }, false, this);
  domElement.listen(goog.fx.Dragger.EventType.END, /** @this {anychart.graphModule.Chart}*/ function(e) {
    domElement.dispose();
  }, false, this);
  domElement.startDrag(event['getOriginalEvent']());
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  var domTarget = event['domTarget'];
  var tag = domTarget.tag;
  if (tag) {
    if (tag.type == anychart.graphModule.Chart.Element.NODE) {
      var node = this.getNodesMap()[tag.id];
      node.currentState = anychart.SettingsState.NORMAL;
      this.updateNodesState(node);
    } else if (tag.type == anychart.graphModule.Chart.Element.EDGE) {
      console.log('in edge');
    }
  }
  // this.tooltip().hide();
};


anychart.graphModule.Chart.prototype.updateNodesState = function(node) {
  this.updatePathShape(node, anychart.SettingsState.NORMAL);
  this.updateNodeColors(node);
  this.nodes().updateLabelStyle(node);
  this.nodes().updateLabelPosition(node);
};


//endregion
//region Data manipulation
anychart.graphModule.Chart.prototype.proceedRawData = function(data) {
  var connectors = data['connectors'],
    nodes = data['nodes'];

  var connectorsDataSet = anychart.data.set(connectors);
  var nodesDataSet = anychart.data.set(nodes);
  return {'nodes': nodesDataSet, 'connectors': connectorsDataSet};
};


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
    nodeObj.settings = {};
    nodeObj.connectedEdges = [];
    nodeObj.labelsSettings = {};
    nodeObj.labelsSettings.position = {x: 0, y: 0};
    nodeObj.position = {
      x: dataRow['x'],
      y: dataRow['y']
    };
  }

  var groupId = dataRow['group'];
  if (goog.isDefAndNotNull(groupId)) {
    if (!this.groups_[groupId]) {
      this.groups_[groupId] = {};
    }
    this.groups_[groupId][nodeId] = dataRow;
    this.nodes_[nodeId].groupId = this.groups_[groupId];
  }
};


/**
 * @param {Object} edgeRow
 * @param {number} i Row number.
 * @private
 * */
anychart.graphModule.Chart.prototype.proceedEdge_ = function(edgeRow, i) {
  var from = edgeRow['from'];
  var to = edgeRow['to'];
  var edgeId = edgeRow['id'];

  if (goog.isDef(edgeId)) {
    edgeId = edgeId.toString();
  } else {
    edgeId = anychart.graphModule.Chart.Element.EDGE + '_' + i;
  }

  this.edges_[edgeId] = {};
  this.edges_[edgeId].id = edgeId;
  this.edges_[edgeId].from = from;
  this.edges_[edgeId].to = to;
  this.edges_[edgeId].dataRow = i;
  this.edges_[edgeId].labelsSettings = {
    position: {x: 0, y: 0},
    rotation: 0
  };

  if (!this.getNodeById(from)) {
    this.nodes_[from] = {};
  }
  if (!this.getNodeById(to)) {
    this.nodes_[to] = {};
  }
};

/**
 * @param {Object<string, anychart.data.Mapping>} data
 * */
anychart.graphModule.Chart.prototype.proceedData_ = function(data) {
  var edges = /** @type {anychart.data.Set} */(data['edges']),
    nodes = /** @type {anychart.data.Set} */(data['nodes']),
    length,
    i;

  for (i = 0, length = nodes.getRowsCount(); i < length; i++) {
    this.proceedNode_(nodes.getRow(i), i);
  }

  for (i = 0, length = edges.getRowsCount(); i < length; i++) {
    this.proceedEdge_(edges.getRow(i), i);
  }
};

/**
 * @param {anychart.SignalEvent} event
 * */
anychart.graphModule.Chart.prototype.onNodeSignal_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW_APPEARANCE)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW_APPEARANCE);
  }
};


anychart.graphModule.Chart.prototype.nodesDataInvalidated_ = function(e) {
  console.log('nodes', e);
};

anychart.graphModule.Chart.prototype.edgesDataInvalidated_ = function(e) {
  // console.log('edges', e);
};

/**
 * Get/set data for chart.
 * @param {Object=} opt_value
 * @return {(Object | anychart.graphModule.Chart)}
 * */
anychart.graphModule.Chart.prototype.data = function(opt_value) {

  if (goog.isDef(opt_value)) {
    var data = opt_value;
    var dataElement = data['nodes'];
    if (this.rawDataForNodes != dataElement) {
      this.rawDataForNodes = dataElement;
      if (this.data_ && this.data_['nodes']) {
        this.data_['nodes'].unlistenSignals(this.nodesDataInvalidated_);
        goog.dispose(this.data_['nodes']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['nodes'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['nodes'] = dataElement.derive();
      } else {
        data['nodes'] = anychart.data.set(dataElement).mapAs();
      }
      data['nodes'].listenSignals(this.nodesDataInvalidated_);
    }

    dataElement = data['edges'];
    if (this.rawDataForEdges != dataElement) {
      this.rawDataForEdges = dataElement;
      if (this.data_ && this.data_['edges']) {
        this.data_['edges'].unlistenSignals(this.edgesDataInvalidated_);
        goog.dispose(this.data_['edges']);
      }
      if (anychart.utils.instanceOf(dataElement, anychart.data.Set)) {
        data['edges'] = dataElement.mapAs();
      } else if (anychart.utils.instanceOf(dataElement, anychart.data.View)) {
        data['edges'] = dataElement.derive();
      } else {
        data['edges'] = anychart.data.set(dataElement).mapAs();
      }
      data['edges'].listenSignals(this.edgesDataInvalidated_, this);
    }

    this.proceedData_(data);
    this.data_ = data;
    return this;
  }
  return this.data_;
};

//endregion


//todo jsdoc

//region Elements
/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 * */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nds_) {
    this.nds_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nds_);
    this.nds_.setupElements();
    this.nds_.listenSignals(this.onNodeSignal_, this);
  }
  if (opt_value) {
    this.nds_.setup(opt_value);
    return this;
  }
  return this.nds_;
};


// /**
//  * @param {Object=} opt_value
//  * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
//  * */
// anychart.graphModule.Chart.prototype.groups = function(opt_value) {
//   if (!this.grps_) {
//     this.grps_ = new anychart.graphModule.elements.Group(this);
//   }
//   if (opt_value) {
//
//     return this;
//   }
//   return this.grps_;
// };


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Layout)}
 * */
anychart.graphModule.Chart.prototype.layout = function(opt_value) {
  if (!this.layout_) {
    this.layout_ = new anychart.graphModule.elements.Layout(this);
    this.setupCreated('layout', this.layout_);
  }
  if (opt_value) {
    return this;
  }
  return this.layout_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Edge)}
 * */
anychart.graphModule.Chart.prototype.edges = function(opt_value) {
  if (!this.edge_) {
    this.edge_ = new anychart.graphModule.elements.Edge(this);
    this.setupCreated('edges', this.edge_);
    this.edge_.setupElements();
  }
  if (opt_value) {
    return this;
  }
  return this.edge_;
};

anychart.graphModule.Chart.prototype.labelsSettingsInvalidated_ = function() {

};

/**
 * @param {Object=} opt_value - Settings object.
 * @return {(anychart.graphModule.Chart|anychart.core.ui.LabelsSettings)} - Current value or itself for method chaining.
 */
anychart.graphModule.Chart.prototype.labels = function(opt_value) {
  if (!this.labelsSettings_) {
    this.labelsSettings_ = new anychart.core.ui.LabelsSettings();
    this.setupCreated('labels', this.labelsSettings_);
    this.labelsSettings_.listenSignals(this.labelsSettingsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.labelsSettings_.setup(opt_value);
    // this.invalidate();
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
 * @param {string} id
 * @return {anychart.graphModule.Chart.Edge}
 * */
anychart.graphModule.Chart.prototype.getEdgeById = function(id) {
  return this.getEdgesMap()[id];
};


/**
 * @return {Object.<string, anychart.graphModule.Chart.Node>}
 * */
anychart.graphModule.Chart.prototype.getNodesMap = function() {
  return this.nodes_;
};


/**
 * @param {string} id
 * @return {anychart.graphModule.Chart.Node}
 * */
anychart.graphModule.Chart.prototype.getNodeById = function(id) {
  return this.getNodesMap()[id];
};

//ednregion

/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Interactivity)}
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


//Todo custom shape
/**
 * @param {anychart.graphModule.Chart.Node} node
 * @return {function(!acgraph.vector.Path, number, number, number, number=):!acgraph.vector.Path} Marker drawer.
 * */
anychart.graphModule.Chart.prototype.getShape = function(node, state) {
  var type = this.nodes().getShapeType(node, state);
  return anychart.utils.getMarkerDrawer(type);
};


/**
 * Update path data for new state.
 * @param {anychart.graphModule.Chart.Node} node
 * @param {anychart.SettingsState} nodeState
 * */
anychart.graphModule.Chart.prototype.updatePathShape = function(node, nodeState) {

  var size = this.nodes().resolveSettings(node, 'size');
  var path = node.domElement;
  path.clear();
  if (path.domElement()) {
    path.domElement().removeAttribute('transform');
  }
  var x = node.position.x;
  var y = node.position.y;
  var radius = size / 2;

  var drawer = this.getShape(node, nodeState);
  drawer(path, x, y, radius);
};


/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.updateNodeColors = function(node) {
  var fill = this.nodes().resolveSettings(node, 'fill');//enum here
  var stroke = this.nodes().resolveSettings(node, 'stroke');//enum here

  node.domElement.fill(fill);
  node.domElement.stroke(stroke);
};


anychart.graphModule.Chart.prototype.updateNodeAppearance = function(node) {
  this.updatePathShape(node);
  this.updateNodeColors(node);
};

anychart.graphModule.Chart.prototype.updateNodesAppearance = function() {
  for (var node in this.getNodesMap()) {
    node = this.getNodeById(node);
    this.updateNodeAppearance(node);
  }
};

/**
 * @param {anychart.graphModule.Chart.Node} node
 * */
anychart.graphModule.Chart.prototype.drawNode = function(node) {
  var domElement = this.rootLayer.path();

  domElement.tag = /**@type {anychart.graphModule.Chart.Tag}*/({});
  domElement.tag.type = anychart.graphModule.Chart.Element.NODE;
  domElement.tag.id = node.nodeId;

  node.domElement = domElement;
  // console.log(domElement);
  // this.rootLayer.circle(node.x, node.y, 5);
};


/**
 * */
anychart.graphModule.Chart.prototype.drawNodes = function() {
  for (var node in this.getNodesMap()) {
    node = this.getNodeById(node);
    this.drawNode(node);
    node.currentState = anychart.SettingsState.NORMAL;
  }
};


//todo jsdoc. Edge for self connected node. Labels.


anychart.graphModule.Chart.prototype.drawEdge = function(edge) {
  var path = this.rootLayer.path();
  var from = this.getNodeById(edge.from);
  var to = this.getNodeById(edge.to);

  from.connectedEdges.push(edge.id);
  to.connectedEdges.push(edge.id);
  edge.domElement = path;
  edge.domElement.tag = {};
  edge.domElement.tag.id = edge.id;
  edge.domElement.tag.type = anychart.graphModule.Chart.Element.EDGE;


  path.moveTo(from.position.x, from.position.y)
    .lineTo(to.position.x, to.position.y);
};


//
/**
 * Draw all edges.
 * */
anychart.graphModule.Chart.prototype.drawEdges = function() {
  for (var i in this.edges_) {
    var edge = this.edges_[i];
    this.drawEdge(edge);
    edge.currentState = 0; //todo state here
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    this.rootLayer.scale(this.scale_, this.scale_);
    // console.log(this.rootLayer);
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
  }
  // if(!this.mouseWheelHandler_){
  //   // console.log(this.container().getStage());
  //   this.mouseWheelHandler_ = new acgraph.events.MouseWheelHandler(window.document.querySelector('#id_1'));
  //   // console.log(goog.events.WheelEvent.EventType.WHEEL);
  //   this.mouseWheelHandler_.listen(goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, function(e) {
  //     // console.log('wheel');
  //   });
  // }
  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    console.log('draw');
    this.rootLayer.removeChildren();
    var coords = this.layout().getCoordinatesForCurrentLayout();
    this.setCoordinatesForNodes(coords);
    this.drawEdges();
    this.drawNodes();
  }
  for (var edge in this.edges_) {
    edge = this.edges_[edge];
    this.edges().calculateLabelPositionForEdge(edge);
    this.edges().updateEdgeColor(edge, 0);//todo
    // this.rootLayer.circle(this.edges_[edge].labelsSettings.position.x, this.edges_[edge].labelsSettings.position.y, 1);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    console.log('appearance');
    this.updateNodesAppearance();
  }

  this.edges().provideMeasurements();
  this.edges().applyLabelsStyle();
  this.edges().drawLabels();
  this.edges().getLabelsLayer().parent(this.rootLayer);

  this.nodes().provideMeasurements();
  this.nodes().applyLabelsStyle();
  this.nodes().drawLabels();
  this.nodes().getLabelsLayer().parent(this.rootLayer);


  this.nodes().setInitialLabelsPosition();
  this.nodes().updateNodeLabelsPosition();

  this.markConsistent(anychart.ConsistencyState.ALL);
  // anychart.measuriator.measure();
};


/**
 * Return chart back to initial state.
 * */
anychart.graphModule.Chart.prototype.fit = function() {
  this.rootLayer.translate(-this.xDifference, -this.yDifference);
  this.scale_ = 1;
  this.xDifference = 0;
  this.yDifference = 0;
};


//endregion
//region Serialize, setup, dispose
/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);

  json['data'] = {
    'nodes': this.data()['nodes'].serialize(),
    'edges': this.data()['edges'].serialize()
  };

  json['nodes'] = this.nodes().serialize();
  json['edges'] = this.edges().serialize();
  // json['groups'] = this.groups().serialize();
  json['interactivity'] = this.interactivity().serialize();
  //config['zoom'] = this.interactivity().serialize();
  return json;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);

  if ('edges' in config)
    this.edges().setupInternal(config['edges']);
  if ('nodes' in config)
    this.nodes().setupInternal(config['nodes']);
  // if ('groups' in config)
  //   this.nodes().setupInternal(config['groups']);
  if ('interactivity' in config)
    this.nodes().setupInternal(config['interactivity']);
  //zoom
  //translate
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.disposeInternal = function() {
  anychart.graphModule.Chart.base(this, 'disposeInternal');
  //TODO dispose
  goog.disposeAll();
};


//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.Chart.prototype;
  proto['data'] = proto.data;
  proto['edges'] = proto.edges;
  proto['fit'] = proto.fit;
  // proto['groups'] = proto.groups;
  proto['nodes'] = proto.nodes;
  proto['layout'] = proto.layout;
  proto['interactivity'] = proto.interactivity;
})();


//endregion
