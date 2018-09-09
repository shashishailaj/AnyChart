//region --- Requiring and Providing
goog.provide('anychart.core.utils.MarkersFactory');
goog.provide('anychart.standalones.MarkersFactory');
goog.provide('anychart.standalones.MarkersFactory.Marker');
goog.require('anychart.core.Marker');
goog.require('anychart.core.utils.Factory');
//endregion



/**
 * Class for creation of sets of similar markers and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @param {function():anychart.core.IFactoryElement=} opt_ctor .
 * @param {boolean=} opt_isNonInteractive .
 * @constructor
 * @extends {anychart.core.utils.Factory}
 */
anychart.core.utils.MarkersFactory = function(opt_ctor, opt_isNonInteractive) {
  anychart.core.utils.MarkersFactory.base(
      this,
      'constructor',
      opt_ctor || anychart.core.utils.MarkersFactory.DEFAULT_CONSTRUCTOR);

  /**
   * If the factory is allowed to listen and intercept events.
   * @type {boolean}
   */
  this.isInteractive = !opt_isNonInteractive;
};
goog.inherits(anychart.core.utils.MarkersFactory, anychart.core.utils.Factory);


//region --- Static props
/**
 * Default markers constructor.
 * @return {anychart.core.Marker}
 */
anychart.core.utils.MarkersFactory.DEFAULT_CONSTRUCTOR = function() {
  return new anychart.core.Marker();
};


//endregion
//region --- Dom elements
/** @inheritDoc */
anychart.core.utils.MarkersFactory.prototype.getRootLayer = function() {
  if (!this.layer) {
    this.layer = acgraph.layer();
    if (this.isInteractive)
      this.bindHandlersToGraphics(this.layer);
  }
  return this.layer;
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.utils.MarkersFactory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.utils.MarkersFactory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (anychart.utils.instanceOf(tag, anychart.core.VisualBase) || !anychart.utils.isNaN(tag))
      break;
    target = target.parent();
  }
  res['markerIndex'] = anychart.utils.toNumber(tag);
  return res;
};


//endregion
//region --- Standalone



//------------------------------------------------------------------------------
//
//  Standalone
//
//------------------------------------------------------------------------------
/**
 * @constructor
 * @param {function():anychart.core.IFactoryElement=} opt_ctor .
 * @param {boolean=} opt_isNonInteractive .
 * @extends {anychart.core.utils.MarkersFactory}
 */
anychart.standalones.MarkersFactory = function(opt_ctor, opt_isNonInteractive) {
  anychart.standalones.MarkersFactory.base(this, 'constructor', function () {
    return new anychart.standalones.MarkersFactory.Marker();
  }, opt_isNonInteractive);
};
goog.inherits(anychart.standalones.MarkersFactory, anychart.core.utils.MarkersFactory);
anychart.core.makeStandalone(anychart.standalones.MarkersFactory, anychart.core.utils.MarkersFactory);



/**
 * @constructor
 * @extends {anychart.core.Marker}
 */
anychart.standalones.MarkersFactory.Marker = function() {
  anychart.standalones.MarkersFactory.Marker.base(this, 'constructor');
};
goog.inherits(anychart.standalones.MarkersFactory.Marker, anychart.core.Marker);


/**
 * Constructor function.
 * @return {!anychart.standalones.MarkersFactory}
 */
anychart.standalones.markersFactory = function() {
  var factory = new anychart.standalones.MarkersFactory();
  factory.setup(anychart.getFullTheme('standalones.markersFactory'));
  return factory;
};


//endregion
//exports
(function() {
  var proto = anychart.standalones.MarkersFactory.prototype;
  goog.exportSymbol('anychart.standalones.markersFactory', anychart.standalones.markersFactory);
  proto['draw'] = proto.draw;
  proto['parentBounds'] = proto.parentBounds;
  proto['container'] = proto.container;
  proto['add'] = proto.add;
  proto['clear'] = proto.clear;

  proto = anychart.standalones.MarkersFactory.Marker.prototype;
  proto['enabled'] = proto.enabled;
  proto['draw'] = proto.draw;
  proto['clear'] = proto.clear;
  proto['getIndex'] = proto.getIndex;
})();


