goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {

    'labels': {
    },

    'nodes': {
      'normal': {
        'fill': {
          'opacity': 0.4,
          'color': '#ccc'
        },
        'stroke': {
          'thickness': 2,
          'color': 'yellow'
        },
        'labels': {
          'format': '{%id}',
          'fontSize': 8,
          'textAnchor': 'middle'
        },
        'size': 20,
        'type': 'square'
      },
      'hovered': {
        'fill': 'red',
        'stroke': 'blue',
        'type': 'square',
        'size': 200,
        'labels': {
          'fontColor':'red',
          'fontSize':20
        }
      },
      'selected': {
        'fill': 'brown',
        'stroke': 'pink'
      }
    },
    'edges': {
      'stroke': '#ccc',
      'labels': {
        'enabled': false,
        'format': 'from {%from} to {%to}',
        'fontSize': 6,
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
