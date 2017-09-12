'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var phaseSelector = exports.phaseSelector = function phaseSelector(state) {
  return state.phase;
};

var pendingDropSelector = exports.pendingDropSelector = function pendingDropSelector(state) {
  if (!state.drop || !state.drop.pending) {
    return null;
  }
  return state.drop.pending;
};

var dragSelector = exports.dragSelector = function dragSelector(state) {
  return state.drag;
};