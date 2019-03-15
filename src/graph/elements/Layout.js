goog.provide('anychart.graphModule.elements.Layout');

goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('goog.math.Rect');



/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.core.Base}
 * */
anychart.graphModule.elements.Layout = function(chart) {
  anychart.graphModule.elements.Layout.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['type', 0, anychart.Signal.NEEDS_REDRAW]
  ]);

  /**
   * Object with layout functions.
   * @type {Object.<anychart.graphModule.elements.LayoutType, Function>}
   * */
  this.layoutFunction = {};
  this.layoutFunction[anychart.graphModule.elements.LayoutType.FORCE] = anychart.graphModule.elements.Layout.prototype.forceLayout_;
  this.layoutFunction[anychart.graphModule.elements.LayoutType.EXPLICIT] = anychart.graphModule.elements.Layout.prototype.explicitLayout_;

  this.chart_ = chart;

};
goog.inherits(anychart.graphModule.elements.Layout, anychart.core.Base);


/**
 * Own property descriptors
 * */
anychart.graphModule.elements.Layout.OWN_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function layoutNormalizer(value) {
    return anychart.enums.normalize(anychart.graphModule.elements.LayoutType, value, anychart.graphModule.elements.LayoutType.EXPLICIT);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', layoutNormalizer]]
  );
  return map;
})();
anychart.core.settings.populate(anychart.graphModule.elements.Layout, anychart.graphModule.elements.Layout.OWN_DESCRIPTORS);


/**
 * Supported signals.
 * @type {number}
 */
anychart.graphModule.elements.Layout.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REDRAW;


/**
 * Types of layout
 * @enum {string}
 * */
anychart.graphModule.elements.LayoutType = {
  EXPLICIT: 'explicit',
  FORCE: 'force'
};


/**
 * Call layout function for current layout type.
 * */
anychart.graphModule.elements.Layout.prototype.getCoordinatesForCurrentLayout = function() {
  var type = /**@type {anychart.graphModule.elements.LayoutType}*/(this.getOption('type'));
  var layout = this.layoutFunction[type];
  layout.call(this);
};


