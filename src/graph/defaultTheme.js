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
      'stroke': '#ccc'
    },
    'layout': {
      'type': 'explicit'
    }
  }
});
