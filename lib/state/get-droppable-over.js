'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _isInsideDroppable = require('./is-inside-droppable');

var _isInsideDroppable2 = _interopRequireDefault(_isInsideDroppable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (target, droppables) {
  var maybeId = (0, _keys2.default)(droppables).find(function (key) {
    return (0, _isInsideDroppable2.default)(target, droppables[key]);
  });

  return maybeId || null;
};