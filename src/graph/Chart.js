//region Provide and require
goog.provide('anychart.graphModule.Chart');

goog.require('anychart.core.Chart');
goog.require('anychart.graphModule.elements.Group');
goog.require('anychart.graphModule.elements.Layout');
goog.require('anychart.graphModule.elements.Node');

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
    null,
    this.handleMouseDown);

  this.connectors_ = [];
  this.nodes_ = {};
  this.groups_ = {};

  this.nodesInstances = {};
  this.groupsInstances = {};
  this.shapes = {};

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [

  ]);
  this.data(opt_data);
};
goog.inherits(anychart.graphModule.Chart, anychart.core.Chart);


/**
 * @typedef Node {
 *  nodeId: (string|number),
 *  groupId: (string|number),
 *  settings: Object,
 *  dataRow: number,
 *  position: Object,
 * }
 * */
//endregion
//region Properties
/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.Chart.prototype.SUPPORTED_SIGNALS = anychart.core.Chart.prototype.SUPPORTED_SIGNALS;


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

  anychart.core.settings.createDescriptors(map, [

  ]);

  return map;
})();
anychart.core.settings.populate(anychart.graphModule.Chart, anychart.graphModule.Chart.OWN_DESCRIPTORS);


/**
 * Enum for elements
 * @enum {string}
 * */
anychart.graphModule.Chart.Element = {
  NODE: 'node',
  GROUP: 'group'
};


/**
 * @param {Object} coordinates
 * */
anychart.graphModule.Chart.prototype.setCoordinatesForNodes = function(coordinates) {
  for (var i = 0, length = coordinates.length; i < length; i++) {
    var coord = coordinates[i];
    this.nodes_[coord.nodeId].position = coord.position;
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
 * @param {anychart.treeDataModule.Tree.DataItem} element Object with data for tooltip.
 * @return {anychart.format.Context}
 */
anychart.graphModule.Chart.prototype.createContextProvider = function(element) {
  // if (!this.contextProvider_)
  //   this.contextProvider_ = new anychart.format.Context();
  //
  // var values = {};
  //
  // if (element) {
  //   values['value'] = {value: element.get('value'), type: anychart.enums.TokenType.STRING};
  //   values['weight'] = {value: element.meta('weight'), type: anychart.enums.TokenType.NUMBER};
  // }
  // this.contextProvider_.dataSource(element);
  // return /** @type {anychart.format.Context} */ (this.contextProvider_.propagate(values));
};


//endregion
//region Event handlers and interactivity


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.graphModule.Chart.prototype.dataInvalidated_ = function(event) {
  // if (event.hasSignal(anychart.Signal.DATA_CHANGED)) {
  //   this.invalidate(anychart.ConsistencyState.TREE_DATA | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  // }
};


/**
 * Mouse click internal handler.
 * @param {anychart.core.MouseEvent} event - Event object.
 */
anychart.graphModule.Chart.prototype.handleMouseClick = function(event) {
  // if (event['button'] != acgraph.events.BrowserEvent.MouseButton.LEFT) return;
  // var tag = /**@type {anychart.graphModule.Chart.DOMdata}*/(event['domTarget'].tag);
  // if (tag && tag.node) {
  //   this.showAll();
  //   this.drillTo(tag.node);
  // }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOverAndMove = function(event) {
  // if (event.domTarget.tag && event.domTarget.tag.type == 'node') {
  //   console.log('here');
  // }

  // var tag = /** @type {acgraph.vector.Path} */ (event['domTarget']).tag;
  // var tooltip;
  //
  // //Show tooltip only on nodes with data
  // if (tag && tag.node && !tag.isPlug) {
  //   var node = /** @type {anychart.treeDataModule.Tree.DataItem} */ (tag.node);
  //   tooltip = this.tooltip();
  //   tooltip.showFloat(event['clientX'], event['clientY'], this.createContextProvider(node));
  // } else {
  //   this.tooltip().hide();
  // }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseDown = function(event) {
  // if (event.domTarget.tag && event.domTarget.tag.type == 'node') {
  //   console.log('here', event);
  // }




};

/** @inheritDoc */
anychart.graphModule.Chart.prototype.handleMouseOut = function(event) {
  // this.tooltip().hide();
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
 * @param {Object} node
 * */
anychart.graphModule.Chart.prototype.proceedNode_ = function(node, i) {
  var nodeId = node['id'];
  if (goog.isDef(nodeId)) {
    nodeId = nodeId.toString();
  } else {
    nodeId = 'node_' + i;
    node['id'] = nodeId;
  }
  if (!this.nodes_[nodeId]) {
    this.nodes_[nodeId] = {
      nodeId: nodeId,
      dataRow: i,
      settings: {},
      position: {
        x: node['x'],
        y: node['y']
      }
    };
  }

  var groupId = node['group'];
  if (goog.isDefAndNotNull(groupId)) {
    if (!this.groups_[groupId]) {
      this.groups_[groupId] = {};
    }
    this.groups_[groupId][nodeId] = node;
    this.nodes_[nodeId].groupId = this.groups_[groupId];
  }
};


anychart.graphModule.Chart.prototype.proceedEdge_ = function(edgeRow) {
  var from = edgeRow['from'];
  var to = edgeRow['to'];

  if (!this.nodes_[from]) {
    this.nodes_[from] = {};
  }
  if (!this.nodes_[to]) {
    this.nodes_[to] = {};
  }
};


anychart.graphModule.Chart.prototype.proceedData = function(data) {
  var connectors = /** @type {anychart.data.Set} */(data['edges']),
      nodes = /** @type {anychart.data.Set} */(data['nodes']),
      length,
      i;

  if (connectors.getRowsCount() && !nodes.getRowsCount()) { //In data only connectors
    for (i = 0, length = connectors.getRowsCount(); i < length; i++) {
      this.proceedEdge_(connectors.getRow(i));
    }
  }

  for (i = 0, length = nodes.getRowsCount(); i < length; i++) {
    this.proceedNode_(nodes.getRow(i), i);
  }

  this.connectors_ = connectors || [];
};


anychart.graphModule.Chart.prototype.nodesDataInvalidated_ = function(e) {
  console.log(e);
  //if chart.layout != fixed redraw chart
  //else draw new node
  //
};

anychart.graphModule.Chart.prototype.edgesDataInvalidated_ = function(e) {
  //redraw connectors
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
        data['nodes'] = anychart.data.set(dataElement);
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
        data['edges'] = anychart.data.set(dataElement);
      }
      data['nodes'].listenSignals(this.edgesDataInvalidated_, this);
    }

    this.proceedData(data);
    this.data_ = data;
    return this;
  }
  return this.data_;
};

