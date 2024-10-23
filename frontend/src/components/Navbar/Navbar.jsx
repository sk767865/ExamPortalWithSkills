import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Navbar.css';
import apiClient from '../../utils/apiClient';

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [genus, setGenus] = useState('');
  const [profileImage, setProfileImage] = useState(
    user?.profileImage ? `data:image/jpeg;base64,${user.profileImage}` : 'https://via.placeholder.com/150'
  );
  const dropdownRef = useRef(null);


  useEffect(() => {
    const fetchGenus = async () => {
      try {
        const response = await apiClient(token).get('/api/all-users');
        const userData = response.data.find((u) => u.email === user.email); // Assuming you're matching by email
        if (userData) {
          console.log(userData.genus);
          setGenus(userData.genus);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user) {
      fetchGenus();
    }
  }, [user]);


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    setDropdownOpen(false);
    if (user && user.profileImage) {
      setProfileImage(`data:image/jpeg;base64,${user.profileImage}`);
    } else {
      setProfileImage('https://via.placeholder.com/150');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleImageChange = async (e) => {
    let token = localStorage.getItem('token');
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {

        const res = await apiClient(token).post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        setProfileImage(`data:image/jpeg;base64,${res.data?.profileImage}`);
        e.target.value = null;
      } catch (err) {
        console.error('Error uploading image:', err.response?.data?.msg || err.message);
      }
    }
  };

  return (
    <nav className="navbar">


      <img src={`${process.env.PUBLIC_URL}/aqtLogo.png`} alt="BU Portal Logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
      <span className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'white' }}>
       
      AQT L&D Portal
      </span>

      <div className="navbar-container">
        <div className="navbar-links">

          {user && (<Link className="nav-link" to="/home">Home</Link>)}


          {user && user.role === 'admin' && (
            <div className="nav-item dropdown">
              <span className="nav-link">Training Plan</span>
              <div className="navbar-dropdown-content">
                <Link className="navbar-dropdown-item" to="/master-plan">Design Master Plan</Link>
                <Link className="navbar-dropdown-item" to="/create-edit-training-plan">Design individual Training Plan</Link>
              </div>
            </div>
          )}

          {user && user.role === 'admin' && (
            <div className="nav-item dropdown">
              <span className="nav-link">Master Data</span>
              <div className="navbar-dropdown-content">
                <Link className="navbar-dropdown-item" to="/add-skillset">Add Skillset</Link>
                <Link className="navbar-dropdown-item" to="/add-genus">Add Genus</Link>
              </div>
            </div>
          )}

          {user && user.role === 'trainee' && (
            <div className="nav-item dropdown">
              <span className="nav-link">My Learning Plan</span>
              <div className="navbar-dropdown-content">
                <Link className="navbar-dropdown-item" to="/view-training-plan">View Training Portal</Link>
                <Link className="navbar-dropdown-item" to="/my-training-dashboard">My Training Dashboard</Link>
              </div>
            </div>
          )}

          {user && user.role === 'admin' && (
            <div className="nav-item dropdown">
              <span className="nav-link">User Management</span>
              <div className="navbar-dropdown-content">
                <Link className="navbar-dropdown-item" to="/list-users">Existing Users</Link>
                <Link className="navbar-dropdown-item" to="/add-user">Create User</Link>
              </div>
            </div>
          )}
        </div>



        {user && (
          <div className="navbar-user" ref={dropdownRef}>
            <div className="profile-dropdown-image" onClick={toggleDropdown}>
              <img key={profileImage} src={profileImage} alt="User Profile" />
            </div>
            <div className={`profile-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
              {/* Account Info Section */}
              <div className="dropdown-section">
                {/* <div className="dropdown-header"></div> */}
                <div className="profile-dropdown-item">
                  <img src={profileImage} alt="User Profile" />
                  <div>
                    <div className="user-name">{`Welcome, ${user?.firstname} ${user?.lastname}`} </div>
                    {/* <div className="user-email">{user?.email}</div> */}
                    {/* <div className="user-genus">Genus: {genus}</div> */}
                  </div>
                </div>
              </div>


              {/* Account Section */}
              <div className="Account-section">
                <div className="dropdown-header">Account info</div>
                <div>
                  {/* <div className="user-name">{`${user?.firstname} ${user?.lastname}`}</div> */}
                  <div className="user-email-info">Email: {user?.email}</div>
                  <div className="user-genus-info">Genus: {genus}</div>
                  <div className="user-role-info">Role: {user?.role}</div>
                </div>

              </div>



              {/* Manage Section */}
              <div className="dropdown-section">
                <div className="dropdown-header">Manage</div>
                <label className="profile-dropdown-item">
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <span style={{ cursor: 'pointer' }}>Change Profile Image</span>
                </label>
                <Link className="profile-dropdown-item" to="/change-password">Change Password</Link>
                <div className="dropdown-header"></div>
                <button className="profile-dropdown-item btn-logout" onClick={handleLogout}>Sign out</button>
              </div>
            </div>
          </div>
        )}



      </div>



      <img src={`${process.env.PUBLIC_URL}/nagarro_icon.jpg`} alt="BU Portal Logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
    </nav>
  );
};

export default Navbar;
