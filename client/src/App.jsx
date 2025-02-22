import React, { useState } from "react";
import Chatroom from "./component/wholechat/Chatroom";
import Auth from "./component/wholechat/Auth";


function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {user ? <Chatroom /> : <Auth setUser={setUser} />}
    </div>
  );
}

export default App;
