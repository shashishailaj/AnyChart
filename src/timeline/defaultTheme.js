goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'axis': {
      'enabled': true,
      'zIndex': 35,
      'stroke': anychart.core.defaultTheme.colorStrokeNormal,
      'fill': anychart.core.defaultTheme.colorStrokeNormal
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
