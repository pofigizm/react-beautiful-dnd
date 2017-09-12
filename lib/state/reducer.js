'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends5 = require('babel-runtime/helpers/extends');

var _extends6 = _interopRequireDefault(_extends5);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _position = require('./position');

var _getDragImpact = require('./get-drag-impact');

var _getDragImpact2 = _interopRequireDefault(_getDragImpact);

var _jumpToNextIndex = require('./jump-to-next-index');

var _jumpToNextIndex2 = _interopRequireDefault(_jumpToNextIndex);

var _getDroppableOver = require('./get-droppable-over');

var _getDroppableOver2 = _interopRequireDefault(_getDroppableOver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noDimensions = {
  request: null,
  draggable: {},
  droppable: {}
};

var origin = { x: 0, y: 0 };

var clean = (0, _memoizeOne2.default)(function (phase) {
  var state = {
    phase: phase || 'IDLE',
    drag: null,
    drop: null,
    dimension: noDimensions
  };

  return state;
});

var move = function move(_ref) {
  var state = _ref.state,
      clientSelection = _ref.clientSelection,
      pageSelection = _ref.pageSelection,
      _ref$shouldAnimate = _ref.shouldAnimate,
      shouldAnimate = _ref$shouldAnimate === undefined ? false : _ref$shouldAnimate,
      windowScroll = _ref.windowScroll,
      impact = _ref.impact;

  if (state.phase !== 'DRAGGING') {
    console.error('cannot move while not dragging');
    return clean();
  }

  if (state.drag == null) {
    console.error('cannot move if there is no drag information');
    return clean();
  }

  var previous = state.drag.current;
  var initial = state.drag.initial;
  var droppable = state.dimension.droppable[initial.source.droppableId];

  var client = function () {
    var offset = (0, _position.subtract)(clientSelection, initial.client.selection);
    var center = (0, _position.add)(offset, initial.client.center);

    var result = {
      selection: clientSelection,
      offset: offset,
      center: center
    };
    return result;
  }();

  var page = function () {
    var offset = (0, _position.subtract)(pageSelection, initial.page.selection);
    var center = (0, _position.add)(offset, initial.page.center);

    var result = {
      selection: pageSelection,
      offset: offset,
      center: center
    };
    return result;
  }();

  var scrollDiff = (0, _position.subtract)(droppable.scroll.initial, droppable.scroll.current);

  var withinDroppable = {
    center: (0, _position.add)(page.center, (0, _position.negate)(scrollDiff))
  };

  var currentWindowScroll = windowScroll || previous.windowScroll;

  var current = {
    id: previous.id,
    type: previous.type,
    client: client,
    page: page,
    withinDroppable: withinDroppable,
    shouldAnimate: shouldAnimate,
    windowScroll: currentWindowScroll
  };

  var newImpact = impact || (0, _getDragImpact2.default)({
    page: page.selection,
    withinDroppable: withinDroppable,
    draggableId: current.id,
    draggables: state.dimension.draggable,
    droppables: state.dimension.droppable
  });

  var drag = {
    initial: initial,
    impact: newImpact,
    current: current
  };

  return (0, _extends6.default)({}, state, {
    drag: drag
  });
};

exports.default = function () {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : clean('IDLE');
  var action = arguments[1];

  if (action.type === 'BEGIN_LIFT') {
    if (state.phase !== 'IDLE') {
      console.error('trying to start a lift while another is occurring');
      return state;
    }
    return clean('COLLECTING_DIMENSIONS');
  }

  if (action.type === 'REQUEST_DIMENSIONS') {
    if (state.phase !== 'COLLECTING_DIMENSIONS') {
      console.error('trying to collect dimensions at the wrong time');
      return state;
    }

    var typeId = action.payload;

    return {
      phase: 'COLLECTING_DIMENSIONS',
      drag: null,
      drop: null,
      dimension: {
        request: typeId,
        draggable: {},
        droppable: {}
      }
    };
  }

  if (action.type === 'PUBLISH_DRAGGABLE_DIMENSION') {
    var dimension = action.payload;

    if (state.phase !== 'COLLECTING_DIMENSIONS') {
      console.warn('dimension rejected as no longer requesting dimensions', dimension);
      return state;
    }

    if (state.dimension.draggable[dimension.id]) {
      console.error('dimension already exists for ' + dimension.id);
      return state;
    }

    return (0, _extends6.default)({}, state, {
      dimension: {
        request: state.dimension.request,
        droppable: state.dimension.droppable,
        draggable: (0, _extends6.default)({}, state.dimension.draggable, (0, _defineProperty3.default)({}, dimension.id, dimension))
      }
    });
  }

  if (action.type === 'PUBLISH_DROPPABLE_DIMENSION') {
    var _dimension = action.payload;

    if (state.phase !== 'COLLECTING_DIMENSIONS') {
      console.warn('dimension rejected as no longer requesting dimensions', _dimension);
      return state;
    }

    if (state.dimension.droppable[_dimension.id]) {
      console.error('dimension already exists for ' + _dimension.id);
      return state;
    }

    return (0, _extends6.default)({}, state, {
      dimension: {
        request: state.dimension.request,
        draggable: state.dimension.draggable,
        droppable: (0, _extends6.default)({}, state.dimension.droppable, (0, _defineProperty3.default)({}, _dimension.id, _dimension))
      }
    });
  }

  if (action.type === 'COMPLETE_LIFT') {
    if (state.phase !== 'COLLECTING_DIMENSIONS') {
      console.error('trying complete lift without collecting dimensions');
      return state;
    }

    var _action$payload = action.payload,
        id = _action$payload.id,
        type = _action$payload.type,
        client = _action$payload.client,
        page = _action$payload.page,
        _windowScroll = _action$payload.windowScroll;

    var withinDroppable = {
      center: page.center
    };

    var _impact = (0, _getDragImpact2.default)({
      page: page.selection,
      withinDroppable: withinDroppable,
      draggableId: id,
      draggables: state.dimension.draggable,
      droppables: state.dimension.droppable
    });

    var source = _impact.destination;

    if (!source) {
      console.error('lifting a draggable that is not inside a droppable');
      return clean();
    }

    var initial = {
      source: source,
      client: client,
      page: page,
      windowScroll: _windowScroll,
      withinDroppable: withinDroppable
    };

    var current = {
      id: id,
      type: type,
      client: {
        selection: client.selection,
        center: client.center,
        offset: origin
      },
      page: {
        selection: page.selection,
        center: page.center,
        offset: origin
      },
      withinDroppable: withinDroppable,
      windowScroll: _windowScroll,
      shouldAnimate: false
    };

    return (0, _extends6.default)({}, state, {
      phase: 'DRAGGING',
      drag: {
        initial: initial,
        current: current,
        impact: _impact
      }
    });
  }

  if (action.type === 'UPDATE_DROPPABLE_DIMENSION_SCROLL') {
    if (state.phase !== 'DRAGGING') {
      console.error('cannot update a droppable dimensions scroll when not dragging');
      return clean();
    }

    if (state.drag == null) {
      console.error('invalid store state');
      return clean();
    }

    var _action$payload2 = action.payload,
        _id = _action$payload2.id,
        offset = _action$payload2.offset;


    var target = state.dimension.droppable[_id];

    if (!target) {
      console.error('cannot update a droppable that is not inside of the state', _id);
      return clean();
    }

    var _dimension2 = (0, _extends6.default)({}, target, {
      scroll: {
        initial: target.scroll.initial,
        current: offset
      }
    });

    var withUpdatedDimension = (0, _extends6.default)({}, state, {
      dimension: {
        request: state.dimension.request,
        draggable: state.dimension.draggable,
        droppable: (0, _extends6.default)({}, state.dimension.droppable, (0, _defineProperty3.default)({}, _id, _dimension2))
      }
    });

    var _state$drag$current = state.drag.current,
        _client = _state$drag$current.client,
        _page = _state$drag$current.page;


    return move({
      state: withUpdatedDimension,
      clientSelection: _client.selection,
      pageSelection: _page.selection
    });
  }

  if (action.type === 'MOVE') {
    var _action$payload3 = action.payload,
        _client2 = _action$payload3.client,
        _page2 = _action$payload3.page,
        _windowScroll2 = _action$payload3.windowScroll;

    return move({
      state: state,
      clientSelection: _client2,
      pageSelection: _page2,
      windowScroll: _windowScroll2
    });
  }

  if (action.type === 'MOVE_BY_WINDOW_SCROLL') {
    var _windowScroll3 = action.payload.windowScroll;


    if (!state.drag) {
      console.error('cannot move with window scrolling if no current drag');
      return clean();
    }

    var _initial = state.drag.initial;
    var _current = state.drag.current;
    var _client3 = _current.client.selection;

    var previousDiff = (0, _position.subtract)(_current.windowScroll, _initial.windowScroll);

    var currentDiff = (0, _position.subtract)(_windowScroll3, _initial.windowScroll);

    var diff = (0, _position.subtract)(currentDiff, previousDiff);

    var _page3 = (0, _position.add)(_current.page.selection, diff);

    return move({
      state: state,
      clientSelection: _client3,
      pageSelection: _page3,
      windowScroll: _windowScroll3
    });
  }

  if (action.type === 'MOVE_FORWARD' || action.type === 'MOVE_BACKWARD') {
    if (state.phase !== 'DRAGGING') {
      console.error('cannot move while not dragging', action);
      return clean();
    }

    if (!state.drag) {
      console.error('cannot move if there is no drag information');
      return clean();
    }

    var existing = state.drag;
    var isMovingForward = action.type === 'MOVE_FORWARD';

    var result = (0, _jumpToNextIndex2.default)({
      isMovingForward: isMovingForward,
      draggableId: existing.current.id,
      impact: existing.impact,
      draggables: state.dimension.draggable,
      droppables: state.dimension.droppable
    });

    if (!result) {
      return state;
    }

    var _diff = result.diff;
    var _impact2 = result.impact;

    var _page4 = (0, _position.add)(existing.current.page.selection, _diff);
    var _client4 = (0, _position.add)(existing.current.client.selection, _diff);

    var droppableId = (0, _getDroppableOver2.default)(_page4, state.dimension.droppable);

    if (!droppableId) {
      console.info('currently not supporting moving a draggable outside the visibility bounds of a droppable');
      return state;
    }

    return move({
      state: state,
      impact: _impact2,
      clientSelection: _client4,
      pageSelection: _page4,
      shouldAnimate: true
    });
  }

  if (action.type === 'DROP_ANIMATE') {
    var _action$payload4 = action.payload,
        trigger = _action$payload4.trigger,
        newHomeOffset = _action$payload4.newHomeOffset,
        _impact3 = _action$payload4.impact,
        _result = _action$payload4.result;


    if (state.phase !== 'DRAGGING') {
      console.error('cannot animate drop while not dragging', action);
      return state;
    }

    if (!state.drag) {
      console.error('cannot animate drop - invalid drag state');
      return clean();
    }

    var pending = {
      trigger: trigger,
      newHomeOffset: newHomeOffset,
      result: _result,
      impact: _impact3
    };

    return {
      phase: 'DROP_ANIMATING',
      drag: null,
      drop: {
        pending: pending,
        result: null
      },
      dimension: state.dimension
    };
  }

  if (action.type === 'DROP_COMPLETE') {
    var _result2 = action.payload;

    return {
      phase: 'DROP_COMPLETE',
      drag: null,
      drop: {
        pending: null,
        result: _result2
      },
      dimension: noDimensions
    };
  }

  if (action.type === 'CLEAN') {
    return clean();
  }

  return state;
};