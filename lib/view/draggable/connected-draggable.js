'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSelector = undefined;

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _reactRedux = require('react-redux');

var _reselect = require('reselect');

var _selectors = require('../../state/selectors');

var _draggable = require('./draggable');

var _draggable2 = _interopRequireDefault(_draggable);

var _contextKeys = require('../context-keys');

var _position = require('../../state/position');

var _actionCreators = require('../../state/action-creators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = { x: 0, y: 0 };

var defaultMapProps = {
  isDropAnimating: false,
  isDragging: false,
  canLift: true,

  canAnimate: false,
  offset: origin,

  dimension: null,
  direction: null
};

var makeSelector = exports.makeSelector = function makeSelector() {
  var idSelector = function idSelector(state, ownProps) {
    return ownProps.draggableId;
  };
  var typeSelector = function typeSelector(state, ownProps) {
    return ownProps.type || 'DEFAULT';
  };

  var memoizedOffset = (0, _memoizeOne2.default)(function (x, y) {
    return {
      x: x, y: y
    };
  });

  var getWithMovement = (0, _memoizeOne2.default)(function (offset, canLift) {
    return {
      isDropAnimating: false,
      isDragging: false,
      canAnimate: true,
      canLift: canLift,
      offset: offset,
      dimension: null,
      direction: null
    };
  });

  var getNotDraggingProps = (0, _memoizeOne2.default)(function (draggableId, movement, canLift) {
    var needsToMove = movement.draggables.indexOf(draggableId) !== -1;

    if (!needsToMove) {
      return getWithMovement(origin, canLift);
    }

    var amount = movement.isBeyondStartPosition ? (0, _position.negate)(movement.amount) : movement.amount;

    return getWithMovement(memoizedOffset(amount.x, amount.y), canLift);
  });

  var draggableSelector = function draggableSelector(state, ownProps) {
    if (!state.dimension) {
      return null;
    }
    var dimension = state.dimension.draggable[ownProps.draggableId];

    if (!dimension) {
      return null;
    }

    return dimension;
  };

  return (0, _reselect.createSelector)([idSelector, typeSelector, _selectors.phaseSelector, _selectors.dragSelector, _selectors.pendingDropSelector, draggableSelector], function (id, type, phase, drag, pending, dimension) {
    if (phase === 'DRAGGING') {
      if (!drag) {
        console.error('invalid dragging state');
        return defaultMapProps;
      }

      var current = drag.current,
          impact = drag.impact;


      if (current.type !== type) {
        return defaultMapProps;
      }

      if (current.id !== id) {
        return getNotDraggingProps(id, impact.movement, false);
      }

      var offset = current.client.offset;
      var canAnimate = current.shouldAnimate;

      return {
        isDragging: true,
        canLift: false,
        isDropAnimating: false,
        canAnimate: canAnimate,
        offset: offset,
        dimension: dimension,
        direction: impact.direction
      };
    }

    if (phase === 'DROP_ANIMATING') {
      if (!pending) {
        console.error('cannot animate drop without a pending drop');
        return defaultMapProps;
      }

      if (type !== pending.result.type) {
        return defaultMapProps;
      }

      if (pending.result.draggableId !== id) {
        var canLift = pending.trigger === 'DROP';

        return getNotDraggingProps(id, pending.impact.movement, canLift);
      }

      return {
        isDragging: false,
        isDropAnimating: true,
        canAnimate: true,
        offset: pending.newHomeOffset,

        canLift: false,

        dimension: dimension,

        direction: null
      };
    }

    return defaultMapProps;
  });
};

var makeMapStateToProps = function makeMapStateToProps() {
  var selector = makeSelector();
  return function (state, props) {
    return selector(state, props);
  };
};

var mapDispatchToProps = {
  lift: _actionCreators.lift,
  move: _actionCreators.move,
  moveBackward: _actionCreators.moveBackward,
  moveForward: _actionCreators.moveForward,
  moveByWindowScroll: _actionCreators.moveByWindowScroll,
  drop: _actionCreators.drop,
  dropAnimationFinished: _actionCreators.dropAnimationFinished,
  cancel: _actionCreators.cancel
};

exports.default = (0, _reactRedux.connect)(makeMapStateToProps, mapDispatchToProps, null, { storeKey: _contextKeys.storeKey })(_draggable2.default);