//endregion


//todo jsdoc
/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Node)}
 * */
anychart.graphModule.Chart.prototype.nodes = function(opt_value) {
  if (!this.nds_) {
    this.nds_ = new anychart.graphModule.elements.Node(this);
    this.setupCreated('nodes', this.nds_);
    this.nds_.setupElements();
  }
  if (opt_value) {

    return this;
  }
  return this.nds_;
};


/**
 * @param {Object=} opt_value
 * @return {(anychart.graphModule.Chart|anychart.graphModule.elements.Group)}
 * */
anychart.graphModule.Chart.prototype.groups = function(opt_value) {
  if (!this.grps_) {
    this.grps_ = new anychart.graphModule.elements.Group(this);
  }
  if (opt_value) {

    return this;
  }
  return this.grps_;
};


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
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} id
 * @return {boolean}
 * */
anychart.graphModule.Chart.prototype.hasInstance = function(type, id) {
  var result = false;

  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      result = id in this.nodesInstances;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      result = id in this.groupsInstances;
      break;
  }
  return result;
};


/**
 * Create node instance.
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} elementId
 * @return {anychart.graphModule.elements.Node} instance element.
 * @private
 * */
anychart.graphModule.Chart.prototype.createElementInstance_ = function(type, elementId) {
  var element;
  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      element = new anychart.graphModule.elements.Node(this, elementId);
      this.nodesInstances[elementId] = element;
      this.nodes_[elementId].instance = element;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      element = new anychart.graphModule.elements.Group(this);
      this.groupsInstances[elementId] = element;
      this.groups_[elementId].instance = element;
      break;
  }

  //todo setup element here

  return element;
};


/**
 * Create node instance.
 * @param {anychart.graphModule.Chart.Element} type
 * @param {string} elementId
 * @return {?(anychart.graphModule.elements.Node|anychart.graphModule.elements.Group)} instance of element.
 * */
anychart.graphModule.Chart.prototype.getElementInstance = function(type, elementId) {
  var rawElementsContainer,
    containerWithInstances;

  switch (type) {
    case anychart.graphModule.Chart.Element.NODE:
      rawElementsContainer = this.nodes_;
      containerWithInstances = this.nodesInstances;
      break;
    case anychart.graphModule.Chart.Element.GROUP:
      rawElementsContainer = this.groups_;
      containerWithInstances = this.groupsInstances;
      break;
  }

  if (elementId in rawElementsContainer) {
    var element;
    if (elementId in containerWithInstances) {
      element = containerWithInstances[elementId];
    } else {
      element = this.createElementInstance_(type, elementId);
    }
    return element;
  }
  return null;
};


