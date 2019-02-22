goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'axis': {
      'enabled': true,
      'zIndex': 35
    },
    'defaultSeriesSettings': {
      'event': {
        'length': '10%'
      },
      'range': {
        'height': '10%'
      }

    }
  }
});
