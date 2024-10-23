import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import './ChangePassword.css';
import apiClient from '../../utils/apiClient';

const ChangePassword = () => {
    const { token } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {

            const res = await apiClient(token).put('/api/change-password', {
                currentPassword,
                newPassword
            });

            setSuccess(res.data.msg);
            setError('');
        } catch (err) {
            setError(err.response.data.msg || 'Error updating password');
            setSuccess('');
        }
    };

    return (
        <div className="change-password-container">
            <h2>Change Password</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-submit">Change Password</button>
            </form>
        </div>
    );
};

export default ChangePassword;
