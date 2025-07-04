import http from 'http';
import app from './app.js';
import configureSocket from './config/socket.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const server = http.createServer(app);

// Configure Socket.io
const io = configureSocket(server);

// Store io instance in app for route access
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});