import React from "react";

const Sidebar = ({
  friends,
  selectedFriend,
  setSelectedFriend,
  onlineUsers,
}) => {
  console.log("online", onlineUsers);
  return (
    <div className="w-full md:w-1/4 bg-white/40 p-6 rounded-xl shadow-md backdrop-blur-lg">
      <h2 className="text-xl font-semibold text-gray-800">Friends</h2>
      <ul className="mt-4">
        {friends.map((friend) => (
          <li
            key={friend._id}
            className={`p-2 rounded-lg cursor-pointer ${
              selectedFriend?._id === friend._id ? "bg-gray-300" : ""
            }`}
            onClick={() => setSelectedFriend(friend)}
          >
            <div className="flex items-center">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <p className="text-gray-800">{friend.name}</p>
                {onlineUsers.includes(friend._id) ? (
                  <span className="text-green-500">●</span>
                ) : (
                  <span className="text-gray-500">●</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
