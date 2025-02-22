import React from 'react'

const Rightside = ({ friends }) => {
  return (
    <>
      <aside className="w-full md:w-1/4 bg-white/20 p-5 rounded-xl shadow-md backdrop-blur-lg">
        <h2 className="text-lg font-bold mb-4 text-white">Community Chat</h2>
        <img
          src="https://img.freepik.com/free-photo/people-using-technology-social-media_23-2149174384.jpg"
          alt="Community Chat"
          className="w-full rounded-lg shadow-md mb-4"
        />

        {/* Quick Reactions */}
        <div>
          <h3 className="text-white font-bold mb-2">Quick Reactions</h3>
          <div className="flex space-x-2">
            <button className="bg-yellow-400 px-3 py-2 rounded-full text-lg shadow-md">
              🔥
            </button>
            <button className="bg-blue-400 px-3 py-2 rounded-full text-lg shadow-md">
              😂
            </button>
            <button className="bg-green-400 px-3 py-2 rounded-full text-lg shadow-md">
              💖
            </button>
            <button className="bg-purple-400 px-3 py-2 rounded-full text-lg shadow-md">
              👏
            </button>
          </div>
        </div>

        {/* Online Users */}
        <div className="mt-6">
          <h3 className="text-white font-bold mb-2">Online Users</h3>
          <ul className="space-y-2">
            {friends
              .filter((friend) => friend.status === "Online")
              .map((friend, index) => (
                <li
                  key={index}
                  className="flex items-center bg-white/30 p-2 rounded-lg shadow-md"
                >
                  <img
                    src={friend.img}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <span className="font-medium text-white">{friend.name}</span>
                  <span className="ml-auto text-green-400">●</span>
                </li>
              ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Rightside
