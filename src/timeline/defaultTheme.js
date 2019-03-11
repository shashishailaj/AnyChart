goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
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
        'textOverflow': true
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
            var date = anychart.format.parseDateTime(this['x']);
            return anychart.format.date(date);
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
