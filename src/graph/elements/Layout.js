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

  this.func = {};
  this.func[anychart.graphModule.elements.LayoutType.FORCE] = anychart.graphModule.elements.Layout.prototype.forceLayout_;
  this.func[anychart.graphModule.elements.LayoutType.EXPLICIT] = anychart.graphModule.elements.Layout.prototype.explicitLayout_;

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
  var type = this.getOption('type');
  var layout = this.func[type];
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

    if (!x) x = 0;
    if (!y) y = 0;

    node.position.x = x;
    node.position.y = y;
  }
};


/**
 * @private
 * */
anychart.graphModule.elements.Layout.prototype.forceLayout_ = function() {
  //todo place randomly


  var MAXIMUM_VELOCITY = 0.040;
  var MINIMUM_VELOCITY = -MAXIMUM_VELOCITY;
  var INITIAL_POSITION_FACTOR = 10;
  var COULOMB_FORCE_FACTOR = 0.1;
  var HARMONIC_FORCE_FACTOR = 1;
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
  function coulumb(x1, y1, x2, y2) {
    var coulumbX, coulumbY;
    var distanceX = x1 - x2;
    var distanceY = y1 - y2;
    var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    if (distance != 0) {
      var directX = distanceX / distance;
      var directY = distanceY / distance;
      coulumbX = directX / distance * COULOMB_FORCE_FACTOR;
      coulumbY = directY / distance * COULOMB_FORCE_FACTOR;
    } else {
      coulumbX = Math.random() - 0.5;
      coulumbY = Math.random() - 0.5;
    }
    return [coulumbX, coulumbY];
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
      node.coulumbX = 0;
      node.coulumbY = 0;
      for (j = 0; j < length; j++) {
        node2 = nodes[j];
        if (node != node2 && node.coloumGroup == node2.coloumGroup) { //
          force = coulumb(node.position.x, node.position.y, node2.position.x, node2.position.y);
          node.coulumbX += force[0];
          node.coulumbY += force[1];
        }
      }
    }
    for (i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      node.harmonicX = 0;
      node.harmonicY = 0;
      var neighbour = node.siblings;

      if (!neighbour.length) {
        neighbour = subgraphs[node.coloumGroup];
      }
      var harmonicX;
      var harmonicY;
      for (j = 0; j < neighbour.length; j++) {
        node2 = this.chart_.getNodeById(neighbour[j]);
        force = harmonic(node.position.x, node.position.y, node2.position.x, node2.position.y);
        node.harmonicX += force[0];
        node.harmonicY += force[1];
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

  // var rects = [];
  // if (goog.object.getKeys(this.chart_.groups_).length > 1) {
  //   for (var key in this.chart_.groups_) {
  //     var elementsOfGroup = this.chart_.groups_[key];
  //     var top = Infinity;
  //     var bottom = -Infinity;
  //     var left = Infinity;
  //     var right = -Infinity;
  //
  //     for (var i = 0, length = elementsOfGroup.length; i < length; i++) {
  //       var node = this.chart_.getNodeById(elementsOfGroup[i]);
  //       if (node.position.y < top) {
  //         top = node.position.y;
  //       }
  //       if (node.position.y > bottom) {
  //         bottom = node.position.y;
  //       }
  //       if (node.position.x > right) {
  //         right = node.position.x;
  //       }
  //       if (node.position.x < left) {
  //         left = node.position.x;
  //       }
  //     }
  //     var width = Math.abs(left - right);
  //     var height = Math.abs(bottom - top);
  //
  //     rects.push(
  //       {
  //         id: elementsOfGroup,
  //         rect: new goog.math.Rect(left, top, width, height),
  //         initialX: left,
  //         initialY: top,
  //         hx: 0,
  //         hy: 0,
  //         cx: 0,
  //         cy: 0
  //       }
  //     );
  //   }
  //
  //
  //   for (var i = 0; i < 100; i++) {
  //
  //     for (var g1 = 0; g1 < rects.length; g1++) {
  //       var rect1 = rects[g1];
  //       rect1.cx = 0;
  //       rect1.cy = 0;
  //       for (var g2 = 0; g2 < rects.length; g2++) {
  //         var rect2 = rects[g2];
  //         if (rect1 != rect2 && rect1.rect.intersection(rect2.rect)) {
  //           var pos = rect1.rect.getCenter();
  //           var pos2 = rect2.rect.getCenter();
  //           var force = coulumb(pos.x, pos.y, pos2.x, pos2.y);
  //           rect1.cx += force[0];
  //           rect1.cy += force[1];
  //         } else {
  //           console.log('intersec');
  //         }
  //
  //       }
  //     }
  //
  //     for (var g1 = 0; g1 < rects.length; g1++) {
  //       var rect1 = rects[g1];
  //       rect1.hx = 0;
  //       rect1.hy = 0;
  //
  //       for (var g2 = 0; g2 < rects.length; g2++) {
  //         var rect2 = rects[g2];
  //         if (rect1 != rect2) {
  //           var pos = rect1.rect.getCenter();
  //           var pos2 = rect2.rect.getCenter();
  //
  //           if (!(rect1.rect.intersection(rect2.rect))) {
  //
  //             var force = harmonic(pos.x, pos.y, pos2.x, pos2.y);
  //             rect1.hx += force[0];
  //             rect1.hy += force[1];
  //           } else {
  //             console.log('inte');
  //           }
  //
  //         }
  //
  //       }
  //     }
  //     // debugger
  //     for (var j = 0; j < rects.length; j++) {
  //       var r = /**@type {goog.math.Rect}*/(rects[j]);
  //       var velx = r.hx + r.cx;
  //       var vely = r.hy + r.cy;
  //       var x = r.rect.getTopLeft().getX();
  //       var y = r.rect.getTopLeft().getY();
  //
  //       if (velx > MAXIMUM_VELOCITY) {
  //         velx = MAXIMUM_VELOCITY;
  //       } else if (velx < MINIMUM_VELOCITY) {
  //         velx = MINIMUM_VELOCITY;
  //       }
  //       if (vely > MAXIMUM_VELOCITY) {
  //         vely = MAXIMUM_VELOCITY;
  //       } else if (vely < MINIMUM_VELOCITY) {
  //         vely = MINIMUM_VELOCITY;
  //       }
  //
  //       x += velx;
  //       y += vely;
  //       rects[j].rect.left = x;
  //       rects[j].rect.top = y;
  //     }
  //   }
  //   for (var j = 0; j < rects.length; j++) {
  //     var obj = rects[j];
  //     var arrayOfNodeIds = obj.id;
  //     var dx = obj.rect.getTopLeft().getX() - obj.initialX;
  //     var dy = obj.rect.getTopLeft().getY() - obj.initialY;
  //     for (i = 0; i < arrayOfNodeIds.length; i++) {
  //       node = this.chart_.getNodeById(arrayOfNodeIds[i]);
  //       node.position.x += dx;
  //       node.position.y += dy;
  //     }
  //   }
  // }
};

