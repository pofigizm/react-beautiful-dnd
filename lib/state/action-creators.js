'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lift = exports.dropAnimationFinished = exports.cancel = exports.drop = exports.completeDrop = exports.clean = exports.moveForward = exports.moveBackward = exports.moveByWindowScroll = exports.move = exports.updateDroppableDimensionScroll = exports.publishDroppableDimension = exports.publishDraggableDimension = exports.requestDimensions = undefined;

var _noImpact = require('./no-impact');

var _noImpact2 = _interopRequireDefault(_noImpact);

var _getNewHomeClientOffset = require('./get-new-home-client-offset');

var _getNewHomeClientOffset2 = _interopRequireDefault(_getNewHomeClientOffset);

var _position = require('./position');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = { x: 0, y: 0 };

var getScrollDiff = function getScrollDiff(initial, current, droppable) {
  var windowScrollDiff = (0, _position.subtract)(initial.windowScroll, current.windowScroll);
  var droppableScrollDiff = (0, _position.subtract)(droppable.scroll.initial, droppable.scroll.current);

  return {
    window: windowScrollDiff,
    droppable: droppableScrollDiff
  };
};

var requestDimensions = exports.requestDimensions = function requestDimensions(type) {
  return {
    type: 'REQUEST_DIMENSIONS',
    payload: type
  };
};

var beginLift = function beginLift() {
  return {
    type: 'BEGIN_LIFT'
  };
};

var completeLift = function completeLift(id, type, client, page, windowScroll) {
  return {
    type: 'COMPLETE_LIFT',
    payload: {
      id: id,
      type: type,
      client: client,
      page: page,
      windowScroll: windowScroll
    }
  };
};

var publishDraggableDimension = exports.publishDraggableDimension = function publishDraggableDimension(dimension) {
  return {
    type: 'PUBLISH_DRAGGABLE_DIMENSION',
    payload: dimension
  };
};

var publishDroppableDimension = exports.publishDroppableDimension = function publishDroppableDimension(dimension) {
  return {
    type: 'PUBLISH_DROPPABLE_DIMENSION',
    payload: dimension
  };
};

var updateDroppableDimensionScroll = exports.updateDroppableDimensionScroll = function updateDroppableDimensionScroll(id, offset) {
  return {
    type: 'UPDATE_DROPPABLE_DIMENSION_SCROLL',
    payload: {
      id: id,
      offset: offset
    }
  };
};

var move = exports.move = function move(id, client, page, windowScroll) {
  return {
    type: 'MOVE',
    payload: {
      id: id,
      client: client,
      page: page,
      windowScroll: windowScroll
    }
  };
};

var moveByWindowScroll = exports.moveByWindowScroll = function moveByWindowScroll(id, windowScroll) {
  return {
    type: 'MOVE_BY_WINDOW_SCROLL',
    payload: {
      id: id,
      windowScroll: windowScroll
    }
  };
};

var moveBackward = exports.moveBackward = function moveBackward(id) {
  return {
    type: 'MOVE_BACKWARD',
    payload: id
  };
};

var moveForward = exports.moveForward = function moveForward(id) {
  return {
    type: 'MOVE_FORWARD',
    payload: id
  };
};

var clean = exports.clean = function clean() {
  return {
    type: 'CLEAN',
    payload: null
  };
};

var animateDrop = function animateDrop(_ref) {
  var trigger = _ref.trigger,
      newHomeOffset = _ref.newHomeOffset,
      impact = _ref.impact,
      result = _ref.result;
  return {
    type: 'DROP_ANIMATE',
    payload: {
      trigger: trigger,
      newHomeOffset: newHomeOffset,
      impact: impact,
      result: result
    }
  };
};

var completeDrop = exports.completeDrop = function completeDrop(result) {
  return {
    type: 'DROP_COMPLETE',
    payload: result
  };
};

