goog.provide('anychart.core.ui.OptimizedText');

//region -- Requirements.
goog.require('acgraph.vector.IHtmlText');
goog.require('anychart.math.Rect');

goog.require('goog.string');



//endregion
//region -- Constructor.
/**
 *
 * DEV NOTE:
 *  To make this class work follow the order of steps:
 *    1) [DON'T USE FOR A WHILE] Call setClassName().
 *    2) Apply text value.
 *    3) Apply style.
 *    3) Call prepareComplexity to do all complex text magic.
 *    4) Set the DOM-container to text.
 *    5) Prepare bounds with prepareBounds() if needed.
 *    6) Set the position and parentBounds with putAt().
 *    7) Call finalizeComplexity().
 * @constructor
 * @implements {acgraph.vector.IHtmlText}
 */
anychart.core.ui.OptimizedText = function() {

  /**
   * Current renderer.
   * @type {acgraph.vector.Renderer}
   */
  this.renderer = acgraph.getRenderer();

  /**
   * Text value.
   * @type {string}
   * @private
   */
  this.text_ = '';

  /**
   * Style object.
   * @type {!Object}
   * @private
   */
  this.style_ = {};

  /**
   * Baseline value.
   * NOTE: Current default value. Calculated mathematically, depends on fontSize.
   * @type {number}
   */
  this.baseline = 11;


  /**
   * Analogue of consistency state.
   * @type {Object.<boolean>}
   */
  this.consistency = {
    style: false,
    text: false,
    complexity: false
  };


  /**
   * Current container.
   * @type {?Element}
   */
  this.container = null;


  /**
   * For complex text case. The texts that will be rendered in the end.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.textsToRender_ = [];


  /**
   * For HTML text case. The texts that will be rendered in the end.
   * @type {Array.<Array.<anychart.core.ui.OptimizedText>>}
   * @private
   */
  this.htnlTextsToRender_ = [];


  /**
   * Actually is an array of lines splitted by \n.
   * In this case each line is an array of anychart.core.ui.OptimizedText that we deal with.
   * @type {Array.<Array.<anychart.core.ui.OptimizedText>>}
   * @private
   */
  this.multilineTexts_ = [];


  /**
   * Flag whether limited by size string must be wrapped by word.
   *
   * SAMPLE: "Lorem ipsum consectet|ur sit", where |-symbol is a width limit.
   *  This must turn to lines:
   *    |Lorem ipsum          |
   *    |consectetur sit      |
   *
   * @type {boolean}
   * @private
   */
  this.wordBreakKeepAll_ = false;


  /**
   * Flag whether limited by size string must be wrapped by letter.
   *
   * SAMPLE: "Lorem ipsum consectet|ur sit", where |-symbol is a width limit.
   *  This must turn to lines:
   *    |Lorem ipsum consectet|
   *    |ur sit               |
   *
   * @type {boolean}
   * @private
   */
  this.wordBreakBreakAll_ = false;


  /**
   * Flag whether the text is in 'useHtml' mode.
   * @type {boolean}
   * @private
   */
  this.useHtml_ = false;


  /**
   * Only multiline without limiting by width.
   * @type {boolean}
   * @private
   */
  this.multilineOnly_ = false;


  /**
   * Text that contains styled textValue 'W W'.
   * Used to calculate the styled space width with this.wText_.
   * @type {?anychart.core.ui.OptimizedText}
   * @private
   */
  this.w_wText_ = null;

  /**
   * Text that contains styled textValue 'W'.
   * Used to calculate the styled space width with this.w_wText_.
   * @type {?anychart.core.ui.OptimizedText}
   * @private
   */
  this.wText_ = null;

  /**
   * Space symbol width calculated with this.w_wText_ and this.wText_.
   * @type {number}
   */
  this.spaceWidth = 0;

  /**
   * Text line height calculated mathematically depending on font size.
   * @type {number}
   */
  this.calculatedLineHeight = 0;

  /**
   * Fade gradient id.
   * @type {?string}
   * @private
   */
  this.fadeGradientId_ = null;

  /**
   * Current set of optimized texts.
   * Used to build this.multilineTexts_ correctly.
   * @type {Array.<anychart.core.ui.OptimizedText>}
   * @private
   */
  this.recentHtmlLine_ = [];

};


//endregion
//region -- Simplified API.
/**
 * Gets width by bounds.
 * If bounds are not calculated, returns 0 without developer notification.
 * NOTE: the bounds might not be calculated.
 * @return {number}
 */
anychart.core.ui.OptimizedText.prototype.width = function() {
  return this.bounds ? this.bounds.width : 0;
};


/**
 * Gets height by bounds or by mathematically calculated height.
 * @return {number}
 */
anychart.core.ui.OptimizedText.prototype.height = function() {
  return this.bounds ? this.bounds.height : this.getCalculatedHeight_();
};


/**
 * Calculates multiline text height without bounds DOM calculation.
 * TODO (A.Kudryavtsev): Do we need to cache calculated value?
 * @return {number}
 * @private
 */
anychart.core.ui.OptimizedText.prototype.getCalculatedHeight_ = function() {
  if (this.textsToRender_.length) {
    var sum = 0;
    for (var i = 0; i < this.textsToRender_.length; i++) {
      var t = this.textsToRender_[i];
      sum += /** @type {number} */ (t.height());
    }
    return sum;
  }
  return this.calculatedLineHeight;
};


/**
 * Style object setter.
 * @param {Object=} opt_value - Value to set.
 * @return {Object|anychart.core.ui.OptimizedText} - Current style or itself for chaining.
 */
