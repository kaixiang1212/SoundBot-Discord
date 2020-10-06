exports.skip = function (session) {
  if (session.dispatcher) session.dispatcher.end();
}