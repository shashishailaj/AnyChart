if(!_.theme_scatter){_.theme_scatter=1;(function($){$.sa($.fa.anychart.themes.defaultTheme,{scatter:{defaultSeriesType:"marker",legend:{enabled:!1},defaultSeriesSettings:{base:{clip:!0,color:null,tooltip:{titleFormat:function(){return this.seriesName},format:function(){return"x: "+this.x+"\ny: "+this.valuePrefix+$.EI(this.value)+this.valuePostfix}},xScale:null,yScale:null,a11y:{enabled:!1,titleFormat:"Series named {%SeriesName} with {%SeriesPointsCount} points. Min value is {%SeriesYMin}, max value is {%SeriesYMax}"}},bubble:{normal:{negativeFill:$.NI,
negativeStroke:$.NI,negativeHatchFill:null,labels:{anchor:"center"}},hovered:{negativeFill:$.NI,negativeStroke:$.NI,negativeHatchFill:void 0},displayNegative:!1,hatchFill:!1,tooltip:{format:function(){return"X: "+this.x+"\nY: "+this.valuePrefix+$.EI(this.value)+this.valuePostfix+"\nSize: "+$.EI(this.size)}}},line:{connectMissingPoints:!1},marker:{normal:{size:5},hovered:{size:7},selected:{size:7}}},defaultAnnotationSettings:{},defaultXAxisSettings:{orientation:"bottom",scale:0,title:{text:"X-Axis"}},
defaultYAxisSettings:{orientation:"left",scale:1,title:{text:"Y-Axis"}},series:[],xGrids:[],yGrids:[],xMinorGrids:[],yMinorGrids:[],xAxes:[{}],yAxes:[{}],lineAxesMarkers:[],rangeAxesMarkers:[],textAxesMarkers:[],scales:[{type:"linear"},{type:"linear"}],xScale:0,yScale:1,maxBubbleSize:"20%",minBubbleSize:"5%",crosshair:{enabled:!1,displayMode:"float",xStroke:"#969EA5",yStroke:"#969EA5",zIndex:41,xLabels:[{enabled:null}],yLabels:[{enabled:null}]},a11y:{titleFormat:$.ZI},annotations:{annotationsList:[],
zIndex:2E3}},marker:{},bubble:{},quadrant:{scales:[{type:"linear",minimum:0,maximum:100},{type:"linear",minimum:0,maximum:100}],xScale:0,yScale:1,defaultXAxisSettings:{ticks:!1,labels:!1,title:{enabled:!1,align:"left"},stroke:"3 #bbdefb"},defaultYAxisSettings:{ticks:!1,labels:!1,title:{enabled:!1,align:"left"},stroke:"3 #bbdefb"},xAxes:[{},{orientation:"top"}],yAxes:[{},{orientation:"right"}],crossing:{stroke:"#bbdefb"},quarters:{rightTop:{enabled:!0},leftTop:{enabled:!0},leftBottom:{enabled:!0},
rightBottom:{enabled:!0}}}});}).call(this,$)}
