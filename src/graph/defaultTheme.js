goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {
    'nodes': {
      'normal': {
        'fill': 'blue',
        'stroke': 'yellow'
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
    'connectors': {
      'stroke': '#ccc'
    }
  }
});
