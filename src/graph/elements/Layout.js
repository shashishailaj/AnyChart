goog.provide('anychart.graphModule.elements.Layout');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Layout = function (chart) {
  anychart.graphModule.elements.Layout.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['type', 0, anychart.Signal.NEEDS_REDRAW],
    ['edgeLength', 0, anychart.Signal.NEEDS_REDRAW]
  ]);

  this.func = {};
  this.func[anychart.graphModule.elements.LayoutType.FORCE] = anychart.graphModule.elements.Layout.prototype.forceLayout_;
  this.func[anychart.graphModule.elements.LayoutType.EXPLICIT] = anychart.graphModule.elements.Layout.prototype.explicitLayout_;

  this.chart_ = chart;

};
goog.inherits(anychart.graphModule.elements.Layout, anychart.core.Base);


/**
 * Types of chart
 * @enum {string}
 * */
anychart.graphModule.elements.LayoutType = {
  EXPLICIT: 'explicit',
  FORCE: 'force'
};


anychart.graphModule.elements.Layout.prototype.getCoordinatesForCurrentLayout = function () {
  var type = this.getOption('type');
  var layout = this.func[type];
  return layout.call(this, this.chart_.nodes_);//todo getter/setter for nodes_
};


/**
 * @param {Object} nodes
 * @return {Array.<Object>} coordinate for nodes for draw.
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.explicitLayout_ = function (nodes) {
  var coordinates = [];

  for (var nodeId in nodes) {
    var node = nodes[nodeId];
    var x = node.position.x;
    var y = node.position.y;

    if (!x) x = 0;
    if (!y) y = 0;
    coordinates.push({
      nodeId: nodeId,
      position: {
        x: x,
        y: y
      }
    });
  }
  return coordinates;
};


/**
 * @param {Object} nodes
 * @return {Array.<Object>} coordinate for nodes for draw.
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.forceLayout_ = function (nodes) {
  //todo place randomly

  var nodes = this.chart_.getNodesArray();
  var c = 1;
  var pi2 = Math.PI * 2;
  for (var i = 0, length = nodes.length; i < length; i++, c) {
    var node = nodes[i];
    node.velocityX = 0;
    node.velocityY = 0;
    node.position.x = 10 * Math.cos(pi2/c++);
    node.position.y = 10 * Math.sin(pi2/c++);
    console.log(node.position.x, node.position.y );
  }

  var maximumVelocity = 0.030;
  var minimumVelocity = -maximumVelocity;

  for (var iteration = 0; iteration < 300; iteration++) {

    for (var i = 0, length = nodes.length; i < length; i++) {
      var node = nodes[i];
      node.coulumbX = 0;
      node.coulumbY = 0;
      for (var j = 0; j < length; j++) {
        var node2 = nodes[j];
        if (node != node2) {
          var distanceX = node.position.x - node2.position.x;
          var distanceY = node.position.y - node2.position.y;
          var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (distance != 0) {
            var directX = distanceX / distance;
            var directY = distanceY / distance;
            node.coulumbX += directX / distance * 0.01;
            node.coulumbY += directY / distance * 0.01;
          } else {
            node.coulumbX += Math.random() - 0.5;
            node.coulumbY += Math.random() - 0.5;
          }
        }
      }
    }
    for (var i = 0, length = nodes.length; i < length; i++) {
      var node = nodes[i];
      node.harmonicX = 0;
      node.harmonicY = 0;
      var neighbour = node.siblings;

      var harmonicX;
      var harmonicY;
      for (var j = 0, nlength = neighbour.length; j < nlength; j++) {
        var node2 = this.chart_.getNodeById(neighbour[j]);
        var distanceX = node.position.x - node2.position.x;
        var distanceY = node.position.y - node2.position.y;
        var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (distance != 0) {
          var directX = -distanceX / distance;
          var directY = -distanceY / distance;
          var ml = distance * distance / 20;
          harmonicX = directX * ml;
          harmonicY = directY * ml;
        } else {
          harmonicX = Math.random() - 0.5;
          harmonicY = Math.random() - 0.5;
        }
        node.harmonicX += harmonicX;
        node.harmonicY += harmonicY;
      }
    }
    for (var i = 0, length = nodes.length; i < length; i++) {
      var node = nodes[i];
      node.velocityX += (node.coulumbX + node.harmonicX);
      node.velocityY += (node.coulumbY + node.harmonicY);


      if (node.velocityX > maximumVelocity) {
        node.velocityX = maximumVelocity;
      } else if (node.velocityX < minimumVelocity) {
        node.velocityX = minimumVelocity;
      }
      if (node.velocityY > maximumVelocity) {
        node.velocityY = maximumVelocity;
      } else if (node.velocityY < minimumVelocity) {
        node.velocityY = minimumVelocity;
      }

      node.position.x += node.velocityX;
      node.position.y += node.velocityY;
    }
  }

  return nodes;
}
;

anychart.graphModule.elements.Layout.OWN_DESCRIPTORS = (function () {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function layoutNormalizer(value) {
    return anychart.enums.normalize(anychart.graphModule.elements.LayoutType, value, anychart.graphModule.elements.LayoutType.EXPLICIT);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', layoutNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'edgeLength', anychart.core.settings.numberNormalizer]]
  );
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Layout, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS);
