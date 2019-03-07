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
      'base': {
        'direction': anychart.enums.EventMarkerDirection.AUTO
      },
      'event': {
        'connector': {'length': '4%'},
        'normal': {
          'markers': {'enabled': true},
          'labels': {
            'enabled': true
          }
        },
        'zIndex': 34
      },
      'range': {
        'height': '5%',
        'normal': {
          'labels': {
            'enabled': true,
            'anchor': anychart.enums.Anchor.LEFT_CENTER,
            'format': '{%x}'
          },
          'fill': anychart.core.defaultTheme.returnSourceColor85
        }
      }

    }
  }
});
