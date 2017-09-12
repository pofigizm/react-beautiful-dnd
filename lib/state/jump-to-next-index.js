'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _getDraggablesInsideDroppable = require('./get-draggables-inside-droppable');

var _getDraggablesInsideDroppable2 = _interopRequireDefault(_getDraggablesInsideDroppable);

var _position = require('./position');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getIndex = (0, _memoizeOne2.default)(function (draggables, target) {
  return draggables.indexOf(target);
});

exports.default = function (_ref) {
  var isMovingForward = _ref.isMovingForward,
      draggableId = _ref.draggableId,
      impact = _ref.impact,
      draggables = _ref.draggables,
      droppables = _ref.droppables;

  if (!impact.destination) {
    console.error('cannot move forward when there is not previous destination');
    return null;
  }

  var location = impact.destination;
  var droppable = droppables[location.droppableId];
  var draggable = draggables[draggableId];
  var currentIndex = location.index;
  var axis = droppable.axis;

  var insideDroppable = (0, _getDraggablesInsideDroppable2.default)(droppable, draggables);

  var startIndex = getIndex(insideDroppable, draggable);

  if (startIndex === -1) {
    console.error('could not find draggable inside current droppable');
    return null;
  }

  if (isMovingForward && currentIndex === insideDroppable.length - 1) {
    return null;
  }

  if (!isMovingForward && currentIndex === 0) {
    return null;
  }

  var atCurrentIndex = insideDroppable[currentIndex];
  var nextIndex = isMovingForward ? currentIndex + 1 : currentIndex - 1;
  var atNextIndex = insideDroppable[nextIndex];

  var isMovingTowardStart = isMovingForward && nextIndex <= startIndex || !isMovingForward && nextIndex >= startIndex;

  var distance = isMovingTowardStart ? atCurrentIndex.page.withMargin[axis.size] : atNextIndex.page.withMargin[axis.size];

  var signed = isMovingForward ? distance : -distance;

  var diff = (0, _position.patch)(axis.line, signed);

  var moved = isMovingTowardStart ? impact.movement.draggables.slice(0, impact.movement.draggables.length - 1) : [].concat((0, _toConsumableArray3.default)(impact.movement.draggables), [atNextIndex.id]);

  var newImpact = {
    movement: {
      draggables: moved,

      amount: (0, _position.patch)(axis.line, draggable.page.withMargin[axis.size]),
      isBeyondStartPosition: nextIndex > startIndex
    },
    destination: {
      droppableId: droppable.id,
      index: nextIndex
    },
    direction: droppable.axis.direction
  };

  var result = {
    diff: diff, impact: newImpact
  };

  return result;
};