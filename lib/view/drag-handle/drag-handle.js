'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sloppyClickThreshold = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _rafSchd = require('raf-schd');

var _rafSchd2 = _interopRequireDefault(_rafSchd);

var _keyCodes = require('../key-codes');

var keyCodes = _interopRequireWildcard(_keyCodes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {};
var getFalse = function getFalse() {
  return false;
};

var primaryButton = 0;

var sloppyClickThreshold = exports.sloppyClickThreshold = 5;

var DragHandle = function (_Component) {
  (0, _inherits3.default)(DragHandle, _Component);

  function DragHandle() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DragHandle);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DragHandle.__proto__ || (0, _getPrototypeOf2.default)(DragHandle)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      draggingWith: null,
      pending: null
    }, _this.ifDragging = function (fn) {
      if (_this.state.draggingWith) {
        fn();
      }
    }, _this.memoizedMove = (0, _memoizeOne2.default)(function (x, y) {
      var point = { x: x, y: y };
      _this.props.callbacks.onMove(point);
    }), _this.scheduleMove = (0, _rafSchd2.default)(function (point) {
      _this.ifDragging(function () {
        return _this.memoizedMove(point.x, point.y);
      });
    }), _this.scheduleMoveForward = (0, _rafSchd2.default)(function () {
      _this.ifDragging(_this.props.callbacks.onMoveForward);
    }), _this.scheduleMoveBackward = (0, _rafSchd2.default)(function () {
      _this.ifDragging(_this.props.callbacks.onMoveBackward);
    }), _this.scheduleWindowScrollMove = (0, _rafSchd2.default)(function () {
      _this.ifDragging(_this.props.callbacks.onWindowScroll);
    }), _this.onWindowResize = function () {
      if (_this.state.pending) {
        _this.stopPendingMouseDrag();
        return;
      }

      if (!_this.state.draggingWith) {
        return;
      }

      _this.stopDragging(function () {
        return _this.props.callbacks.onCancel();
      });
    }, _this.onWindowScroll = function () {
      var draggingWith = _this.state.draggingWith;


      if (!draggingWith) {
        return;
      }

      if (draggingWith === 'MOUSE') {
        _this.scheduleWindowScrollMove();
        return;
      }

      if (draggingWith === 'KEYBOARD') {
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
      }
    }, _this.onWindowMouseMove = function (event) {
      var _this$state = _this.state,
          draggingWith = _this$state.draggingWith,
          pending = _this$state.pending;

      if (draggingWith === 'KEYBOARD') {
        return;
      }

      var button = event.button,
          clientX = event.clientX,
          clientY = event.clientY;

      if (button !== primaryButton) {
        return;
      }

      var point = {
        x: clientX,
        y: clientY
      };

      if (!pending) {
        _this.scheduleMove(point);
        return;
      }

      var shouldStartDrag = Math.abs(pending.x - point.x) >= sloppyClickThreshold || Math.abs(pending.y - point.y) >= sloppyClickThreshold;

      if (shouldStartDrag) {
        _this.startDragging('MOUSE', function () {
          return _this.props.callbacks.onLift(point);
        });
      }
    }, _this.onWindowMouseUp = function () {
      if (_this.state.pending) {
        _this.stopPendingMouseDrag();
        return;
      }

      if (!_this.state.draggingWith) {
        console.error('should not be listening to mouse up events when nothing is dragging');
        return;
      }

      if (_this.state.draggingWith !== 'MOUSE') {
        return;
      }

      _this.stopDragging(function () {
        return _this.props.callbacks.onDrop();
      });
    }, _this.onWindowMouseDown = function () {
      _this.stopDragging(function () {
        return _this.props.callbacks.onCancel();
      });
    }, _this.onMouseDown = function (event) {
      if (_this.state.draggingWith === 'KEYBOARD') {
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
        return;
      }

      if (!_this.props.canLift) {
        return;
      }

      var button = event.button,
          clientX = event.clientX,
          clientY = event.clientY;


      if (button !== primaryButton) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      var point = {
        x: clientX,
        y: clientY
      };

      _this.startPendingMouseDrag(point);
    }, _this.onWindowKeydown = function (event) {
      var isMouseDragPending = Boolean(_this.state.pending);

      if (isMouseDragPending) {
        if (event.keyCode === keyCodes.escape) {
          event.preventDefault();
          _this.stopPendingMouseDrag();
        }
        return;
      }

      if (!_this.state.draggingWith) {
        console.error('should not be listening to window mouse up if nothing is dragging');
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
        return;
      }

      if (event.keyCode === keyCodes.enter) {
        event.preventDefault();
        return;
      }

      if (event.keyCode === keyCodes.tab) {
        event.preventDefault();
        return;
      }

      if (event.keyCode === keyCodes.escape) {
        event.preventDefault();
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
        return;
      }

      if (_this.state.draggingWith === 'MOUSE') {
        if (event.keyCode === keyCodes.space) {
          event.preventDefault();
        }
        return;
      }

      if (!_this.props.direction) {
        console.error('cannot handle keyboard event if direction is not provided');
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
        return;
      }

      if (event.keyCode === keyCodes.space) {
        event.preventDefault();
        _this.stopDragging(function () {
          return _this.props.callbacks.onDrop();
        });
        return;
      }

      if (_this.props.direction === 'vertical') {
        if (event.keyCode === keyCodes.arrowDown) {
          event.preventDefault();
          _this.scheduleMoveForward();
        }

        if (event.keyCode === keyCodes.arrowUp) {
          event.preventDefault();
          _this.scheduleMoveBackward();
        }

        return;
      }

      if (event.keyCode === keyCodes.arrowRight) {
        event.preventDefault();
        _this.scheduleMoveForward();
        return;
      }

      if (event.keyCode === keyCodes.arrowLeft) {
        event.preventDefault();
        _this.scheduleMoveBackward();
      }
    }, _this.onKeyDown = function (event) {
      if (!_this.props.isEnabled || _this.state.pending || _this.state.draggingWith || !_this.props.canLift) {
        return;
      }

      if (event.keyCode === keyCodes.space) {
        event.preventDefault();

        event.stopPropagation();
        _this.startDragging('KEYBOARD', function () {
          return _this.props.callbacks.onKeyLift();
        });
      }
    }, _this.onClick = function (event) {
      if (!_this.preventClick) {
        return;
      }
      _this.preventClick = false;
      event.preventDefault();
    }, _this.startPendingMouseDrag = function (point) {
      if (_this.state.draggingWith) {
        console.error('cannot start a pending mouse drag when already dragging');
        return;
      }

      if (_this.state.pending) {
        console.error('cannot start a pending mouse drag when there is already a pending position');
        return;
      }

      _this.bindWindowEvents();

      var state = {
        draggingWith: null,
        pending: point
      };

      _this.setState(state);
    }, _this.startDragging = function (type) {
      var done = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

      if (_this.state.draggingWith) {
        console.error('cannot start dragging when already dragging');
        return;
      }

      if (type === 'MOUSE' && !_this.state.pending) {
        console.error('cannot start mouse drag when there is not a pending position');
        return;
      }

      if (type === 'KEYBOARD') {
        _this.bindWindowEvents();
      }

      var state = {
        draggingWith: type,
        pending: null
      };
      _this.setState(state, done);
    }, _this.stopPendingMouseDrag = function () {
      var done = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

      (0, _invariant2.default)(_this.state.pending, 'cannot stop pending drag when there is none');

      _this.preventClick = false;

      _this.unbindWindowEvents();
      _this.setState({
        draggingWith: null,
        pending: null
      }, done);
    }, _this.stopDragging = function () {
      var done = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

      if (!_this.state.draggingWith) {
        console.error('cannot stop dragging when not dragging');
        return;
      }

      _this.unbindWindowEvents();

      if (_this.state.draggingWith === 'MOUSE') {
        _this.preventClick = true;
      }

      var state = {
        draggingWith: null,
        pending: null
      };
      _this.setState(state, done);
    }, _this.mouseForceChanged = function (event) {
      if (event.webkitForce == null || MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN == null) {
        console.error('handling a mouse force changed event when it is not supported');
        return;
      }

      var forcePressThreshold = MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN;

      if (event.webkitForce < forcePressThreshold) {
        return;
      }

      if (_this.state.pending) {
        _this.stopPendingMouseDrag();
        return;
      }

      if (_this.state.draggingWith) {
        _this.stopDragging(function () {
          return _this.props.callbacks.onCancel();
        });
      }
    }, _this.unbindWindowEvents = function () {
      window.removeEventListener('mousemove', _this.onWindowMouseMove);
      window.removeEventListener('mouseup', _this.onWindowMouseUp);
      window.removeEventListener('mousedown', _this.onWindowMouseDown);
      window.removeEventListener('keydown', _this.onWindowKeydown);
      window.removeEventListener('resize', _this.onWindowResize);
      window.removeEventListener('scroll', _this.onWindowScroll);
      window.removeEventListener('webkitmouseforcechanged', _this.mouseForceChanged);
    }, _this.bindWindowEvents = function () {
      window.addEventListener('mousemove', _this.onWindowMouseMove);
      window.addEventListener('mouseup', _this.onWindowMouseUp);
      window.addEventListener('mousedown', _this.onWindowMouseDown);
      window.addEventListener('keydown', _this.onWindowKeydown);
      window.addEventListener('resize', _this.onWindowResize);
      window.addEventListener('scroll', _this.onWindowScroll, { passive: true });
      window.addEventListener('webkitmouseforcechanged', _this.mouseForceChanged);
    }, _this.getProvided = (0, _memoizeOne2.default)(function (isEnabled, isDragging) {
      if (!isEnabled) {
        return null;
      }

      var provided = {
        onMouseDown: _this.onMouseDown,
        onKeyDown: _this.onKeyDown,
        onClick: _this.onClick,
        tabIndex: 0,
        'aria-grabbed': isDragging,
        draggable: false,
        onDragStart: getFalse,
        onDrop: getFalse
      };

      return provided;
    }), _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DragHandle, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (!this.state.draggingWith) {
        return;
      }
      this.preventClick = false;
      this.unbindWindowEvents();
      this.props.callbacks.onCancel();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      var isDragStopping = this.props.isDragging && !nextProps.isDragging;
      if (isDragStopping && this.state.draggingWith) {
        this.stopDragging();
        return;
      }

      if (nextProps.isEnabled) {
        return;
      }

      if (this.state.pending) {
        this.stopPendingMouseDrag();
        return;
      }

      if (this.state.draggingWith) {
        this.stopDragging(function () {
          return _this2.props.callbacks.onCancel();
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          isEnabled = _props.isEnabled;
      var draggingWith = this.state.draggingWith;

      var isDragging = Boolean(draggingWith);

      return children(this.getProvided(isEnabled, isDragging));
    }
  }]);
  return DragHandle;
}(_react.Component);

exports.default = DragHandle;