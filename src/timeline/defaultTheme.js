goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'defaultRangeMarkerSettings': {
      'zIndex': 37.1
    },
    'defaultLineMarkerSettings': {
      'zIndex': 37.2
    },
    'defaultTextMarkerSettings': {
      'zIndex': 37.3,
      'align': anychart.enums.Align.TOP
    },
    'legend': {
      'enabled': false
    },
    'axis': {
      'enabled': true,
      'zIndex': 35,
      'height': 10,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'fill': anychart.core.defaultTheme.colorStrokeNormal,
      'ticks': {
        'enabled': true,
        'stroke': 'red',
        'zIndex': 36
      },
      'labels': {
        'fontSize': '10px',
        'textOverflow': true,
        'format': "{%Value}{dateTimeFormat:yy/MMM/yy}"
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
        'zIndex': 34,
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'titleFormat': function() {
            return anychart.format.date(this['x']);
          }
        }
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
        },
        'tooltip': {
          /**
           * @this {*}
           * @return {string}
           */
          'format': function() {
            var start = this['start'];
            var end = this['end'];
            return 'Start: ' + anychart.format.date(start) + '\nEnd: ' + (isNaN(end) ? 'no end date' : anychart.format.date(end));
          }
        }
      }

    }
  }
});
