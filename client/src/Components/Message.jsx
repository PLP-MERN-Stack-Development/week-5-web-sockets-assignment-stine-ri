const Message = ({ message, isCurrentUser }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none shadow'
        }`}
      >
        <div className="text-sm font-semibold">
          {!isCurrentUser && message.sender.username}
        </div>
        <p>{message.content}</p>
        <div className="text-xs mt-1 opacity-70">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default Message;