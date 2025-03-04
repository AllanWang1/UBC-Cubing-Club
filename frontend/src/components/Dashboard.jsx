import { useEffect, useState } from 'react'
import { supabase } from "../SupabaseClient"
import LogoutButton from './LogoutButton';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);
  return (
    <div className='dashboard'>
      {user ? (
        <div className="dashboard-message">
            <h2>Welcome, {user.email}</h2>
            <LogoutButton /> 
        </div>
      ) : (
        <p>Sign In</p>
      )}
    </div>
  );
};

export default Dashboard