/**
 * Set coordinates for nodes if in data or 0.
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.explicitLayout_ = function() {
  var nodes = this.chart_.getNodesArray();

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var row = this.chart_.data()['nodes'].getRow(node.dataRow);
    var x = row['x'];
    var y = row['y'];

    if (!x) {
      x = 0;
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_COORDINATE_FOR_FIXED_MODE, null, [node.nodeId, 'x'], true);
    }
    if (!y) {
      y = 0;
      anychart.core.reporting.warning(anychart.enums.WarningCode.GRAPH_NO_COORDINATE_FOR_FIXED_MODE, null, [node.nodeId, 'y'], true);
    }

    node.position.x = x;
    node.position.y = y;
  }
};


/**
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.forceLayout_ = function() {
  var MAXIMUM_VELOCITY = 0.150;
  var MINIMUM_VELOCITY = -MAXIMUM_VELOCITY;
  var INITIAL_POSITION_FACTOR = 10;
  var COULOMB_FORCE_FACTOR = 0.9;
  var HARMONIC_FORCE_FACTOR = 10;
  var ITERATION = 500;

  var nodes = this.chart_.getNodesArray();
  var subgraphs = this.chart_.getSubGraphsMap();
  var length, node, node2, i, j, force;

  var pi2 = Math.PI * 2;
  for (i = 0, length = nodes.length; i < length; i++) {
    node = nodes[i];
    node.velocityX = 0;
    node.velocityY = 0;

    node.position.x = INITIAL_POSITION_FACTOR * Math.cos(pi2 / (i + 1));
    node.position.y = INITIAL_POSITION_FACTOR * Math.sin(pi2 / (i + 1));
  }


  //repel two coordinates
  function coulomb(x1, y1, x2, y2) {
    var coulombX, coulombY;
    var distanceX = x1 - x2;
    var distanceY = y1 - y2;
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    if (distance != 0) {
      var directX = distanceX / distance;
      var directY = distanceY / distance;
      coulombX = directX / distance * COULOMB_FORCE_FACTOR;
      coulombY = directY / distance * COULOMB_FORCE_FACTOR;
    } else {
      coulombX = Math.random() - 0.5;
      coulombY = Math.random() - 0.5;
    }
    return [coulombX, coulombY];
  }

  //pull two coordinates
  function harmonic(x1, y1, x2, y2) {
    var harmonicX, harmonicY;
    var distanceX = x1 - x2;
    var distanceY = y1 - y2;
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    if (distance != 0) {
      var directX = -distanceX / distance;
      var directY = -distanceY / distance;
      var ml = distance * distance / 50;
      harmonicX = directX * ml * HARMONIC_FORCE_FACTOR;
      harmonicY = directY * ml * HARMONIC_FORCE_FACTOR;
    } else {
      harmonicX = Math.random() - 0.5;
      harmonicY = Math.random() - 0.5;
    }
    return [harmonicX, harmonicY];
  }

  for (var iteration = 0; iteration < ITERATION; iteration++) {

    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.coulombX = 0;
      node.coulombY = 0;
      for (j = 0; j < length; j++) {
        node2 = nodes[j];
        if (node != node2 && node.subGraphId == node2.subGraphId) { //
          force = coulomb(node.position.x, node.position.y, node2.position.x, node2.position.y);
          node.coulombX += force[0];
          node.coulombY += force[1];
        }
      }
    }
    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.harmonicX = 0;
      node.harmonicY = 0;
      var neighbour = node.siblings;
      for (j = 0; j < neighbour.length; j++) {
        node2 = this.chart_.getNodeById(neighbour[j]);
        force = harmonic(node.position.x, node.position.y, node2.position.x, node2.position.y);
        node.harmonicX += force[0];
        node.harmonicY += force[1];
      }
    }

    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.velocityX += (node.coulombX + node.harmonicX);
      node.velocityY += (node.coulombY + node.harmonicY);

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

  var keys = goog.object.getKeys(subgraphs);
  if (keys.length > 1) {
    var gap = 0.5; //offset between graphs
    var rectangles = [];

    for (i = 0; i < keys.length; i++) {
      var key = keys[i];
      var elementsOfSubgraphs = subgraphs[key];
      var top = Infinity;
      var bottom = -Infinity;
      var left = Infinity;
      var right = -Infinity;
      length = elementsOfSubgraphs.length;
      if (length == 1) {
        node = this.chart_.getNodeById(elementsOfSubgraphs[0]);
        top = node.position.y - gap;
        left = node.position.x - gap;
        bottom = node.position.y + gap;
        right = node.position.x + gap;
      }
      else {
        for (j = 0; j < length; j++) {
          node = this.chart_.getNodeById(elementsOfSubgraphs[j]);
          if (node.position.y < top) {
            top = node.position.y;
          }
          if (node.position.y > bottom) {
            bottom = node.position.y;
          }
          if (node.position.x > right) {
            right = node.position.x;
          }
          if (node.position.x < left) {
            left = node.position.x;
          }
        }
        left -= gap;
        right += gap;
        top -= gap;
        bottom += gap;
      }
      var width = Math.abs(left - right);
      var height = Math.abs(bottom - top);

      var e = {
        id: key,
        rectangle: new goog.math.Rect(left, top, width, height)
      };
      rectangles.push(e);

    }

    var x = 0;
    var y = 0;

    for (i = 0; i < rectangles.length; i++) {
      left = rectangles[i].rectangle.getTopLeft().getX();
      width = rectangles[i].rectangle.getWidth();
      rectangles[i].dx = x - left;
      x += width + gap;
      rectangles[i].dy = -rectangles[i].rectangle.getCenter().getY();
    }

    for (i = 0; i < rectangles.length; i++) {
      var nodesOfCurrentSubGraph = subgraphs[rectangles[i].id];
      for (j = 0; j < nodesOfCurrentSubGraph.length; j++) {
        node = this.chart_.getNodeById(nodesOfCurrentSubGraph[j]);
        node.position.x += rectangles[i].dx;
        node.position.y += rectangles[i].dy;
      }
    }
  }
};