var drop = exports.drop = function drop() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase === 'COLLECTING_DIMENSIONS') {
      console.error('canceling drag while collecting');
      dispatch(clean());
      return;
    }

    if (state.phase !== 'DRAGGING') {
      console.error('cannot drop if not dragging', state);
      dispatch(clean());
      return;
    }

    if (!state.drag) {
      console.error('invalid drag state', state);
      dispatch(clean());
      return;
    }

    var _state$drag = state.drag,
        impact = _state$drag.impact,
        initial = _state$drag.initial,
        current = _state$drag.current;

    var sourceDroppable = state.dimension.droppable[initial.source.droppableId];
    var destinationDroppable = impact.destination ? state.dimension.droppable[impact.destination.droppableId] : null;

    var result = {
      draggableId: current.id,
      type: current.type,
      source: initial.source,
      destination: impact.destination
    };

    var scrollDiff = getScrollDiff(initial, current, sourceDroppable);

    var newHomeOffset = (0, _getNewHomeClientOffset2.default)({
      movement: impact.movement,
      clientOffset: current.client.offset,
      pageOffset: current.page.offset,
      droppableScrollDiff: scrollDiff.droppable,
      windowScrollDiff: scrollDiff.window,
      draggables: state.dimension.draggable,
      axis: destinationDroppable ? destinationDroppable.axis : null
    });

    var isAnimationRequired = !(0, _position.isEqual)(current.client.offset, newHomeOffset);

    if (!isAnimationRequired) {
      dispatch(completeDrop(result));
      return;
    }

    dispatch(animateDrop({
      trigger: 'DROP',
      newHomeOffset: newHomeOffset,
      impact: impact,
      result: result
    }));
  };
};

var cancel = exports.cancel = function cancel() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase !== 'DRAGGING') {
      dispatch(clean());
      return;
    }

    if (!state.drag) {
      console.error('invalid drag state', state);
      dispatch(clean());
      return;
    }

    var _state$drag2 = state.drag,
        initial = _state$drag2.initial,
        current = _state$drag2.current;

    var droppable = state.dimension.droppable[initial.source.droppableId];

    var result = {
      draggableId: current.id,
      type: current.type,
      source: initial.source,

      destination: null
    };

    var isAnimationRequired = !(0, _position.isEqual)(current.client.offset, origin);

    if (!isAnimationRequired) {
      dispatch(completeDrop(result));
      return;
    }

    var scrollDiff = getScrollDiff(initial, current, droppable);

    dispatch(animateDrop({
      trigger: 'CANCEL',
      newHomeOffset: (0, _position.add)(scrollDiff.droppable, scrollDiff.window),
      impact: _noImpact2.default,
      result: result
    }));
  };
};

var dropAnimationFinished = exports.dropAnimationFinished = function dropAnimationFinished() {
  return function (dispatch, getState) {
    var state = getState();

    if (state.phase !== 'DROP_ANIMATING') {
      console.error('cannot end drop that is no longer animating', state);
      dispatch(clean());
      return;
    }

    if (!state.drop || !state.drop.pending) {
      console.error('cannot end drop that has no pending state', state);
      dispatch(clean());
      return;
    }

    dispatch(completeDrop(state.drop.pending.result));
  };
};

var lift = exports.lift = function lift(id, type, client, page, windowScroll) {
  return function (dispatch, getState) {
    (function () {
      var state = getState();

      if (state.phase === 'DROP_ANIMATING') {
        if (!state.drop || !state.drop.pending) {
          console.error('cannot flush drop animation if there is no pending');
          dispatch(clean());
          return;
        }
        dispatch(completeDrop(state.drop.pending.result));
      }
    })();

    setTimeout(function () {
      var state = getState();

      if (state.phase !== 'IDLE' || state.phase !== 'DRAG_COMPLETE') {
        dispatch(clean());
      }

      dispatch(beginLift());
      dispatch(requestDimensions(type));

      setTimeout(function () {
        var newState = getState();

        if (newState.phase !== 'COLLECTING_DIMENSIONS') {
          return;
        }
        dispatch(completeLift(id, type, client, page, windowScroll));
      });
    });
  };
};