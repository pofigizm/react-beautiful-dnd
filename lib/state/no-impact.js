'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


var origin = { x: 0, y: 0 };

var noMovement = {
  draggables: [],
  amount: origin,
  isBeyondStartPosition: false
};

var noImpact = {
  movement: noMovement,
  direction: null,
  destination: null
};

exports.default = noImpact;