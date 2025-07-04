import { useEffect } from 'react';

const Notifications = ({ socket }) => {
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (document.hidden && Notification.permission === 'granted') {
        new Notification(`New message from ${message.sender}`, {
          body: message.content,
          icon: '/logo.png'
        });
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket]);

  return null;
};

export default Notifications;