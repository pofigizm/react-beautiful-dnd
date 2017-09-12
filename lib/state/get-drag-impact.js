'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _position = require('./position');

var _getDroppableOver = require('./get-droppable-over');

var _getDroppableOver2 = _interopRequireDefault(_getDroppableOver);

var _getDraggablesInsideDroppable = require('./get-draggables-inside-droppable');

var _getDraggablesInsideDroppable2 = _interopRequireDefault(_getDraggablesInsideDroppable);

var _noImpact = require('./no-impact');

var _noImpact2 = _interopRequireDefault(_noImpact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (_ref) {
  var page = _ref.page,
      withinDroppable = _ref.withinDroppable,
      draggableId = _ref.draggableId,
      draggables = _ref.draggables,
      droppables = _ref.droppables;

  var droppableId = (0, _getDroppableOver2.default)(page, droppables);

  if (!droppableId) {
    return _noImpact2.default;
  }

  var newCenter = withinDroppable.center;
  var draggingDimension = draggables[draggableId];
  var droppableDimension = droppables[droppableId];

  var insideDroppable = (0, _getDraggablesInsideDroppable2.default)(droppableDimension, draggables);

  var axis = droppableDimension.axis;

  var draggableCenter = draggingDimension.page.withoutMargin.center;
  var isBeyondStartPosition = newCenter[axis.line] - draggableCenter[axis.line] > 0;

  var moved = insideDroppable.filter(function (dimension) {
    if (dimension === draggingDimension) {
      return false;
    }

    var fragment = dimension.page.withoutMargin;

    if (isBeyondStartPosition) {
      if (fragment.center[axis.line] < draggableCenter[axis.line]) {
        return false;
      }

      return newCenter[axis.line] > fragment[axis.start];
    }

    if (draggableCenter[axis.line] < fragment.center[axis.line]) {
      return false;
    }

    return newCenter[axis.line] < fragment[axis.end];
  }).map(function (dimension) {
    return dimension.id;
  });

  var startIndex = insideDroppable.indexOf(draggingDimension);
  var index = function () {
    if (!moved.length) {
      return startIndex;
    }

    if (isBeyondStartPosition) {
      return startIndex + moved.length;
    }

    return startIndex - moved.length;
  }();

  var distance = index !== startIndex ? draggingDimension.page.withMargin[axis.size] : 0;

  var amount = (0, _position.patch)(axis.line, distance);

  var movement = {
    amount: amount,
    draggables: moved,
    isBeyondStartPosition: isBeyondStartPosition
  };

  var impact = {
    movement: movement,
    direction: axis.direction,
    destination: {
      droppableId: droppableId,
      index: index
    }
  };

  return impact;
};