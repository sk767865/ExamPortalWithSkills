import React, { useState, useContext, useEffect } from 'react';

import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AddUser.css';
import apiClient from '../../utils/apiClient';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [role, setRole] = useState('trainee');
  const [genus, setGenus] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [genusList, setGenusList] = useState([]);

  useEffect(() => {
    const fetchGenusData = async () => {
      try {
        const res = await apiClient(token).get('/api/experience-genus');
        const sortedGenusList = res.data.sort((a, b) => a.genus.localeCompare(b.genus));
        setGenusList(sortedGenusList);
      } catch (err) {
        console.error('Error fetching genus data:', err);
      }
    };
    fetchGenusData();
  }, [token]);



  const onSubmit = async (e) => {
    e.preventDefault();

    // Reset error messages
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    let hasError = false;

    if (!email.endsWith('@nagarro.com')) {
      setEmailError('Email must end with @nagarro.com');
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      await apiClient(token).post('/api/register', {
        email,
        password,
        firstname,
        lastname,
        role,
        genus,
      });


      // Trigger Toast Notification on success
      toast.success('User added successfully!');

      // Delay navigation for 3 seconds to allow the toast to appear
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (err) {
      console.error('Error adding user:', err.response.data);
      
      toast.error('Failed to add user!');
    }
  };

  return (
    <div className="add-user-container">
      <div className="add-user-form">
        <h2>Add New User</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              className="form-control"
              value={firstname}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              className="form-control"
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
          </div>


          <div className="form-group">
            <label>Role</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="trainee">Trainee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Genus</label>
            <select
              className="form-control"
              value={genus}
              onChange={(e) => setGenus(e.target.value)}
              required
            >
              <option value="">Select Genus</option>
              {genusList.map((genusItem) => (
                <option key={genusItem._id} value={genusItem.genus}>
                  {genusItem.genus}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-submit">Add User</button>
        </form>
      </div>

      <ToastContainer
        position="top-center"  // Positioning the toast in the top-center
        autoClose={3000}       // Auto-close after 3 seconds
        hideProgressBar={false} // Shows the progress bar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AddUser;
