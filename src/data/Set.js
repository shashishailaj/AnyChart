goog.provide('anychart.data.Set');

goog.require('anychart.Base');
goog.require('anychart.data.IView');
goog.require('anychart.data.Mapping');
//goog.require('anychart.globalLock'); should be here but commented cause of circular dependency in export.js
goog.require('goog.array');



/**
 * Linear data storage.<br/>
 * Data is stored as an array or rows where each row contains several columns (see Listing 1 below).
 * To start working with this storage you need to map columns using
 * {@link anychart.data.Set#mapAs} method (you can create as many mappings as you like).<br/>
 * Each field can be a number, a string, a function, an array or an object.
 * Data fields can of any type and they way you read them depends on mapping only:
 * {@link anychart.data.Set#mapAs}. Sample mappings are shown in code samples 3, 4 and 5.<br/>
 * <b>Note:</b> To create an instance of this class use method {@link anychart.data.set}.
 * @example <c>Sample 1. Data notion.</c><t>listingOnly</t>
 * // Col1 Col2 Col3
 *  [
 *   [110, 112, 114], // row1
 *   [210, 212, 214], // row2
 *   [310, 312, 314], // row3
 *   [410, 412, 414]  // row4
 *  ]
 * // Col1
 *  [
 *    114, // row1
 *    214, // row2
 *    314, // row3
 *    414  // row4
 *  ]
 * @example <c>Sample 2. Sample data.</c><t>listingOnly</t>
 * // An array with numbers, strings and functions:
 *  anychart.data.set([
 *    20,
 *    7,
 *    '10',
 *    function(smth){ return smth*10; }
 *    ]);
 * // An array of arrays:
 *  anychart.data.set([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 * // An array of objects.
 *  anychart.data.set([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 * // A multi-typed array:
 *  anychart.data.set([
 *    {value: 10, name: 'Point 1'},
 *    {value: 7, name: 'Point 2'},
 *    [20, 'Point 3'],
 *    [14, 'Point 4'],
 *    [-14, 'Point 5', function (params) { do_smth; return smth; }],
 *    '17',
 *    22,
 *    function (params) { do_smth; return smth; }
 *  ]);
 * @example <c>Sample 3. Default data mapping. Numbers.</c><t>listingOnly</t>
 * // 'x' is an index of an element and 'value' is its value.
 *   // Raw data         Mapped as
 *   [
 *    1,                        {x: 0, value: 1}
 *    2,                        {x: 1, value: 2}
 *    '-5',                     {x: 2, value: -5}
 *    function(){ return 1;}    {x: 3, value: 1}
 *   ]
 *   // so this will not work with OHLC
 * @example <c>Sample 4. Default data mapping. Arrays.</c><t>listingOnly</t>
 * // 'x' is an element with the index of 0,
 * // 'value' is an element with the index of 1,
 * // 'size' is an element with the index of 2.
 * // All elements with the index greater than 2 are ignored.
 *   // Raw data          Mapped as
 *   [
 *      [2],                     {x: 2}
 *      [5, 13],                 {x: 5, value: 13}
 *      [7, '4', 21],            {x: 7, value: 4, size: 21}
 *      [11, 21, 34, 45]         {x: 11, value: 21, size: 34}
 *   ]
 *   // In case of OHLC
 *     // 'open' is an element with the index of 0
 *     // 'high' is an element with the index of 1
 *     // 'low' is an element with the index of 2
 *     // 'close' is an element with the index of 3
 *     //  All elements with the index greater than 3 are ignored.
 *     [
 *        [11, 21, 34, 45]         {open: 11, high: 21, low: 34, close: 45}
 *     ]
 * @example <c>Sample 5. Default data mapping. Objects.</c><t>listingOnly</t>
 * // In objects everything corresponds to the names of properties, but you can define several mappings and a priority.
 * // E.g.: 'x' can be mapped to 'x' and 'value' can be looked for
 * // in 'value', then 'y', then in 'close'.
 *   // Raw data                 Mapped as
 *   [
 *      {x: 2},                           {x: 2}
 *      {x: 5, value: 13},                {x: 5, value: 13}
 *      {x: 7, y: 4, size: 21},           {x: 7, value: 4, size: 21}
 *      {x: 11, close: 21, size: 34}      {x: 11, value: 21, size: 34}
 *   ]
 *   // In case of OHLC
 *   [
 *     {open: 11, high: 21, low: 34, close: 45}   {open: 11, high: 21, low: 34, close: 45}
 *   ]
 *     // 'open' is an element with the index of 0,
 *     // 'high' is an element with the index of 1,
 *     // 'low' is an element with the index of 2,
 *     // 'close' is an element with the index of 3.
 *     // All elements with the index greater than 3 are ignored.
 * @param {(Array|string)=} opt_data Data set raw data can be set here.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @implements {anychart.data.IView}
 * @extends {anychart.Base}
 */