anychart.core.ui.OptimizedText.prototype.style = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var st = /** @type {!Object} */ (opt_value || {});
    var diff = this.compareObject(this.style_, st);
    if (!goog.object.isEmpty(diff)) {
      this.consistency.style = true;
      this.style_ = st;

      if (opt_value['fontSize']) {
        var fontSize = parseFloat(opt_value['fontSize']);
        fontSize = isNaN(fontSize) ? 13 : fontSize;
        this.calculatedLineHeight = fontSize < 24 ? fontSize + 3 : Math.round(fontSize * 1.2);
        this.baseline = Math.round(this.calculatedLineHeight * 0.8);
      }
    }
    return this;
  }
  return this.style_;
};


/**
 * Compares two objects in simple way and returns the diff result.
 * @param {!Object} oldObj - .
 * @param {!Object} newObj - .
 * @return {!Object} - Difference object.
 */
anychart.core.ui.OptimizedText.prototype.compareObject = function(oldObj, newObj) {
  var diff = {};
  var key;
  for (key in oldObj) {
    if (oldObj[key] !== newObj[key])
      diff[key] = true;
  }
  for (key in newObj) {
    if (newObj[key] !== oldObj[key])
      diff[key] = true;
  }
  return diff;
};


//endregion
//region -- acgraph.vector.IHtmlText implementation.
/**
 * @inheritDoc
 */
anychart.core.ui.OptimizedText.prototype.addSegment = function(text, opt_style, opt_break) {
  /*
    Here we setup the text with a mixture of default style and parsed style.
    Also it drops 'useHtml' value from style extended clone because text,
    came from HTMLParser is constant by style and doesn't need an additional
    HTML parsing.
   */
  var t = this.setupSubText(text, void 0, opt_style, true);

  /*
    But the text can still be complex and \n must be ignored.
   */
  t.prepareNotHtmlComplexity_(true);

  this.recentHtmlLine_.push(t);

};


/**
 * @inheritDoc
 */
anychart.core.ui.OptimizedText.prototype.addBreak = function() {
  if (this.recentHtmlLine_.length) {
    this.multilineTexts_.push(this.recentHtmlLine_);
    this.recentHtmlLine_ = [];
  }
};


/**
 * @inheritDoc
 */
anychart.core.ui.OptimizedText.prototype.finalizeTextLine = function() {
  this.addBreak();
};


/**
 * @inheritDoc
 */
anychart.core.ui.OptimizedText.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = goog.string.normalizeSpaces(opt_value);
    value = goog.string.canonicalizeNewlines(value);
    if (this.text_ != value) {
      this.consistency.text = true;
      this.text_ = value;
    }
    return this;
  }
  return this.text_;
};


//endregion
//region -- Complex text features.
/**
 * Resets complex caches.
 */
anychart.core.ui.OptimizedText.prototype.resetComplexity = function() {
  this.consistency.complexity = false;
  this.disposeMultilines_();
  this.disposeTextsToRender_();

  // if (this.domElement) {
  //   goog.dom.removeNode(this.domElement);
  // }
  // this.container = null;
  this.wordBreakKeepAll_ = false;
  this.wordBreakBreakAll_ = false;
  this.multilineOnly_ = false;
};


/**
 * Disposes multiline texts.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.disposeMultilines_ = function() {
  for (var i = 0; i < this.multilineTexts_.length; i++) {
    var line = this.multilineTexts_[i];
    if (line) {
      for (var j = 0; j < line.length; j++) {
        var text = line[j];
        text.dispose();
      }
    }
    line.length = 0;
  }
  this.multilineTexts_.length = 0;

  if (this.w_wText_) {
    this.w_wText_.dispose();
    this.w_wText_ = null;
  }

  if (this.wText_) {
    this.wText_.dispose();
    this.wText_ = null;
  }
};


/**
 * Disposes texts to render.
 * @param {boolean=} opt_hard - Whether to dispose all textsToRender_.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.disposeTextsToRender_ = function(opt_hard) {
  var i, text;
  if (opt_hard) {
    for (i = 0; i < this.textsToRender_.length; i++) {
      text = this.textsToRender_[i];
      if (text) {
        text.dispose();
      }
    }
    this.textsToRender_.length = 0;
  } else {
    for (i = this.textsToRender_.length - 1; i >= 0; i--) {
      text = this.textsToRender_[i];
      if (text) {
        if (text.consistency.text) {
          text.dispose();
          this.textsToRender_.length -= 1;
        } else {
          text.style(this.style_);
        }
      }
    }
  }
};


/**
 * Actually does nothing in case of simple text and prepares text for measuriator.
 */
anychart.core.ui.OptimizedText.prototype.prepareComplexity = function() {
  if (!this.consistency.complexity) {
    this.consistency.complexity = true;
    if (this.style_['useHtml'])
      this.prepareHtmlComplexity_();
    else
      this.prepareNotHtmlComplexity_();
  }
};


