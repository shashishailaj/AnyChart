goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {

    'labels': {},

    'tooltip': {
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true
      },
      'separator': {'enabled': true},
      'titleFormat': '',
      'format': '{%id}'
    },
    'nodes': {
      'width': 15,
      'height': 15,
      'shape': 'rectangle',
      'normal': {
        'fill': {
          'opacity': 0.4,
          'color': '#ccc'
        },
        'stroke': {
          'color': 'yellow'
        },
        'labels': {
          'enabled': false,
          'format': '{%id}',
          'fontSize': 8,
          'anchor': 'middle'
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
        'stroke': 'pink'
      }
    },
    'edges': {
      'stroke': '1.5 #ccc',
      'labels': {
        'enabled': false,
        'format': 'from {%from} to {%to}',
        'fontSize': 20,
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
      'scrollOnMouseWheel': true,
      'node': true,
      'magnetize': true
    }
  }
});
