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

var _getWindowScrollPosition = require('../get-window-scroll-position');

var _getWindowScrollPosition2 = _interopRequireDefault(_getWindowScrollPosition);

var _dimension = require('../../state/dimension');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DraggableDimensionPublisher = function (_Component) {
  (0, _inherits3.default)(DraggableDimensionPublisher, _Component);

  function DraggableDimensionPublisher() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DraggableDimensionPublisher);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DraggableDimensionPublisher.__proto__ || (0, _getPrototypeOf2.default)(DraggableDimensionPublisher)).call.apply(_ref, [this].concat(args))), _this), _this.getDimension = function () {
      var _this$props = _this.props,
          draggableId = _this$props.draggableId,
          droppableId = _this$props.droppableId,
          targetRef = _this$props.targetRef;


      (0, _invariant2.default)(targetRef, 'DraggableDimensionPublisher cannot calculate a dimension when not attached to the DOM');

      var style = window.getComputedStyle(targetRef);

      var margin = {
        top: parseInt(style.marginTop, 10),
        right: parseInt(style.marginRight, 10),
        bottom: parseInt(style.marginBottom, 10),
        left: parseInt(style.marginLeft, 10)
      };

      var dimension = (0, _dimension.getDraggableDimension)({
        id: draggableId,
        droppableId: droppableId,
        clientRect: targetRef.getBoundingClientRect(),
        margin: margin,
        windowScroll: (0, _getWindowScrollPosition2.default)()
      });

      return dimension;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DraggableDimensionPublisher, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var shouldPublish = !this.props.shouldPublish && nextProps.shouldPublish;

      if (shouldPublish) {
        this.props.publish(this.getDimension());
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);
  return DraggableDimensionPublisher;
}(_react.Component);

exports.default = DraggableDimensionPublisher;