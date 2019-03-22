goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'interactivity': {
      'zoomOnMouseWheel': true,
      'scrollOnMouseWheel': true
    },
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
      'height': 15,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'fill': anychart.core.defaultTheme.colorStrokeNormal,
      'ticks': {
        'enabled': true,
        'stroke': 'red',
        'zIndex': 36
      },
      'labels': {
        'fontSize': 10,
        'textOverflow': true,
        'format': '{%Value}'
      }
    },
    'defaultSeriesSettings': {
      'base': {
        'direction': anychart.enums.EventMarkerDirection.AUTO,
        'clip': false
      },
      'event': {
        'connector': {'length': '4%'},
        'normal': {
          /**
           * @this {*}
           * @return {Object}
           */
          'stroke': function() {
            return {
              'color': anychart.color.lighten(this['sourceColor']),
              'thickness': 1,
              'dash': '2 2'
            };
          },
          'markers': {'enabled': true},
          'labels': {
            'enabled': true,
            'anchor': anychart.enums.Anchor.LEFT_CENTER,
            'width': 120,
            'background': {
              'enabled': true,
              'color': 'white 1',
              'corners': 2,
              'stroke': '#cecece 1'
            },
            'fontSize': 11,
            'offsetX': 5
          }
        },
        'zIndex': 33,
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
        'zIndex': 34,
        'height': '5%',
        'normal': {
          'labels': {
            'enabled': true,
            'anchor': anychart.enums.Anchor.LEFT_CENTER,
            'format': '{%x}',
            'fontColor': 'white'
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