anychart.data.Set = function(opt_data, opt_csvSettings) {
  goog.base(this);
  this.data(opt_data || null, opt_csvSettings);
};
goog.inherits(anychart.data.Set, anychart.Base);


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.data.Set.prototype.SUPPORTED_SIGNALS = anychart.Signal.DATA_CHANGED;


/**
 * Internal data set storage.
 * @type {!Array}
 */
anychart.data.Set.prototype.storage_;


/**
 * Getter for the data in the Set.
 * @return {!Array} Data array of the Set.
 *//**
 * Setter for Set data.
 * @example <t>listingOnly</t>
 * // as simple arrray
 * dataSet.data([20, 7, 10, 14]);
 * // as multiple arrays
 * dataSet.data([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 * // as Objects
 * dataSet.data([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 * // as CSV string
 * dataSet.data(
 *      'Point 1, 10; Point 2, 14; Point 3, 16',
 *      {rowsSeparator: ';', columnsSeparator: ','}
 * );
 * @example <t>lineChart</t>
 * var dataSet = anychart.data.set();
 * dataSet.data([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7, fill: 'red 0.3'},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 * ]);
 * chart.line(dataSet);
 * @param {Array=} opt_value A value to set.
 * @return {!anychart.data.Set} The instance of {@link anychart.data.Set} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(Array|string)=} opt_value .
 * @param {Object.<string, (string|boolean|undefined)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!(anychart.data.Set|Array)} .
 */
anychart.data.Set.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    anychart.globalLock.lock();
    if (goog.isString(opt_value)) {
      try {
        var parser = new anychart.data.csv.Parser();
        if (goog.isObject(opt_csvSettings)) {
          parser.rowsSeparator(/** @type {string|undefined} */(opt_csvSettings['rowsSeparator'])); // if it is undefined, it will not be set.
          parser.columnsSeparator(/** @type {string|undefined} */(opt_csvSettings['columnsSeparator'])); // if it is undefined, it will not be set.
          parser.ignoreTrailingSpaces(/** @type {boolean|undefined} */(opt_csvSettings['ignoreTrailingSpaces'])); // if it is undefined, it will not be set.
          parser.ignoreFirstRow(/** @type {boolean|undefined} */(opt_csvSettings['ignoreFirstRow'])); // if it is undefined, it will not be set.
        }
        opt_value = parser.parse(opt_value);
      } catch (e) {
        if (e instanceof Error) {
          try {
            goog.global['console']['log'](e.message);
          } catch (ignored) {
          }
        }
        opt_value = null;
      }
    }
    if (goog.isArrayLike(opt_value)) {
      /** @type {!Array} */
      var data = goog.array.slice(opt_value, 0);
      for (/** @type {number} */ var i = data.length; i--;) {
        if (goog.isArrayLike(data[i]))
          data[i] = goog.array.slice(data[i], 0);
      }
      this.storage_ = data;
      this.dispatchSignal(anychart.Signal.DATA_CHANGED);
    } else {
      if (this.storage_ && this.storage_.length > 0) {
        this.storage_.length = 0;
        this.dispatchSignal(anychart.Signal.DATA_CHANGED);
      } else {
        this.storage_ = [];
      }
    }
    anychart.globalLock.unlock();
    return this;
  }
  return this.storage_;
};


