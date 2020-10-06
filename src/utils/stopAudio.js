exports.stop = function (session) {
  for (let i = session.queue.length - 1; i >= 0; i--) {
    session.queue.splice(i, 1);
  }
  if (session.dispatcher) session.dispatcher.end();
}
