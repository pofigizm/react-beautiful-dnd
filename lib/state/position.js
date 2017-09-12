'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var add = exports.add = function add(point1, point2) {
  return {
    x: point1.x + point2.x,
    y: point1.y + point2.y
  };
};

var subtract = exports.subtract = function subtract(point1, point2) {
  return {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
};

var isEqual = exports.isEqual = function isEqual(point1, point2) {
  return point1.x === point2.x && point1.y === point2.y;
};

var negate = exports.negate = function negate(point) {
  return {
    x: point.x !== 0 ? -point.x : 0,
    y: point.y !== 0 ? -point.y : 0
  };
};

var patch = exports.patch = function patch(line, value) {
  return {
    x: line === 'x' ? value : 0,
    y: line === 'y' ? value : 0
  };
};