/**
 * Prepares 'useHtml' complexity. Depends on this.style_['useHtml'] option value.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.prepareHtmlComplexity_ = function() {
  this.useHtml_ = true;

  var wordBreak = this.style_['wordBreak'];
  if (wordBreak) {
    if (wordBreak == anychart.enums.WordBreak.BREAK_ALL) {
      this.wordBreakBreakAll_ = true;
    } else {
      this.wordBreakKeepAll_ = true;
    }
  }

  acgraph.utils.HTMLParser.getInstance().parseText(this);

  if (!this.wordBreakBreakAll_ && !this.wordBreakKeepAll_ && this.multilineTexts_.length > 1) {
    this.multilineOnly_ = true;
  }
};


/**
 * TODO (A.Kudryavtsev): Descr.
 * @param {Array.<string>} lines - Lines to prepare.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.prepareNotHtmlWordBreakBreakAll_ = function(lines) {
  var line, textsInLine;

  this.wordBreakBreakAll_ = true;
  //TODO (A.Kudryavtsev): Performance super fail.
  if (!this.multilineTexts_.length) {
    for (var i = 0; i < lines.length; i++) {
      line = lines[i];
      textsInLine = [];
      var cut = '';
      for (var j = 0; j < line.length; j++) {
        cut += line[j];
        textsInLine.push(this.setupSubText(cut));
      }

      this.multilineTexts_.push(textsInLine);
    }
  }
};


/**
 * TODO (A.Kudryavtsev): Descr.
 * @param {Array.<string>} lines - Lines to prepare.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.prepareNotHtmlWordBreakKeepAll_ = function(lines) {
  var line, textsInLine;
  this.wordBreakKeepAll_ = true;
  if (!this.multilineTexts_.length) {
    this.w_wText_ = this.setupSubText('W W', this.w_wText_); //w_wText_ can be undefined here.
    this.wText_ = this.setupSubText('W', this.wText_); //wText_ can be undefined here.

    for (var i = 0; i < lines.length; i++) {
      line = lines[i];
      var splitted = line.split(' '); //TODO (A.Kudryavtsev): Can we replace this with splitting by regex to avoid the next passage?
      var toAdd = '';

      textsInLine = [];
      for (var j = 0; j < splitted.length; j++) {
        toAdd += splitted[j];
        textsInLine.push(this.setupSubText(toAdd));
        toAdd += ((j == splitted.length - 1) ? '' : ' ');
      }

      this.multilineTexts_.push(textsInLine);
    }
  }
};


/**
 * TODO (A.Kudryavtsev): Descr.
 * @param {Array.<string>} lines - Lines to prepare.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.prepareNotHtmlMultilineOnly_ = function(lines) {
  this.multilineOnly_ = true;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (this.textsToRender_[i]) {
      this.setupSubText(line, this.textsToRender_[i]);
    } else {
      this.textsToRender_.push(this.setupSubText(line));
    }
  }
  for (var j = i; j < this.textsToRender_.length; j++) {
    this.textsToRender_[j].dispose();
  }
  this.textsToRender_.length = lines.length;
};


/**
 * Prepares not 'useHtml' complexity. Depends on this.style_['useHtml'] option value.
 * @param {boolean=} opt_ignoreSlashN - Whether to skip splitting text line by \n.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.prepareNotHtmlComplexity_ = function(opt_ignoreSlashN) {
  var lines = opt_ignoreSlashN ?
      [this.text_] :
      this.text_.split(/\n/g); // splitting 'sentence1 \n sentence2' to ['sentence1', 'sentence2'].

  var width = this.style_['width'];
  var height = this.style_['height'];
  var wordBreak = this.style_['wordBreak'];
  var wordWrap = this.style_['wordWrap'];

  if (wordBreak && goog.isDefAndNotNull(width)) {
    if (wordBreak == anychart.enums.WordBreak.BREAK_ALL) {
      this.prepareNotHtmlWordBreakBreakAll_(lines);
    } else {
      this.prepareNotHtmlWordBreakKeepAll_(lines);
    }
    //TODO (A.Kudryavtsev): Check if we need this.
    this.disposeTextsToRender_(true);
  } else if (goog.isDefAndNotNull(wordWrap)) {
    //TODO (A.Kudryavtsev): Future implementation.
  } else if (lines.length > 1) {
    this.prepareNotHtmlMultilineOnly_(lines);
  }
};


/**
 * Finalizes complexity.
 * Actually applies final text settings.
 * NOTE: bounds are already calculated here mathematically (@see prepareComplexity() and
 * putAt() methods). That's why applying final settings doesn't break the bounds correct values.
 */
anychart.core.ui.OptimizedText.prototype.finalizeComplexity = function() {
  if (this.consistency.complexity) {
    this.consistency.complexity = false;
    var i, text;

    //TODO (A.Kudryavtsev): Kind of same conditions? O_o
    if (this.wordBreakKeepAll_ || this.wordBreakBreakAll_) {
      for (i = 0; i < this.textsToRender_.length; i++) {
        text = this.textsToRender_[i];
        text.applySettings();
        text.renderTo(this.container);
      }
      if (this.domElement) {
        goog.dom.removeNode(this.domElement);
        this.container = null;
      }
    } else if (this.multilineOnly_) {
      // if (this.domElement) {
      //   goog.dom.removeNode(this.domElement);
      //   this.container = null;
      // }
      for (i = 0; i < this.textsToRender_.length; i++) {
        text = this.textsToRender_[i];
        text.applySettings();
        text.renderTo(this.container);
      }
      if (this.domElement) {
        goog.dom.removeNode(this.domElement);
        this.container = null;
      }
    }
  }
};


/**
 * To make the instance of OptimizedText act like an old acgraph.vector.Text
 * and save the old features and not to break performance, OptimizedText creates
 * some subTexts and deal with it.
 * General idea: subText must never be complex!
 * @param {string} textValue - .
 * @param {anychart.core.ui.OptimizedText=} opt_text - .
 * @param {Object=} opt_style - Custom style to set.
 * @param {boolean=} opt_dropUseHtml - Whether to remove useHtml value from cloned style.
 * @return {anychart.core.ui.OptimizedText} - Itself.
 */
anychart.core.ui.OptimizedText.prototype.setupSubText = function(textValue, opt_text, opt_style, opt_dropUseHtml) {
  var text = opt_text || new anychart.core.ui.OptimizedText();
  // text.setClassName(this.cssClass_);

  //Makes an extended copy.
  var st = anychart.utils.recursiveExtend(this.style_, opt_style || {});

  if (opt_dropUseHtml)
    st['useHtml'] = false;

  text.style(st);
  text.text(textValue);
  text.applySettings();
  return text;
};


/**
 *
 * @param {Array.<anychart.core.ui.OptimizedText>} line - Line of texts to find matching width.
 * @param {number} width - Width to find.
 * @return {?anychart.core.ui.OptimizedText} - Found text or null if nothing's found.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.findByWidth_ = function(line, width) {
  var index = goog.array.binarySearch(line, width, this.widthComparator_);
  index = index >= 0 ? index : ~index;
  return line[index] || null;
};


/**
 * @param {number} width - Width to find.
 * @param {anychart.core.ui.OptimizedText} text - Text with bounds defined.
 * @return {number}
 * @private
 */
