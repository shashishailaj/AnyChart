goog.provide('anychart.graphModule.elements.Layout');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');


/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Layout = function(chart) {
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


anychart.graphModule.elements.Layout.prototype.getCoordinatesForCurrentLayout = function() {
  var type = this.getOption('type');
  var layout = this.func[type];
  return layout.call(this, this.chart_.nodes_);//todo getter/setter for nodes_
};


/**
 * @param {Object} nodes
 * @return {Array.<Object>} coordinate for nodes for draw.
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.explicitLayout_ = function(nodes) {
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
anychart.graphModule.elements.Layout.prototype.forceLayout_ = function(nodes) {
  //todo place randomly


  var MAXIMUM_VELOCITY = 0.040;
  var MINIMUM_VELOCITY = -MAXIMUM_VELOCITY;
  var INITIAL_POSITION_FACTOR = 10;
  var COULOMB_FORCE_FACTOR = 0.1;
  var HARMONIC_FORCE_FACTOR = 1;
  var ITERATION = 500;

  var nodes = this.chart_.getNodesArray();
  var length, node, i;

  var pi2 = Math.PI * 2;
  for (i = 0, length = nodes.length; i < length; i++) {
    var node = nodes[i];
    node.velocityX = 0;
    node.velocityY = 0;

    node.position.x = INITIAL_POSITION_FACTOR * Math.cos(pi2 / (i + 1));
    node.position.y = INITIAL_POSITION_FACTOR * Math.sin(pi2 / (i + 1));
  }


  for (var iteration = 0; iteration < ITERATION; iteration++) {

    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.coulumbX = 0;
      node.coulumbY = 0;
      for (var j = 0; j < length; j++) {
        var node2 = nodes[j];
        if (node != node2 && node.coloumGroup == node2.coloumGroup) { //
          var distanceX = node.position.x - node2.position.x;
          var distanceY = node.position.y - node2.position.y;
          var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (distance != 0) {
            var directX = distanceX / distance;
            var directY = distanceY / distance;
            node.coulumbX += directX / distance * COULOMB_FORCE_FACTOR;
            node.coulumbY += directY / distance * COULOMB_FORCE_FACTOR;
          } else {
            node.coulumbX += Math.random() - 0.5;
            node.coulumbY += Math.random() - 0.5;
          }
        }
      }
    }
    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.harmonicX = 0;
      node.harmonicY = 0;
      var neighbour = node.siblings;

      var harmonicX;
      var harmonicY;
      for (var j = 0, neighboursLength = neighbour.length; j < neighboursLength; j++) {
        var node2 = this.chart_.getNodeById(neighbour[j]);
        var distanceX = node.position.x - node2.position.x;
        var distanceY = node.position.y - node2.position.y;
        var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        if (distance != 0) {
          var directX = -distanceX / distance;
          var directY = -distanceY / distance;
          var ml = distance * distance / 20;
          harmonicX = directX * ml * HARMONIC_FORCE_FACTOR;
          harmonicY = directY * ml * HARMONIC_FORCE_FACTOR;
        } else {
          harmonicX = Math.random() - 0.5;
          harmonicY = Math.random() - 0.5;
        }
        node.harmonicX += harmonicX;
        node.harmonicY += harmonicY;
      }
    }
    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.velocityX += (node.coulumbX + node.harmonicX);
      node.velocityY += (node.coulumbY + node.harmonicY);


      if (node.velocityX > MAXIMUM_VELOCITY) {
        node.velocityX = MAXIMUM_VELOCITY;
      } else if (node.velocityX < MINIMUM_VELOCITY) {
        node.velocityX = MINIMUM_VELOCITY;
      }
      if (node.velocityY > MAXIMUM_VELOCITY) {
        node.velocityY = MAXIMUM_VELOCITY;
      } else if (node.velocityY < MINIMUM_VELOCITY) {
        node.velocityY = MINIMUM_VELOCITY;
      }

      node.position.x += node.velocityX;
      node.position.y += node.velocityY;
    }
  }

  return nodes;
}
;

anychart.graphModule.elements.Layout.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function layoutNormalizer (value) {
    return anychart.enums.normalize(anychart.graphModule.elements.LayoutType, value, anychart.graphModule.elements.LayoutType.EXPLICIT);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', layoutNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'edgeLength', anychart.core.settings.numberNormalizer]]
  );
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Layout, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS);
