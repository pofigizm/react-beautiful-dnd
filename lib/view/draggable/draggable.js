'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zIndexOptions = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _draggableDimensionPublisher = require('../draggable-dimension-publisher/');

var _draggableDimensionPublisher2 = _interopRequireDefault(_draggableDimensionPublisher);

var _moveable = require('../moveable/');

var _moveable2 = _interopRequireDefault(_moveable);

var _dragHandle = require('../drag-handle');

var _dragHandle2 = _interopRequireDefault(_dragHandle);

var _animation = require('../animation');

var _getWindowScrollPosition = require('../get-window-scroll-position');

var _getWindowScrollPosition2 = _interopRequireDefault(_getWindowScrollPosition);

var _getCenterPosition = require('../get-center-position');

var _getCenterPosition2 = _interopRequireDefault(_getCenterPosition);

var _placeholder = require('./placeholder');

var _placeholder2 = _interopRequireDefault(_placeholder);

var _contextKeys = require('../context-keys');

var _position = require('../../state/position');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zIndexOptions = exports.zIndexOptions = {
  dragging: 5000,
  dropAnimating: 4500
};

var Draggable = function (_Component) {
  (0, _inherits3.default)(Draggable, _Component);

  function Draggable(props, context) {
    (0, _classCallCheck3.default)(this, Draggable);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Draggable.__proto__ || (0, _getPrototypeOf2.default)(Draggable)).call(this, props, context));

    _this.state = {
      ref: null
    };

    _this.onMoveEnd = function () {
      if (!_this.props.isDropAnimating) {
        return;
      }

      _this.props.dropAnimationFinished(_this.props.draggableId);
    };

    _this.onLift = function (point) {
      _this.throwIfCannotDrag();
      var _this$props = _this.props,
          lift = _this$props.lift,
          draggableId = _this$props.draggableId,
          type = _this$props.type;
      var ref = _this.state.ref;


      var windowScroll = (0, _getWindowScrollPosition2.default)();

      var client = {
        selection: point,
        center: (0, _getCenterPosition2.default)(ref)
      };

      var page = {
        selection: (0, _position.add)(client.selection, windowScroll),
        center: (0, _position.add)(client.center, windowScroll)
      };

      lift(draggableId, type, client, page, windowScroll);
    };

    _this.onKeyLift = function () {
      _this.throwIfCannotDrag();
      var _this$props2 = _this.props,
          lift = _this$props2.lift,
          draggableId = _this$props2.draggableId,
          type = _this$props2.type;
      var ref = _this.state.ref;

      var center = (0, _getCenterPosition2.default)(ref);

      var client = {
        selection: center,
        center: center
      };

      var windowScroll = (0, _getWindowScrollPosition2.default)();
      var page = {
        selection: (0, _position.add)(center, windowScroll),
        center: (0, _position.add)(center, windowScroll)
      };

      lift(draggableId, type, client, page, windowScroll);
    };

    _this.onMove = function (client) {
      _this.throwIfCannotDrag();

      var _this$props3 = _this.props,
          draggableId = _this$props3.draggableId,
          dimension = _this$props3.dimension,
          move = _this$props3.move;

      if (!dimension) {
        return;
      }

      var windowScroll = (0, _getWindowScrollPosition2.default)();
      var page = (0, _position.add)(client, windowScroll);

      move(draggableId, client, page, windowScroll);
    };

    _this.onMoveForward = function () {
      _this.throwIfCannotDrag();
      _this.props.moveForward(_this.props.draggableId);
    };

    _this.onMoveBackward = function () {
      _this.throwIfCannotDrag();
      _this.props.moveBackward(_this.props.draggableId);
    };

    _this.onWindowScroll = function () {
      _this.throwIfCannotDrag();
      var windowScroll = (0, _getWindowScrollPosition2.default)();
      _this.props.moveByWindowScroll(_this.props.draggableId, windowScroll);
    };

    _this.onDrop = function () {
      _this.throwIfCannotDrag();
      _this.props.drop();
    };

    _this.onCancel = function () {
      _this.props.cancel();
    };

    _this.setRef = function (ref) {
      if (ref === null) {
        return;
      }

      if (ref === _this.state.ref) {
        return;
      }

      _this.setState({
        ref: ref
      });
    };

    _this.getDraggingStyle = (0, _memoizeOne2.default)(function (width, height, top, left, isDropAnimating, movementStyle) {
      var style = {
        position: 'fixed',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: isDropAnimating ? zIndexOptions.dropAnimating : zIndexOptions.dragging,
        width: width,
        height: height,
        top: top,
        left: left,
        margin: 0,
        transform: movementStyle.transform ? '' + movementStyle.transform : null
      };
      return style;
    });
    _this.getNotDraggingStyle = (0, _memoizeOne2.default)(function (canAnimate, movementStyle, canLift) {
      var style = {
        transition: canAnimate ? _animation.css.outOfTheWay : null,
        transform: movementStyle.transform,
        pointerEvents: canLift ? 'auto' : 'none'
      };
      return style;
    });
    _this.getProvided = (0, _memoizeOne2.default)(function (isDragging, isDropAnimating, canLift, canAnimate, dimension, dragHandleProps, movementStyle) {
      var useDraggingStyle = isDragging || isDropAnimating;

      var draggableStyle = function () {
        if (!useDraggingStyle) {
          return _this.getNotDraggingStyle(canAnimate, movementStyle, canLift);
        }
        (0, _invariant2.default)(dimension, 'draggable dimension required for dragging');

        var _dimension$client$wit = dimension.client.withoutMargin,
            width = _dimension$client$wit.width,
            height = _dimension$client$wit.height,
            top = _dimension$client$wit.top,
            left = _dimension$client$wit.left;


        return _this.getDraggingStyle(width, height, top, left, isDropAnimating, movementStyle);
      }();

      var provided = {
        innerRef: _this.setRef,
        placeholder: useDraggingStyle ? _this.getPlaceholder() : null,
        dragHandleProps: dragHandleProps,
        draggableStyle: draggableStyle
      };
      return provided;
    });
    _this.getSnapshot = (0, _memoizeOne2.default)(function (isDragging, isDropAnimating) {
      return {
        isDragging: isDragging || isDropAnimating
      };
    });
    _this.getSpeed = (0, _memoizeOne2.default)(function (isDragging, isDropAnimating, canAnimate) {
      if (!canAnimate) {
        return 'INSTANT';
      }

      if (isDropAnimating) {
        return 'STANDARD';
      }

      if (isDragging) {
        return 'FAST';
      }

      return 'INSTANT';
    });


    _this.callbacks = {
      onLift: _this.onLift,
      onMove: _this.onMove,
      onDrop: _this.onDrop,
      onCancel: _this.onCancel,
      onKeyLift: _this.onKeyLift,
      onMoveBackward: _this.onMoveBackward,
      onMoveForward: _this.onMoveForward,
      onWindowScroll: _this.onWindowScroll
    };
    return _this;
  }

  (0, _createClass3.default)(Draggable, [{
    key: 'throwIfCannotDrag',
    value: function throwIfCannotDrag() {
      (0, _invariant2.default)(this.state.ref, 'Draggable: cannot drag as no DOM node has been provided');
      (0, _invariant2.default)(!this.props.isDragDisabled, 'Draggable: cannot drag as dragging is not enabled');
    }
  }, {
    key: 'getPlaceholder',
    value: function getPlaceholder() {
      var dimension = this.props.dimension;
      (0, _invariant2.default)(dimension, 'cannot get a drag placeholder when not dragging');

      return _react2.default.createElement(_placeholder2.default, {
        height: dimension.page.withMargin.height,
        width: dimension.page.withMargin.width
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          draggableId = _props.draggableId,
          type = _props.type,
          offset = _props.offset,
          isDragging = _props.isDragging,
          isDropAnimating = _props.isDropAnimating,
          canLift = _props.canLift,
          canAnimate = _props.canAnimate,
          isDragDisabled = _props.isDragDisabled,
          dimension = _props.dimension,
          children = _props.children,
          direction = _props.direction;


      var speed = this.getSpeed(isDragging, isDropAnimating, canAnimate);

      return _react2.default.createElement(
        _draggableDimensionPublisher2.default,
        {
          draggableId: draggableId,
          droppableId: this.context[_contextKeys.droppableIdKey],
          type: type,
          targetRef: this.state.ref
        },
        _react2.default.createElement(
          _moveable2.default,
          {
            speed: speed,
            destination: offset,
            onMoveEnd: this.onMoveEnd
          },
          function (movementStyle) {
            return _react2.default.createElement(
              _dragHandle2.default,
              {
                isDragging: isDragging,
                direction: direction,
                isEnabled: !isDragDisabled,
                canLift: canLift,
                callbacks: _this2.callbacks,
                draggableRef: _this2.state.ref
              },
              function (dragHandleProps) {
                return children(_this2.getProvided(isDragging, isDropAnimating, canLift, canAnimate, dimension, dragHandleProps, movementStyle), _this2.getSnapshot(isDragging, isDropAnimating));
              }
            );
          }
        )
      );
    }
  }]);
  return Draggable;
}(_react.Component);

Draggable.defaultProps = {
  isDragDisabled: false,
  type: 'DEFAULT'
};
Draggable.contextTypes = (0, _defineProperty3.default)({}, _contextKeys.droppableIdKey, _propTypes2.default.string.isRequired);
exports.default = Draggable;