anychart.core.ui.OptimizedText.prototype.widthComparator_ = function(width, text) {
  if (anychart.DEBUG_MEASUREMENTS && (!text.bounds || !text.bounds.width))
    anychart.core.reporting.callLog('warn', 'Bounds are not set or width is zero. Please debug it.');
  return width - text.bounds.width;
};


//endregion
//region -- DOM operations.
/**
 * Creating DOM element.
 */
anychart.core.ui.OptimizedText.prototype.createDom = function() {
  this.domElement = this.renderer.createTextElement();
};


/**
 * Removes fade gradient.
 */
anychart.core.ui.OptimizedText.prototype.removeFadeGradient = function() {
  if (this.stage) {
    for (var i = 0; i < this.textsToRender_.length; i++) {
      var text = this.textsToRender_[i];
      text.removeFadeGradient();
    }

    var defs = this.stage.getDefs();
    if (this.fadeGradientId_) {
      defs.removeLinearGradient(this.fadeGradient_);
      var lGradients = defs.getLinearGradients();
      goog.object.remove(lGradients, this.fadeGradientId_);
      goog.dom.removeNode(goog.dom.getElement(this.fadeGradientId_));
      this.fadeGradientId_ = null;
    }
  }
};


/**
 *
 * @param {anychart.math.Rect} bounds - Bounds to apple fade.
 * @param {acgraph.vector.Text.HAlign=} opt_hAlign - HAlign.
 */
anychart.core.ui.OptimizedText.prototype.setupFadeGradient = function(bounds, opt_hAlign) {
  if (this.stage) {
    var dom = this.getDomElement();
    if (this.style_['textOverflow']) {
      this.removeFadeGradient();
      var defs = this.stage.getDefs();
      var fadeGradientKeys = anychart.utils.getFadeGradientKeys(1,
          this.style_['fontOpacity'], this.style_['fontColor'] || 'black', void 0, opt_hAlign);

      this.fadeGradient_ = defs.getLinearGradient(fadeGradientKeys, void 0, void 0, bounds);
      var pathPrefix = 'url(' + acgraph.getReference() + '#';
      this.fadeGradientId_ = this.renderer.renderLinearGradient(this.fadeGradient_, this.stage.getDefs(), bounds);
      dom.setAttribute('fill', pathPrefix + this.fadeGradientId_ + ')');
    } else {
      dom.setAttribute('fill', this.style_['fontColor']);
    }
  }
};


/**
 * Render to container
 * @param {?Element} element
 * @param {acgraph.vector.Stage=} opt_stage - Stage reference.
 *  Used to get a linear fade gradient.
 */
anychart.core.ui.OptimizedText.prototype.renderTo = function(element, opt_stage) {
  var i, line;
  if (this.wordBreakKeepAll_ || this.wordBreakBreakAll_ || this.useHtml_) {
    this.container = element;
    if (this.wText_)
      this.wText_.renderTo(element);
    if (this.w_wText_)
      this.w_wText_.renderTo(element);
    for (i = 0; i < this.multilineTexts_.length; i++) {
      line = this.multilineTexts_[i];
      if (line) {
        for (var j = 0; j < line.length; j++) {
          line[j].renderTo(element, opt_stage);
        }
      }
    }
    for (i = 0; i < this.textsToRender_.length; i++) {
      line = this.textsToRender_[i];
      if (line) {
        line.renderTo(element, opt_stage);
      }
    }
  } else if (this.multilineOnly_) {
    this.container = element;
    for (i = 0; i < this.textsToRender_.length; i++) {
      line = this.textsToRender_[i];
      if (line) {
        line.renderTo(element, opt_stage);
      }
    }
  } else if (this.container != element) {
    this.container = element;
    var dom = this.getDomElement();
    if (element) {
      element.appendChild(dom);
    } else {
      goog.dom.removeNode(dom);
    }
  }
};


/**
 * @return {boolean} - Whether text (simple or complex)
 *  has dom container.
 */
anychart.core.ui.OptimizedText.prototype.hasContainer = function() {
  /*
    Indirect signs.
    But the order of usage must be organized that way
    to make these conditions work.
   */
  if (this.wordBreakBreakAll_ || this.useHtml_) {
    return !!(this.multilineTexts_[0] && this.multilineTexts_[0][0] && this.multilineTexts_[0][0].container);
  } else if (this.wordBreakKeepAll_) {
    return !!this.wText_.container;
  } else if (this.multilineOnly_) {
    return !!this.textsToRender_[0].container;
  }
  return !!this.container;
};


/**
 * NOTE: this method decides itself which texts to put and how to do it. Depends on text settings.
 * @param {anychart.math.Rect} bounds - Analogue of parent bounds.
 * @param {acgraph.vector.Stage=} opt_stage - Stage instance to deal with fade gradient.
 */
anychart.core.ui.OptimizedText.prototype.putAt = function(bounds, opt_stage) {
  if (goog.isDef(opt_stage))
    this.stage = opt_stage;

  if (this.useHtml_) { //Check this first because html-text can also be 'break-all', etc.
    this.putHtml_(bounds);
  } else if (this.wordBreakBreakAll_) {
    this.putWordBreakKeepAll_(bounds);
  } else if (this.wordBreakKeepAll_) {
    this.putWordBreakKeepAll_(bounds, true);
  } else if (this.multilineOnly_) {
    this.putMultiline_(bounds);
  } else {
    this.putSimple_(bounds);
  }
};


// /**
//  * Puts texts in correct order in WordBeak-KeepAll mode.
//  * @param {anychart.math.Rect} bounds - .
//  * @private
//  */
// anychart.core.ui.OptimizedText.prototype.putWordBreakBreakAll_ = function(bounds) {
//   throw 'Implement';
//   this.putMultiline_(bounds);
// };


