// import { useState } from "react";
import cubingLogo from "/ubc-cubing-logo.png";
// import viteLogo from "/vite.svg";
// import "./App.css";

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://aprxkjdevkzpsbjumkmm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcnhramRldmt6cHNianVta21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNTU0MjcsImV4cCI6MjA1NDkzMTQyN30.RDvcvsMhJCxKdynvD9SS3oFvSxp9E1Y0Ok2E6Rnpe1g"
);

function App() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getMembers();
  }, []);

  async function getMembers() {
    const { data, error } = await supabase.from("members").select();

    if (error) {
      console.error("Error fetching members:", error.message);
      return;
    }

    setMembers(data || []);
  }

  return (
    <div className="head">
      <img src={ cubingLogo } alt="" />
      <ul>
      {members.map((member) => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
    </div>
  );
}

export default App;
