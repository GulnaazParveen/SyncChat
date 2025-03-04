import React from "react";

const Sidebar = ({
  friends,
  selectedFriend,
  setSelectedFriend,
  onlineUsers,
}) => {
  return (
    <aside className="w-full md:w-1/4 bg-white/20 p-5 rounded-xl shadow-md backdrop-blur-lg">
      <h2 className="text-lg font-bold mb-4 text-white">Friends</h2>
      <ul className="space-y-3">
        {friends.map((friend, index) => {
          const isOnline = onlineUsers.includes(friend._id); 
          return (
            <li
              key={index}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition ${
                selectedFriend?._id === friend._id
                  ? "bg-blue-500"
                  : "bg-white/30 hover:bg-white/50"
              }`}
              onClick={() => setSelectedFriend(friend)}
            >
              <img
                src={friend.avatar}
                alt={friend.name}
                className="rounded-full w-10 h-10 mr-3"
              />
              <span className="font-medium text-white">{friend.name}</span>

              {/* Online Status Indicator */}
              <span
                className={`ml-auto w-3 h-3 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default Sidebar;
