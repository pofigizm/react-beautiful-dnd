'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (target, dimension) {
  var fragment = dimension.page.withMargin;
  var top = fragment.top,
      right = fragment.right,
      bottom = fragment.bottom,
      left = fragment.left;


  return target.x >= left && target.x <= right && target.y >= top && target.y <= bottom;
};