/**
 * Defines data mapping.<br/>
 * You can define mappings for the different types of data (see samples).
 * Default mapping is shown in {@link anychart.data.Set} constructor samples.
 * @example <c>Custom data mapping.</c><t>listingOnly</t>
 * // Simple mapping
 *  dataSet.mapAs({
 *    'value': [0],
 *    'x': [1],
 *    'fill': [2]
 *  });
 *   // Raw data          Mapped as
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    [14, 3, 'blue 0.5'],      {x: 3, value: 14, fill: 'blue 0.5'}
 *    [11, 4, 'yellow 0.5']     {x: 4, value: 11, fill: 'yellow 0.5'}
 *   ]
 * // Combined mapping
 *  dataSet.mapAs({
 *    'value': [0],
 *    'x': [1],
 *    'fill': [2]
 *   },{
 *    'value': ['close', 'customY'],
 *    'fill': ['fill', 'color']
 *   }, null, ['close']
 *  );
 *  // Raw data          Mapped as
 *   [
 *    [11, 1, 'red 0.5'],       {x: 1, value: 11, fill: 'red 0.5'}
 *    [21, 2, 'green 0.5'],     {x: 2, value: 21, fill: 'green 0.5'}
 *    {
 *      value: 14,
 *      x: 3,                   {x: 3, value: 14, fill: 'blue 0.5'}
 *      fill: 'blue 0.5'
 *    },{
 *      customY: '71',
 *      x: 3,                   {x: 3, value: 71, fill: 'blue 0.5', size 14}
 *      color: 'blue 0.5',
 *      size: 14
 *    },
 *    11,                       {close: 4, value: 11}
 *    function(){ return 99;}   {close: 5, value: 99}
 *   ]
 * @example
 * var dataSet = anychart.data.set([
 *      [11, 18, 1, 'red 0.5', 'orange'],
 *      [21, 15, 2, 'green 0.5', 'blue'],
 *      [14, 16, 3, 'white', 'black'],
 *      {value: 17, x: 4, fill: 'yellow'}
 * ]);
 * var chart = anychart.barChart();
 * chart.column(
 *      dataSet.mapAs({'value': [0], 'x': [2], 'fill': [3]})
 * );
 * chart.column(
 *      dataSet.mapAs({'value': [1], 'x': [2], 'fill': [4]})
 * );
 * chart.container(stage).draw();
 * @param {!(Object.<Array.<number>>)=} opt_arrayMapping [{
 *   'x': &#91;0&#93;,
 *   'value': &#91;1, 0&#93;,
 *   'size': &#91;2&#93;,
 *   'open': &#91;1&#93;,
 *   'high': &#91;2&#93;,
 *   'low': &#91;3, 1&#93;,
 *   'close': &#91;4&#93;
 * }] Column mapping for the rows which are arrays.
 * @param {!(Object.<Array.<string>>)=} opt_objectMapping [{'value': &#91;'value', 'y', 'close'&#93;}] Column mapping for the rows
 *  which are objects.
 * @param {!(Array.<string>)=} opt_defaultProps [&#91;'value', 'close'&#93;] The names of the fields to map to
 *  if a row is a string, number or a function. Does not work in cases when a row is an object.
 * @param {!(Array.<string>)=} opt_indexProps [&#91;'x'&#93;] The names of the fields to be mapped to the current index
 *  if other options failed.
 * @return {!anychart.data.Mapping} The mapping for the data set.
 */
anychart.data.Set.prototype.mapAs = function(opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps) {
  var res = new anychart.data.Mapping(this, opt_arrayMapping, opt_objectMapping, opt_defaultProps, opt_indexProps);
  this.registerDisposable(res);
  return res;
};


/**
 * Gets the full row of the set by the index.<br/>
 * <b>Note:</b> If there is no row for the index - returns <b>undefined</b>.
 * @example <t>listingOnly</t>
 * // Data
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    7
 *  ]
 *  dataSet.row(0); // returns [1, 2, 4, 7]
 *  dataSet.row(1); // returns {'high': 14, 'low': 3}
 *  dataSet.row(2); // returns 7
 *  dataSet.row(3); // returns undefined
 * @param {number} rowIndex The index of the row to fetch.
 * @return {*} The current row.
 *//**
 * Sets the row in the set by the index.<br/>
 * <b>Note:</b> Replaces the current value, previous values is returned but it is lost completely after that!
 * @example <t>listingOnly</t>
 * // Data
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    7
 *  ]
 *  dataSet.row(2, [2, 2, 2, 2]); // returns 7
 *  dataSet.row(3, {'low': 4, 'high': 11}); // returns undefined
 * // Data after the changes
 *  [
 *    [1, 2, 4, 7],
 *    {'high': 14, 'low': 3},
 *    [2, 2, 2, 2],
 *    {'low': 4, 'high': 11}
 *  ]
 * @example <t>lineChart</t>
 * var dataSet = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * dataSet.row(2, ['Point E', 10]);
 * chart.line(dataSet);
 * @param {number} rowIndex The index of the row to fetch.
 * @param {*=} opt_value The value to set.
 * @return {*} The previous value of the row.
 *//**
 * @ignoreDoc
 * @param {number} rowIndex The index of the row to fetch.
 * @param {*=} opt_value If set, the method is treated as a setter.
 * @return {*} Current or previous value of the row. Can be anything, including undefined.
 */
