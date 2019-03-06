goog.provide('anychart.graphModule.elements.Group');

goog.require('anychart.graphModule.Chart');
goog.require('anychart.graphModule.elements.Base');



/**
 * @constructor
 * @param {anychart.graphModule.Chart} chart
 * @extends {anychart.graphModule.elements.Base}
 * */
anychart.graphModule.elements.Group = function(chart) {
  anychart.graphModule.elements.Group.base(this, 'constructor', chart);
};
goog.inherits(anychart.graphModule.elements.Group, anychart.graphModule.elements.Base);


// /**
//  * @param {string} groupId id of node.
//  * @return {?anychart.graphModule.elements.Group}
//  * */
// anychart.graphModule.elements.Group.prototype.group = function(groupId) {
//   return this.chart_.getElementInstance(anychart.graphModule.Chart.Element.GROUP, groupId);
// };
//
//
// /**
//  * @return {Array.<anychart.graphModule.elements.Group>}
//  * */
// anychart.graphModule.elements.Group.prototype.getAllGroups = function() {
//   var groups = [];
//   for (var group in this.chart_.groups_) {
//     groups.push(this.group(group));
//   }
//   return groups;
// };
//
//
// /**
//  * @return {Array.<string>}
//  * */
// anychart.graphModule.elements.Group.prototype.getGroupIds = function() {
//   var ids = [];
//   //todo getter for groups
//   for (var group in this.chart_.groups_) {
//     ids.push(group);
//   }
//   return ids;
// };



//endregion
//region Exports
(function() {
  var proto = anychart.graphModule.elements.Group.prototype;

})();
