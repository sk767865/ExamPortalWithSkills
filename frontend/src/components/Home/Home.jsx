
import './Home.css';

import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';





const Home = () => {
    const { user } = useContext(AuthContext);
  
    if (!user) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="container">
        <h2>User Dashboard</h2>
        <div className="user-details">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Genus:</strong> {user.genus}</p> 
        </div>
      </div>
    );
  };
  
  export default Home;