/**
 * Puts texts in correct order in WordBeak-KeepAll mode.
 * @param {anychart.math.Rect} bounds - .
 * @param {boolean=} opt_considerSpace - Whether to consider space.
 * @return {number} - TODO (A.Kudryavtsev): Describe.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putWordBreakKeepAll_ = function(bounds, opt_considerSpace) {
  var width = anychart.utils.normalizeSize(this.style_['width'], bounds.width);
  this.disposeTextsToRender_(true);
  this.consistency.complexity = true;
  this.bounds.width = 0;
  this.bounds.height = 0;
  var spaceWidth = opt_considerSpace ? this.spaceWidth : 0;
  var text, b, newText;
  var lastBounds, boundsToSet;

  //Going through the lines splitted by \n.
  for (var i = 0; i < this.multilineTexts_.length; i++) {
    var line = this.multilineTexts_[i];
    var prevWidth = 0;
    var currWidth = 0;
    var textToRemove = '';
    var textToPush;

    for (var j = 0; j < line.length; j++) {
      text = line[j];
      b = text.bounds;
      var widthMatches = b.width - currWidth - spaceWidth > width;
      if (widthMatches) {
        if (j) {
          textToPush = line[j - 1];
        } else {
          textToPush = text;
        }

        newText = new anychart.core.ui.OptimizedText();
        var cut = goog.string.remove(textToPush.text_, textToRemove);

        textToRemove = textToPush.text_ + (opt_considerSpace ? ' ' : '');
        newText.text(cut);
        // newText.style(textToPush.style_);
        newText.style(this.style_);

        currWidth = textToPush.width();
        boundsToSet = new anychart.math.Rect(b.left, b.top, currWidth - prevWidth, b.height);
        currWidth += +spaceWidth;
        prevWidth = currWidth;

        newText.bounds = boundsToSet;
        newText.spaceWidth = spaceWidth;
        newText.stage = this.stage;

        this.textsToRender_.push(newText);
        this.bounds.width = Math.max(this.bounds.width, boundsToSet.width);
        this.bounds.height += boundsToSet.height;
      }
    }

    /*
      Processing the very last line.
      Last line is always shorter than the limiting width,
      that's why it will not be processed in previous condition, so
      we process it here.
     */
    var lastLine = line[line.length - 1];
    /*
        This condition is to avoid double push of the same line.
        This is possible if line is single and longer than width.
       */
    if (lastLine && line.length >= 1 && lastLine != textToPush) {
      cut = goog.string.remove(lastLine.text_, textToRemove);
      b = lastLine.bounds;
      lastBounds = new anychart.math.Rect(b.left, b.top, b.width - currWidth, b.height);
      this.bounds.width = Math.max(this.bounds.width, lastBounds.width);
      this.bounds.height += lastBounds.height;
      newText = new anychart.core.ui.OptimizedText();
      newText.text(cut);
      newText.bounds = lastBounds;
      newText.style(lastLine.style_);
      newText.stage = this.stage;
      this.textsToRender_.push(newText);
    }
  }
  this.putMultiline_(bounds);
  return lastBounds ? lastBounds.width : boundsToSet ? boundsToSet.width : 0;
};


/**
 * Puts texts in correct order in multilineOnly mode.
 * @param {anychart.math.Rect} bounds - .
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putMultiline_ = function(bounds) {
  var i, text;
  var textHeight = 0;
  for (i = 0; i < this.textsToRender_.length; i++) {
    text = this.textsToRender_[i];
    text.stage = this.stage;
    textHeight += text.height();
  }

  var heightIsSet = goog.isDefAndNotNull(this.style_['height']);

  var vAlign = acgraph.vector.Text.VAlign.TOP;
  var hAlign = acgraph.vector.Text.HAlign.LEFT;

  if (goog.isDefAndNotNull(this.style_['width']) && this.style_['hAlign']) {
    hAlign = this.style_['hAlign'];
  }
  if (heightIsSet && this.style_['vAlign']) {
    vAlign = this.style_['vAlign'];
  }

  var width = anychart.utils.normalizeSize(this.style_['width'], bounds.width);
  var height = heightIsSet ?
      anychart.utils.normalizeSize(this.style_['height'], bounds.height) :
      bounds.height;

  var startTop = bounds.top;
  if (vAlign == acgraph.vector.Text.VAlign.MIDDLE) {
    startTop = Math.max(startTop, (bounds.top + height / 2 - textHeight / 2));
  } else if (vAlign == acgraph.vector.Text.VAlign.BOTTOM) {
    startTop = Math.max(startTop, (bounds.top + height - textHeight));
  }

  var top = startTop;
  var left = bounds.left;
  var accumulatedHeight = 0;
  switch (hAlign) {
    case acgraph.vector.Text.HAlign.START:
    case acgraph.vector.Text.HAlign.LEFT:
      for (i = 0; i < this.textsToRender_.length; i++) {
        text = this.textsToRender_[i];
        accumulatedHeight = top - startTop;
        top = this.alignTextToRender_(text, left, accumulatedHeight, bounds, heightIsSet, !i, top);
      }
      break;
    case acgraph.vector.Text.HAlign.CENTER:
      for (i = 0; i < this.textsToRender_.length; i++) {
        text = this.textsToRender_[i];
        if (anychart.DEBUG_MEASUREMENTS && !text.bounds.width)
          anychart.core.reporting.callLog('warn', 'Width is zero. You try to perform horizontal alignment with zero text width, ' +
              'it is probably a bug. Please debug it.');
        accumulatedHeight = top - startTop;
        left = Math.max(bounds.left, bounds.left + bounds.width / 2 - text.bounds.width / 2);
        top = this.alignTextToRender_(text, left, accumulatedHeight, bounds, heightIsSet, !i, top);
      }
      break;
    case acgraph.vector.Text.HAlign.END:
    case acgraph.vector.Text.HAlign.RIGHT:
      for (i = 0; i < this.textsToRender_.length; i++) {
        text = this.textsToRender_[i];
        if (anychart.DEBUG_MEASUREMENTS && !text.bounds.width)
          anychart.core.reporting.callLog('warn', 'Width is zero. You try to perform horizontal alignment with zero text width, ' +
              'it is probably a bug. Please debug it.');
        accumulatedHeight = top - startTop;
        left = Math.max(bounds.left, bounds.left + bounds.width - text.bounds.width);
        top = this.alignTextToRender_(text, left, accumulatedHeight, bounds, heightIsSet, !i, top);
      }
      break;
  }
};


/**
 * TODO (A.Kudryavtsev): Describe.
 * @param {anychart.math.Rect} bounds - .
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putHtml_ = function(bounds) {
  //width will be NaN if bounds are not set.
  var width = anychart.utils.normalizeSize(this.style_['width'], bounds.width);
  this.disposeTextsToRender_(true);
  this.consistency.complexity = true;

  var wordBreak = this.style_['wordBreak'];
  var wordWrap = this.style_['wordWrap'];

  if (this.wordBreakBreakAll_) {
    this.putHtmlWordBreakBreakAll_(bounds);
  } else if (this.wordBreakBreakAll_) {
    //TODO (A.Kudryavtsev): Impl.
  } else if (this.multilineOnly_) {
    this.putHtmlMultilineOnly_(bounds);
  } else {
    //TODO (A.Kudryavtsev):
  }

  // for (var i = 0; i < this.multilineTexts_.length; i++) {
  //   var line = this.multilineTexts_[i];
  //   var maxHeightOfLine = 0, j, t;
  //
  //   for (j = 0; j < line.length; j++) {
  //     t = line[j];
  //     /*
  //       Note that useHtml assumes that bounds are always calculated.
  //       That's why we can ask t.bounds.height directly, not t.height().
  //      */
  //     maxHeightOfLine = Math.max(t.bounds.height); //TODO (A.Kudryavtsev): probably we should ask for baseline, not bounds.height.
  //   }
  //
  //   for (j = 0; j < line.length; j++) {
  //     t = line[j];
  //     console.log(i, j, t.text_);
  //
  //   }
  //
  // }

};


