goog.provide('anychart.timelineModule.defaultTheme');

goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'timeline': {
    'defaultSeriesSettings': {
      'event': {
        'length': '10%',
        'stroke': anychart.core.defaultTheme.colorStrokeNormal
      },
      'range': {
        'height': '10%'
      }

    }
  }
});
