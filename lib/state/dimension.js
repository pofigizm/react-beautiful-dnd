'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDroppableDimension = exports.getDraggableDimension = exports.noMargin = undefined;

var _axis = require('./axis');

var origin = { x: 0, y: 0 };

var noMargin = exports.noMargin = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

var getWithPosition = function getWithPosition(clientRect, point) {
  var top = clientRect.top,
      right = clientRect.right,
      bottom = clientRect.bottom,
      left = clientRect.left,
      width = clientRect.width,
      height = clientRect.height;

  return {
    top: top + point.y,
    left: left + point.x,
    bottom: bottom + point.y,
    right: right + point.x,
    height: height,
    width: width
  };
};

var getWithMargin = function getWithMargin(clientRect, margin) {
  var top = clientRect.top,
      right = clientRect.right,
      bottom = clientRect.bottom,
      left = clientRect.left,
      height = clientRect.height,
      width = clientRect.width;

  return {
    top: top + margin.top,
    left: left + margin.left,
    bottom: bottom + margin.bottom,
    right: right + margin.right,
    height: height + margin.top + margin.bottom,
    width: width + margin.left + margin.right
  };
};

var getFragment = function getFragment(initial) {
  var point = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : origin;
  return {
    top: initial.top + point.y,
    left: initial.left + point.x,
    bottom: initial.bottom + point.y,
    right: initial.right + point.x,
    width: initial.width,
    height: initial.height,
    center: {
      x: (initial.right + point.x + (initial.left + point.x)) / 2,
      y: (initial.bottom + point.y + (initial.top + point.y)) / 2
    }
  };
};

var getDraggableDimension = exports.getDraggableDimension = function getDraggableDimension(_ref) {
  var id = _ref.id,
      droppableId = _ref.droppableId,
      clientRect = _ref.clientRect,
      _ref$margin = _ref.margin,
      margin = _ref$margin === undefined ? noMargin : _ref$margin,
      _ref$windowScroll = _ref.windowScroll,
      windowScroll = _ref$windowScroll === undefined ? origin : _ref$windowScroll;

  var withScroll = getWithPosition(clientRect, windowScroll);
  var withScrollAndMargin = getWithMargin(withScroll, margin);

  var dimension = {
    id: id,
    droppableId: droppableId,

    client: {
      withoutMargin: getFragment(clientRect),
      withMargin: getFragment(getWithMargin(clientRect, margin))
    },

    page: {
      withoutMargin: getFragment(withScroll),
      withMargin: getFragment(withScrollAndMargin)
    }
  };

  return dimension;
};

var getDroppableDimension = exports.getDroppableDimension = function getDroppableDimension(_ref2) {
  var id = _ref2.id,
      clientRect = _ref2.clientRect,
      _ref2$direction = _ref2.direction,
      direction = _ref2$direction === undefined ? 'vertical' : _ref2$direction,
      _ref2$margin = _ref2.margin,
      margin = _ref2$margin === undefined ? noMargin : _ref2$margin,
      _ref2$windowScroll = _ref2.windowScroll,
      windowScroll = _ref2$windowScroll === undefined ? origin : _ref2$windowScroll,
      _ref2$scroll = _ref2.scroll,
      scroll = _ref2$scroll === undefined ? origin : _ref2$scroll;

  var withWindowScroll = getWithPosition(clientRect, windowScroll);
  var withWindowScrollAndMargin = getWithMargin(withWindowScroll, margin);

  var dimension = {
    id: id,
    axis: direction === 'vertical' ? _axis.vertical : _axis.horizontal,
    scroll: {
      initial: scroll,

      current: scroll
    },
    page: {
      withoutMargin: getFragment(withWindowScroll),
      withMargin: getFragment(withWindowScrollAndMargin)
    }
  };

  return dimension;
};