/**
 * Puts html texts in correct order in WordBeak-KeepAll mode.
 * @param {anychart.math.Rect} bounds - .
 * @param {boolean=} opt_considerSpace - Whether to consider space.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putHtmlWordBreakBreakAll_ = function(bounds, opt_considerSpace) {
  /*
    Pretty difficult to understand. The explanation.
    this.multilineTexts_ contains lines of texts split by <br>.

    Each line is the text with its own style.
    Since wordBreakBreakAll_ is set as true, each of these texts can be complex,
    that's why it is also contains its own multilineTexts_.
    To put it correctly, we use the third cycle.
   */
  for (var i = 0; i < this.multilineTexts_.length; i++) {
    /*
      Cycle by source lines split by <br> like
        [<text1><text2>] <br>
        [<text3>]
    */
    var line = this.multilineTexts_[i]; //line is [<text1><text2>]
    var j, k, l;

    for (j = 0; j < line.length; j++) {
      /*
        Cycle by line segments like
          <text1>
          <text2>
       */
      var maxHeightOfLine = 0;
      var segment = line[j]; //segment here is <text1>
      var subLines = segment.multilineTexts_;
      for (k = 0; k < subLines.length; k++) {
        /*
          Cycle by each line of subLines like
          [
            [<t><te><tex><text><text1>]
          ]
         */
        var subLine = subLines[k];
        for (l = 0; l < subLine.length; l++) {
          /*
            subline is line of texts like
              [<t><te><tex><text><text1>]
           */
          var subText = subLine[l]; //is a text <tex>

          /*
            Note that useHtml assumes that bounds are always calculated.
            That's why we can ask t.bounds.height directly, not t.height().
          */
          maxHeightOfLine = Math.max(subText.bounds.height); //TODO (A.Kudryavtsev): probably we should ask for baseline, not bounds.height.
        }
      }
      // console.log(maxHeightOfLine, segment.text_);

    }
  }
};


/**
 * Puts html texts in correct order in multiline-only mode.
 * @param {anychart.math.Rect} bounds - .
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putHtmlMultilineOnly_ = function(bounds) {
  //TODO (A.Kudryavtsev): Implement.
};


/**
 * Puts simple text.
 * @param {anychart.math.Rect} bounds - .
 * @private
 */
anychart.core.ui.OptimizedText.prototype.putSimple_ = function(bounds) {

  //DEV NOTE: consider that basic SVG text node has left-bottom anchor by default.

  this.disposeTextsToRender_(true);
  var dom = this.getDomElement();

  var heightIsSet = goog.isDefAndNotNull(this.style_['height']);
  var widthIsSet = goog.isDefAndNotNull(this.style_['width']);
  var height = this.height();

  var vAlign = acgraph.vector.Text.VAlign.TOP;
  var hAlign = acgraph.vector.Text.HAlign.LEFT;

  if (widthIsSet && this.style_['hAlign']) {
    hAlign = this.style_['hAlign'];
  }
  if (heightIsSet && this.style_['vAlign']) {
    vAlign = this.style_['vAlign'];
  }

  var left = bounds.left;
  var top = bounds.top + this.baseline;

  switch (vAlign) {
    case acgraph.vector.Text.VAlign.TOP:
      //Do nothing.
      break;
    case acgraph.vector.Text.VAlign.MIDDLE:
      top = Math.max(top, bounds.top + bounds.height / 2 + this.baseline / 2);
      break;
    case acgraph.vector.Text.VAlign.BOTTOM:
      // top = Math.max(top, bounds.top + bounds.height);
      top = Math.max(top, bounds.top + bounds.height - this.calculatedLineHeight + this.baseline);
      break;
  }

  switch (hAlign) {
    case acgraph.vector.Text.HAlign.RIGHT:
      if (anychart.DEBUG_MEASUREMENTS && !this.bounds.width)
        anychart.core.reporting.callLog('warn', 'Width is zero. You try to perform horizontal alignment with zero text width, ' +
            'it is probably a bug. Please debug it.');
      left = Math.max(left, left + bounds.width - this.bounds.width);
      break;
    case acgraph.vector.Text.HAlign.CENTER:
      if (anychart.DEBUG_MEASUREMENTS && !this.bounds.width)
        anychart.core.reporting.callLog('warn', 'Width is zero. You try to perform horizontal alignment with zero text width, ' +
            'it is probably a bug. Please debug it.');
      left = Math.max(left, left + bounds.width / 2 - this.bounds.width / 2);
      break;
  }

  this.setupFadeGradient(bounds);
  dom.setAttribute('x', left);
  dom.setAttribute('y', top);
};