/**
 *
 * */
anychart.graphModule.Chart.prototype.resolveSettingsForNode = function(node, setting, state) {
  switch (state) {
    case anychart.SettingsState.HOVERED:
      state = 'selected';
      break;
    case anychart.SettingsState.SELECTED:
      state = 'selected';
      break;
    default:
      state = 'normal';
      break;
  }

  var defaultNodeSetting = this.nodes()[state]()[setting]();//
  var defaultGroupSetting = this.groups()[state]()[setting]();
  var settingForSpecificNode,
      settingForSpecificGroup;
  if (this.hasInstance(anychart.graphModule.Chart.Element.NODE, node.id)) {
    settingForSpecificNode = this.getElementInstance(anychart.graphModule.Chart.Element.NODE, node.id)[state]()[setting]();
  }
  if (this.hasInstance(anychart.graphModule.Chart.Element.GROUP, node.groupId)) {
    settingForSpecificGroup = this.getElementInstance(anychart.graphModule.Chart.Element.GROUP, node.group)[state]()[setting]();
  }
  var result = defaultNodeSetting;
  result = goog.isDef(defaultGroupSetting) ? defaultGroupSetting : result;
  result = goog.isDef(settingForSpecificGroup) ? settingForSpecificGroup : result;
  result = goog.isDef(settingForSpecificNode) ? settingForSpecificNode : result;
  return result;
};


/**
 * @return {function(!acgraph.vector.Path, number, number, number, number=):!acgraph.vector.Path} Marker drawer.
 * */
anychart.graphModule.Chart.prototype.getShape = function(type) {
  if (!this.shapes[type]) {
    this.shapes[type] = [];
  }
  this.shapes[type].push(anychart.utils.getMarkerDrawer('star').call(this, this.rootLayer, 0, 0));
  return this.shapes[type][this.shapes[type].length - 1];
};

/**
 * Label position provider
 * */
anychart.graphModule.Chart.prototype.labelPositionProvider = function(node) {

}

/**
 *
 * */
anychart.graphModule.Chart.prototype.drawNode = function(node) {
  var shape = this.resolveSettingsForNode(node, 'type', 0);//enum here
  var fill = this.resolveSettingsForNode(node, 'fill', 0);//enum here
  var stroke = this.resolveSettingsForNode(node, 'stroke', 0);//enum here
  var size = this.resolveSettingsForNode(node, 'size', 0);//enum here


  var domElement = this.rootLayer.circle(node.position.x, node.position.y, size)//this.getShape(shape);
  domElement.fill(fill);
  domElement.stroke(stroke);
  domElement.tag = {};
  domElement.tag.type = 'node';

  // this.rootLayer.circle(node.x, node.y, 5);
}


/**
 * */
anychart.graphModule.Chart.prototype.drawNodes = function() {
  for (var node in this.nodes_) {
    var node = this.nodes_[node];
    this.drawNode(node);
  }
};


//todo jsdoc
/**
 * */
anychart.graphModule.Chart.prototype.drawConnectors = function() {
  var path = this.rootLayer.path();
  for (var i = 0, length = this.connectors_.length; i < length; i++) {
    var p1 = this.nodes_[this.connectors_[i].from];
    var p2 = this.nodes_[this.connectors_[i].to];

    path.moveTo(p1.x, p1.y)
        .lineTo(p2.x, p2.y);
  }
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.drawContent = function(bounds) {
  if (this.isConsistent())
    return;

  if (!this.rootLayer) {
    this.rootLayer = this.rootElement.layer();
    console.log(this.rootLayer);
    this.rootLayer.zIndex(anychart.graphModule.Chart.Z_INDEX);
  }

  var coords = this.layout().getCoordinatesForCurrentLayout();
  this.setCoordinatesForNodes(coords);
  this.drawNodes();
  this.drawConnectors();
};


//endregion
//region Serialize, setup, dispose
/** @inheritDoc */
anychart.graphModule.Chart.prototype.serialize = function() {
  var json = anychart.graphModule.Chart.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, json);
  return json;
};


/** @inheritDoc */
anychart.graphModule.Chart.prototype.setupByJSON = function(config, opt_default) {
  anychart.graphModule.Chart.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.graphModule.Chart.OWN_DESCRIPTORS, config, opt_default);
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

})();


//endregion