anychart.data.Set.prototype.row = function(rowIndex, opt_value) {
  /** @type {*} */
  var value = this.storage_[rowIndex];
  if (arguments.length > 1) {
    anychart.globalLock.lock();
    this.storage_[rowIndex] = opt_value;
    this.dispatchSignal(anychart.Signal.DATA_CHANGED);
    anychart.globalLock.unlock();
  }
  return value;
};


/**
 * Appends new rows to the set. Each argument is a row that will be appended to the Set.
 * @param {...*} var_args Rows to append.
 * @return {!anychart.data.Set} Returns itself for chaining.
 */
anychart.data.Set.prototype.append = function(var_args) {
  anychart.globalLock.lock();
  this.storage_.push.apply(this.storage_, arguments);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Inserts the row to the set at the specified position.
 * @param {*} row Row to insert.
 * @param {number=} opt_index The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 * @return {!anychart.data.Set} Itself for chaining.
 */
anychart.data.Set.prototype.insert = function(row, opt_index) {
  anychart.globalLock.lock();
  goog.array.insertAt(this.storage_, row, opt_index);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Removes the row by index.
 * @param {number} index Index of the row to remove.
 * @return {!anychart.data.Set}
 */
anychart.data.Set.prototype.remove = function(index) {
  anychart.globalLock.lock();
  goog.array.removeAt(this.storage_, index);
  this.dispatchSignal(anychart.Signal.DATA_CHANGED);
  anychart.globalLock.unlock();
  return this;
};


/**
 * Returns the number of the rows in the current data set.
 * @example <t>lineChart</t>
 *  var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * chart.title().text("rows count: " + data.getRowsCount());
 * chart.line(data)
 * @return {number} The number of the rows in the set.
 */
anychart.data.Set.prototype.getRowsCount = function() {
  return this.storage_.length;
};


/**
 * Returns the mapping for the row. This method is not implemented for the Set. Use mapAs() instead.
 * @param {number} rowIndex The index of the row.
 */
anychart.data.Set.prototype.getRowMapping = function(rowIndex) {
  //TODO(Anton Saukh): replace this throw by proper error handling.
  //TODO(Anton Saukh): please avoid curses in the code!
  throw new Error('Asking rowMapping from a Set! What a shame...');
};


/**
 * Return instance of class {@link anychart.data.Set}.
 * @example <t>lineChart</t>
 * var data = anychart.data.set([
 *     ['Point A', 231],
 *     ['Point B', 131],
 *     ['Point C', 212],
 *     ['Point D', 94]
 * ]);
 * chart.line(data);
 * @param {(Array|string)=} opt_data Data set raw data can be set here.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @return {!anychart.data.Set}
 */
anychart.data.set = function(opt_data, opt_csvSettings) {
  return new anychart.data.Set(opt_data, opt_csvSettings);
};


//exports
goog.exportSymbol('anychart.data.set', anychart.data.set);//doc|ex
anychart.data.Set.prototype['data'] = anychart.data.Set.prototype.data;//doc|ex
anychart.data.Set.prototype['mapAs'] = anychart.data.Set.prototype.mapAs;//doc|ex
anychart.data.Set.prototype['row'] = anychart.data.Set.prototype.row;//doc|ex
anychart.data.Set.prototype['append'] = anychart.data.Set.prototype.append;
anychart.data.Set.prototype['insert'] = anychart.data.Set.prototype.insert;
anychart.data.Set.prototype['remove'] = anychart.data.Set.prototype.remove;
anychart.data.Set.prototype['getRowsCount'] = anychart.data.Set.prototype.getRowsCount;//doc|ex
