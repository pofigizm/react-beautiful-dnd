'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _position = require('./position');

exports.default = function (_ref) {
  var movement = _ref.movement,
      clientOffset = _ref.clientOffset,
      pageOffset = _ref.pageOffset,
      droppableScrollDiff = _ref.droppableScrollDiff,
      windowScrollDiff = _ref.windowScrollDiff,
      draggables = _ref.draggables,
      axis = _ref.axis;

  if (!movement.draggables.length) {
    return (0, _position.add)(droppableScrollDiff, windowScrollDiff);
  }

  if (!axis) {
    console.error('should not have any movement if there is no axis');
    return (0, _position.add)(droppableScrollDiff, windowScrollDiff);
  }

  var distance = movement.draggables.reduce(function (previous, draggableId) {
    var dimension = draggables[draggableId];

    return previous + dimension.page.withMargin[axis.size];
  }, 0);

  var signed = movement.isBeyondStartPosition ? distance : -distance;

  var amount = (0, _position.patch)(axis.line, signed);

  var diff = (0, _position.subtract)(amount, pageOffset);

  var client = (0, _position.add)(diff, clientOffset);

  var withScroll = (0, _position.add)(client, droppableScrollDiff);

  return withScroll;
};