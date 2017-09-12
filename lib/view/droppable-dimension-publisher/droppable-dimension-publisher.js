'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _rafSchd = require('raf-schd');

var _rafSchd2 = _interopRequireDefault(_rafSchd);

var _memoizeOne = require('memoize-one');

var _memoizeOne2 = _interopRequireDefault(_memoizeOne);

var _getWindowScrollPosition = require('../get-window-scroll-position');

var _getWindowScrollPosition2 = _interopRequireDefault(_getWindowScrollPosition);

var _dimension = require('../../state/dimension');

var _getClosestScrollable = require('../get-closest-scrollable');

var _getClosestScrollable2 = _interopRequireDefault(_getClosestScrollable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var origin = { x: 0, y: 0 };

var DroppableDimensionPublisher = function (_Component) {
  (0, _inherits3.default)(DroppableDimensionPublisher, _Component);

  function DroppableDimensionPublisher() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DroppableDimensionPublisher);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DroppableDimensionPublisher.__proto__ || (0, _getPrototypeOf2.default)(DroppableDimensionPublisher)).call.apply(_ref, [this].concat(args))), _this), _this.isWatchingScroll = false, _this.closestScrollable = null, _this.getScrollOffset = function () {
      if (!_this.closestScrollable) {
        return origin;
      }

      var offset = {
        x: _this.closestScrollable.scrollLeft,
        y: _this.closestScrollable.scrollTop
      };

      return offset;
    }, _this.getDimension = function () {
      var _this$props = _this.props,
          droppableId = _this$props.droppableId,
          direction = _this$props.direction,
          targetRef = _this$props.targetRef;

      (0, _invariant2.default)(targetRef, 'DimensionPublisher cannot calculate a dimension when not attached to the DOM');

      var style = window.getComputedStyle(targetRef);

      var margin = {
        top: parseInt(style.marginTop, 10),
        right: parseInt(style.marginRight, 10),
        bottom: parseInt(style.marginBottom, 10),
        left: parseInt(style.marginLeft, 10)
      };

      var dimension = (0, _dimension.getDroppableDimension)({
        id: droppableId,
        direction: direction,
        clientRect: targetRef.getBoundingClientRect(),
        margin: margin,
        windowScroll: (0, _getWindowScrollPosition2.default)(),
        scroll: _this.getScrollOffset()
      });

      return dimension;
    }, _this.memoizedUpdateScroll = (0, _memoizeOne2.default)(function (x, y) {
      var offset = { x: x, y: y };
      _this.props.updateScroll(_this.props.droppableId, offset);
    }), _this.scheduleScrollUpdate = (0, _rafSchd2.default)(function (offset) {
      if (_this.isWatchingScroll) {
        _this.memoizedUpdateScroll(offset.x, offset.y);
      }
    }), _this.onClosestScroll = function () {
      _this.scheduleScrollUpdate(_this.getScrollOffset());
    }, _this.watchScroll = function () {
      (0, _invariant2.default)(_this.props.targetRef, 'cannot watch scroll if not in the dom');

      if (_this.closestScrollable == null) {
        return;
      }

      if (_this.isWatchingScroll) {
        return;
      }

      _this.isWatchingScroll = true;
      _this.closestScrollable.addEventListener('scroll', _this.onClosestScroll, { passive: true });
    }, _this.unwatchScroll = function () {
      if (!_this.isWatchingScroll) {
        return;
      }

      _this.isWatchingScroll = false;
      _this.closestScrollable.removeEventListener('scroll', _this.onClosestScroll);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DroppableDimensionPublisher, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.isWatchingScroll) {
        this.unwatchScroll();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.targetRef !== this.props.targetRef) {
        if (this.isWatchingScroll) {
          console.warn('changing targetRef while watching scroll!');
          this.unwatchScroll();
        }
      }

      var shouldPublish = !this.props.shouldPublish && nextProps.shouldPublish;

      if (!nextProps.shouldPublish) {
        this.unwatchScroll();
        return;
      }

      if (!shouldPublish) {
        return;
      }

      this.closestScrollable = (0, _getClosestScrollable2.default)(this.props.targetRef);
      this.props.publish(this.getDimension());
      this.watchScroll();
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);
  return DroppableDimensionPublisher;
}(_react.Component);

exports.default = DroppableDimensionPublisher;