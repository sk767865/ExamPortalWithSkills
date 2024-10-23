import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Login/Login';
import ListUsers from './components/ListUsers/ListUsers';
import ViewTrainingPlan from './components/ViewTrainingPlan/ViewTrainingPlan';
import ProtectedRoute from './components/ProtectedRoute';
import AddUser from './components/Add User/AddUser';
import Home from './components/Home/Home';
import ChangePassword from './components/ChangePassword/ChangePassword';
import AddSkillset from './components/AddSkills/AddSkillset';
import AddExperience from './components/AddExperience/AddExperience';
import MasterPlanIndivisual from './components/MasterPlanIndivisual/MasterPlanIndivisual';


import MasterPlan from './components/MasterPlan/MasterPlan';

import { ToastContainer } from 'react-toastify';  // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';   // Import the CSS for Toastify


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/view-training-plan" element={<ProtectedRoute role="trainee"><ViewTrainingPlan /></ProtectedRoute>} />
          <Route path="/list-users" element={<ProtectedRoute role="admin"><ListUsers /></ProtectedRoute>} />
          <Route path="/add-user" element={<ProtectedRoute role="admin"><AddUser /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/add-skillset" element={<ProtectedRoute role="admin"><AddSkillset /></ProtectedRoute>} />
          <Route path="/add-genus" element={<ProtectedRoute role="admin"><AddExperience /></ProtectedRoute>} />
          <Route path="/master-plan" element={<ProtectedRoute role="admin"><MasterPlan /></ProtectedRoute>} />
          <Route path="/create-edit-training-plan" element={<ProtectedRoute role="admin"><MasterPlanIndivisual /></ProtectedRoute>} />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />

      </AuthProvider>
    </Router>
  );
}

export default App;



