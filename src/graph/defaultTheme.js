goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {
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
          'format': '{%id}'
        },
        'size': 15,
        'type': 'circle'
      },
      'hovered': {
        'fill': 'red',
        'stroke': 'blue'
      },
      'selected': {
        'fill': 'brown',
        'stroke': 'pink'
      }
    },
    'edges': {
      'stroke': '#ccc',
      'labels': {
        'format': '{%id}',
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