/**
 * Correctly places the text in multiline calse.
 * @param {anychart.core.ui.OptimizedText} text - Text instance to align.
 * @param {number} x - Left.
 * @param {number} accumulatedHeight - Height accumulated for current text.
 * @param {anychart.math.Rect} bounds - Bounds to put to.
 * @param {boolean} heightIsSet - Whether the limiting height is set.
 * @param {boolean} addFirstLine - Whether the line is first (muse be added anyway).
 * @param {number} accumulatedTop - Accumulated top value to place next text.
 * @return {number} - Modified top value.
 * @private
 */
anychart.core.ui.OptimizedText.prototype.alignTextToRender_ = function(text, x, accumulatedHeight, bounds, heightIsSet, addFirstLine, accumulatedTop) {
  var dom = text.getDomElement();
  var lineHeight = text.height();
  accumulatedHeight += lineHeight;
  text.setupFadeGradient(bounds);
  if ((heightIsSet && accumulatedHeight <= bounds.height) || !heightIsSet || addFirstLine) {
    dom.setAttribute('x', x + 'px');
    dom.setAttribute('y', accumulatedTop + text.baseline);
    accumulatedTop += lineHeight;
  } else {
    dom.setAttribute('x', '-99999px');
    dom.setAttribute('y', '-99999px');
  }
  return accumulatedTop;
};


/**
 * Returns text DOM element.
 * @return {Element}
 */
anychart.core.ui.OptimizedText.prototype.getDomElement = function() {
  if (!this.domElement)
    this.createDom();

  return this.domElement;
};


/**
 * TODO (A.Kudryavtsev): Desc.
 * @param {string} val
 */
anychart.core.ui.OptimizedText.prototype.setClassName = function(val) {
  this.cssClass_ = val;
  var dom = this.getDomElement();
  goog.dom.classlist.add(dom, val);
};


/**
 * Applying settings.
 */
anychart.core.ui.OptimizedText.prototype.applySettings = function() {
  var i, line;
  if (this.wordBreakKeepAll_ || this.wordBreakBreakAll_) {
    if (this.wText_)
      this.wText_.applySettings();
    if (this.w_wText_)
      this.w_wText_.applySettings();

    for (i = 0; i < this.multilineTexts_.length; i++) {
      line = this.multilineTexts_[i];
      for (var j = 0; j < line.length; j++) {
        line[j].applySettings();
      }
    }
  } else if (this.multilineOnly_) {
    for (i = 0; i < this.textsToRender_.length; i++) {
      line = this.textsToRender_[i];
      if (line)
        line.applySettings();
    }
  } else {
    var style = this.style_;
    var dom = this.getDomElement();
    // dom.removeAttribute('x');
    // dom.removeAttribute('y');

    if (this.consistency.style) {
      if (style['fontStyle']) {
        dom.setAttribute('font-style', style['fontStyle']);
      } else {
        dom.removeAttribute('font-style');
      }

      if (style['fontVariant']) {
        dom.setAttribute('font-variant', style['fontVariant']);
      } else {
        dom.removeAttribute('font-variant');
      }

      if (style['fontFamily']) {
        dom.setAttribute('font-family', style['fontFamily']);
      } else {
        dom.removeAttribute('fontFamily');
      }

      if (style['fontSize']) {
        // var fontSize = style['fontSize'];
        // this.calculatedLineHeight = fontSize < 24 ? fontSize + 3 : Math.round(fontSize * 1.2);
        // this.baseline = Math.round(this.calculatedLineHeight * 0.8);
        dom.setAttribute('font-size', style['fontSize'] + 'px');
      } else {
        // this.calculatedLineHeight = 0;
        dom.removeAttribute('font-size');
      }

      if (style['fontWeight']) {
        dom.setAttribute('font-weight', style['fontWeight']);
      } else {
        dom.removeAttribute('font-weight');
      }

      if (style['letterSpacing']) {
        dom.setAttribute('letter-spacing', style['letterSpacing']);
      } else {
        dom.removeAttribute('letter-spacing');
      }

      if (style['fontDecoration']) {
        dom.setAttribute('text-decoration', style['fontDecoration']);
      } else {
        dom.removeAttribute('text-decoration');
      }

      if (style['fontColor']) {
        if (!style['textOverflow']) //We need it not to overwrite fade gradient.
          dom.setAttribute('fill', style['fontColor']);
      } else {
        dom.removeAttribute('fill');
      }

      if (style['fontOpacity']) {
        dom.setAttribute('opacity', style['fontOpacity']);
      } else {
        dom.removeAttribute('opacity');
      }

      if (style['disablePointerEvents']) {
        // cssString += 'pointer-events: ' + (style['disablePointerEvents'] ? 'none' : '') + ';';
        dom.setAttribute('pointer-events', style['disablePointerEvents'] ? 'none' : '');
      } else {
        dom.removeAttribute('pointer-events');
      }

      // dom.style.cssText = cssString;
      this.consistency.style = false;
    }

    if (this.consistency.text) {
      dom.textContent = this.text_;
      this.consistency.text = false;
    }
  }
};


