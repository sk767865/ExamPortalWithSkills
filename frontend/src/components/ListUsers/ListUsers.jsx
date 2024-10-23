import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './ListUsers.css';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';

const ListUsers = () => {
  const [users, setUsers] = useState([]);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Start loading
    const fetchUsers = async () => {
      try {

        const res = await apiClient(token).get('/api/all-users');
        setUsers(res?.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className='container'>


      {loading ? (<div className="loading-container">
        <CircularProgress />
      </div>) : (
        <>
          <div className="admin-panel-header">
            <h2>Existing users</h2>
          </div>
          <table style={{background:'white'}}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Genus</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className='user-row'>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.genus}</td>
                  <td>{user.isVerified ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>


      )}




    </div>
  );
};

export default ListUsers;
