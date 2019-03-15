goog.provide('anychart.graphModule.defaultTheme');


goog.mixin(goog.global['anychart']['themes']['defaultTheme'], {
  'graph': {
    'labels': {
      'enabled': false,
      'fontSize': 8,
      'fontColor': '#7c868e',
      'anchor': anychart.enums.Anchor.CENTER,
      'padding' : {
        'top' : 0,
        'left' : 0,
        'right' : 0,
        'bottom' : 0
      }
    },

    'tooltip': {
      'displayMode': 'single',
      'positionMode': 'float',
      'title': {
        'enabled': true
      },
      'separator': {
        'enabled': true
      },
      'titleFormat': '{%type}',
      'format': 'Id: {%id}'
    },
    'nodes': {
      'width': 15,
      'height': 15,
      'shape': 'circle',
      'labels': {
        'format': '{%id}',
        'enabled': false
      },
      'normal': {
        'fill': '#64B5F6',
        'stroke': {
          'color': '#FFD54F'
        }
      },
      'hovered': {
        'width': 20,
        'height': 20
      },
      'selected': {
        'fill': '#1976D2',
        'stroke': '#EF6C00',
        'width': 21,
        'height': 21
      }
    },
    'edges': {
      'stroke': '1 #ccc',
      'hovered': {
        'stroke': '1.5 #B8B8B8'
      },
      'labels': {
        'format': 'from {%from} to {%to}'
      },
      'tooltip': {
        'format': 'from: {%from}\nto: {%to}'
      }
    },
    'layout': {
      'type': 'explicit'
    },
    'interactivity': {
      'enabled': true,
      'zoomOnMouseWheel': true,
      'scrollOnMouseWheel': false,
      'node': true,
      'magnetize': true
    }
  }
});
