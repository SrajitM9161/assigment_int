function adminSocketHandler(io, socket) {
  socket.on('kick_student', ({ sessionId }, callback) => {
    const targetSocket = [...io.sockets.sockets.values()].find(
      s => s.data.sessionId === sessionId
    );

    if (targetSocket) {
      targetSocket.emit('kicked', { reason: '🚫 You were removed by the teacher.' });
      targetSocket.disconnect(true);
      callback({ success: true });
    } else {
      callback({ success: false, message: 'Student not found' });
    }
  });
}

module.exports = adminSocketHandler;