//endregion
//region -- Bounds features.
/**
 * Prepares bounds for case of complex text only.
 * If bounds can't be got directly (common case is width=100% and we
 * need the parentWidth), this method just prepares subexts for
 * correct bounds calculation and placement.
 *
 * The general idea of this method is not to calculate the bounds, an idea
 * is to prepare text to correct bounds-depending case.
 *
 *
 *   *    *  *****  *****  *****
 *   * *  *  *   *    *    * *
 *   *  * *  *   *    *    *
 *   *    *  *****    *    *****
 *
 *   preforms bounds calculation, don't modify anything in DOM
 *   to prevent forced reflow.
 *
 */
anychart.core.ui.OptimizedText.prototype.prepareBounds = function() {
  // if (!this.bounds) {
  var i, j, text, line;

  this.bounds = new anychart.math.Rect(0, 0, 0, 0);
  if (this.useHtml_) {
    //TODO (A.Kudryavtsev): Describe these 4 cycles.
    for (i = 0; i < this.multilineTexts_.length; i++) {
      line = this.multilineTexts_[i];
      for (j = 0; j < line.length; j++) {
        var subText = line[j];
        var subLines = subText.multilineTexts_;
        for (var k = 0; k < subLines.length; k++) {
          var subLine = subLines[k];
          for (var l = 0; l < subLine.length; l++) {
            subLine[l].prepareBounds();
          }
        }
      }
    }
  } else if (this.wordBreakBreakAll_) {
    for (i = 0; i < this.multilineTexts_.length; i++) {
      line = this.multilineTexts_[i];
      for (j = 0; j < line.length; j++) {
        // Here we know that this method actually does'n calculate total bounds in this 'if'.
        line[j].prepareBounds();
      }
    }
  } else if (this.wordBreakKeepAll_) {

    /*
       Calculating space width for current style.
       TODO (A.Kudryavtsev): Cache it with spaceWidth checking.
      */
    this.w_wText_.prepareBounds();
    this.wText_.prepareBounds();
    this.spaceWidth = this.w_wText_.bounds.width - 2 * this.wText_.bounds.width;

    for (i = 0; i < this.multilineTexts_.length; i++) {
      line = this.multilineTexts_[i];
      for (j = 0; j < line.length; j++) {
        // Here we know that this method actually does'n calculate total bounds in this 'if'.
        line[j].prepareBounds();
      }
    }
  } else if (this.multilineOnly_) {
    for (i = 0; i < this.textsToRender_.length; i++) {
      text = this.textsToRender_[i];
      text.prepareBounds();
      this.bounds.width = Math.max(this.bounds.width, text.bounds.width);
      this.bounds.height += text.height();
    }
  } else {
    var dom = this.getDomElement();
    if (anychart.DEBUG_MEASUREMENTS) {
      if (!dom.parentNode)
        anychart.core.reporting.callLog('warn', 'You try to measure text "' + this.text_ + '" that does\'t have ' +
            'a parent DOM node. It is probably an incorrect use case. Debug it.');
    }

    var bbox = dom['getBBox']();
    this.bounds.left = bbox.x;
    this.bounds.top = -bbox.y;
    this.bounds.width = bbox.width;
    // this.bounds.height = bbox.height;
    this.bounds.height = this.calculatedLineHeight;
  }
  // }
};


/**
 * Getting bounds.
 * DEV NOTE:
 * This class is named OptimizedText because it is really optimized.
 * Working with anychart.core.ui.LabelsSettings, here are a lot of cases
 * when text bounds calculation is not necessary (just @see prepareBounds() method).
 * Calling this method is NOT A GUARANTEE of you'll get the bounds anytime you wish.
 * Even the call of prepareBounds() is not a guarantee of getting required
 * bounds because it may calculate bounds for correct complex text features.
 *
 * Sometimes bounds are calculated only after the text is rendered for optimization
 * purposes. That's why try to not to use this method, just use text.bounds direct field
 * access instead. At least you'll get an exception and realize that you do something wrong
 * and debug it.
 *
 * @return {anychart.math.Rect}
 */
anychart.core.ui.OptimizedText.prototype.getBounds = function() {
  if (this.bounds) {
    if (anychart.DEBUG_MEASUREMENTS) {
      if (!this.bounds.width || !this.bounds.height)
        anychart.core.reporting.callLog('warn', 'Width or height is zero. You probably did not follow OptimizedText lifecycle, ' +
            'have forgotten to set the container or (depending on text settings) just don\'t need this bounds. Please debug it.');
    }
    return this.bounds;
  } else {
    if (anychart.DEBUG_MEASUREMENTS) {
      anychart.core.reporting.callLog('warn', 'You trying to get bounds that are not calculated. You won\'t get ' +
          'an exception here, but bounds are calculated badly (width is definitely 0). Please debug it.');
    }
    // We don't cache bounds to this.bounds because it will prevent anychart.DEBUG_MEASUREMENTS developer message above.
    return new anychart.math.Rect(0, 0, 0, this.calculatedLineHeight);
  }
};


/**
 * Drop bounds.
 */
anychart.core.ui.OptimizedText.prototype.dropBounds = function() {
  this.bounds = null;
};


//endregion
//region -- Disposing.
/**
 * Disposes element.
 */
anychart.core.ui.OptimizedText.prototype.dispose = function() {
  this.removeFadeGradient();
  if (this.domElement) {
    goog.dom.removeNode(this.domElement);
    this.domElement = null;
  }
  this.container = null;
  this.stage = null;
  this.style({});
  this.text('');
};


//endregion
