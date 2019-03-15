goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {

    'labels': {
      'enabled': false,
      'format': '{%id}',
      'fontSize': 8,
      'anchor': 'middle'
    },

    'tooltip': {
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true
      },
      'separator': {'enabled': true},
      'titleFormat': '',
      /**
       * @this{*}
       * @return {*}
       * */
      'format': function() {
        return this['type'];
      }
    },
    'nodes': {
      'width': 15,
      'height': 15,
      'shape': 'rectangle',
      'labels': {
        'enabled': false
      },
      'normal': {
        'fill': {
          'opacity': 0.4,
          'color': '#ccc'
        },
        'stroke': {
          'color': 'yellow'
        },
        'shape': 'rect'
      },
      'hovered': {
        'fill': 'red',
        'stroke': 'blue',
        'shape': 'rec',
        'width': 15,
        'height': 30,
        'labels': {
          'enabled': true,
          'fontColor': 'red',
          'fontSize': 24
        }
      },
      'selected': {
        'fill': 'brown',
        'stroke': 'pink',
        'labels': {
          'enabled': false,
          'fontColor': 'black'
        }
      }
    },
    'edges': {
      'stroke': '1.5 #ccc',
      'labels': {
        'enabled': false,
        'format': 'from {%from} to {%to}',
        'fontSize': 12,
        'vAlign': 'middle',
        'height': '100%',
        'padding': {
          'left': 4,
          'top': 0,
          'right': 4,
          'bottom': 0
        },
        'textAnchor': 'middle'
      }
    },
    'layout': {
      'type': 'explicit'
    },
    'interactivity': {
      'enabled': true,
      'zoomOnMouseWheel': true,
      'scrollOnMouseWheel': false,
      'node': true,
      'magnetize': true
    }
  }
});
