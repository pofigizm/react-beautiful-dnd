'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getFireHooks = function getFireHooks(hooks) {
  return (0, _memoizeOne2.default)(function (current, previous) {
    var onDragStart = hooks.onDragStart,
        onDragEnd = hooks.onDragEnd;


    var currentPhase = current.phase;
    var previousPhase = previous.phase;

    if (currentPhase === 'DRAGGING' && previousPhase !== 'DRAGGING') {
      if (!onDragStart) {
        return;
      }

      if (!current.drag) {
        console.error('cannot fire onDragStart hook without drag state', { current: current, previous: previous });
        return;
      }

      var start = {
        draggableId: current.drag.current.id,
        type: current.drag.current.type,
        source: current.drag.initial.source
      };

      onDragStart(start);
      return;
    }

    if (currentPhase === 'DROP_COMPLETE' && previousPhase !== 'DROP_COMPLETE') {
      if (!current.drop || !current.drop.result) {
        console.error('cannot fire onDragEnd hook without drag state', { current: current, previous: previous });
        return;
      }

      var _current$drop$result = current.drop.result,
          source = _current$drop$result.source,
          destination = _current$drop$result.destination,
          draggableId = _current$drop$result.draggableId,
          type = _current$drop$result.type;

      if (!destination) {
        onDragEnd(current.drop.result);
        return;
      }

      var didMove = source.droppableId !== destination.droppableId || source.index !== destination.index;

      if (didMove) {
        onDragEnd(current.drop.result);
        return;
      }

      var muted = {
        draggableId: draggableId,
        type: type,
        source: source,
        destination: null
      };

      onDragEnd(muted);
    }

    if (currentPhase === 'IDLE' && previousPhase === 'DRAGGING') {
      if (!previous.drag) {
        console.error('cannot fire onDragEnd for cancel because cannot find previous drag');
        return;
      }
      var result = {
        draggableId: previous.drag.current.id,
        type: previous.drag.current.type,
        source: previous.drag.initial.source,
        destination: null
      };
      onDragEnd(result);
    }

    if (currentPhase === 'IDLE' && previousPhase === 'DROP_ANIMATING') {
      if (!previous.drop || !previous.drop.pending) {
        console.error('cannot fire onDragEnd for cancel because cannot find previous pending drop');
        return;
      }

      var _result = {
        draggableId: previous.drop.pending.result.draggableId,
        type: previous.drop.pending.result.type,
        source: previous.drop.pending.result.source,
        destination: null
      };
      onDragEnd(_result);
    }
  });
};

exports.default = function (hooks) {
  var fireHooks = getFireHooks(hooks);
  return function (store) {
    return function (next) {
      return function (action) {
        var previous = store.getState();

        var result = next(action);

        var current = store.getState();

        fireHooks(current, previous);

        return result;
      };
    };
  };
};