goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'axis': {
      'enabled': true,
      'zIndex': 35,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'fill': anychart.core.defaultTheme.colorStrokeNormal,
      'ticks': {
        'enabled': true,
        'stroke': 'red',
        'zIndex': 36
      },
      'labels': {
        'fontSize': '10px'
      }
    },
    'defaultSeriesSettings': {
      'event': {
        'connector': {'length': '10%'},
        'normal': {
          'markers': {'enabled': true}
        },
        'zIndex': 34.2
      },
      'range': {
        'height': '10%',
        'zIndex': 34.1
      }

    }
  }
});
