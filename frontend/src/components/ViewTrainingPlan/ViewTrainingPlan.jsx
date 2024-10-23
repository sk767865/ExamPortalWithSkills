import AuthContext from '../../context/AuthContext';
import '../ViewTrainingPlan/ViewTrainingPlan.css';
import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';

const ViewTrainingPlan = () => {
  const [loading, setLoading] = useState(true);
  const [traineePlans, setTraineePlans] = useState([]);

  const { token, user } = useContext(AuthContext); // Get the user from AuthContext

  useEffect(() => {
    // Fetch trainee plans from the API
    const fetchTraineePlans = async () => {
      try {
        const response = await apiClient(token).get('/api/trainee-plan-getall');
        setTraineePlans(response.data); // Assuming response contains the correct data structure
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch trainee plans');
        setLoading(false);
      }
    };

    fetchTraineePlans();
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');  // Pad day to two digits
    const mm = String(date.getMonth() + 1).padStart(2, '0');  // Pad month to two digits
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;  // Return formatted date
  };
  

  const getExperienceRangeRowSpan = (list, experienceRange) => {
    return list.filter(entry => entry.experienceRange === experienceRange).length;
  };

  const getGenusRowSpan = (list, genus) => {
    return list.filter(entry => entry.genus === genus).length;
  };

  const getCategoryRowSpan = (list, genus, category) => {
    return list.filter(entry => entry.genus === genus && entry.category === category).length;
  };

  return (
    <>
      <header className="header-container">
        <h1 className="header-plan">View Complete Training Plan</h1>
      </header>

      <div className="add-skillset-container">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
          </div>
        ) : (
          <>
            {traineePlans
              .filter((plan) => plan.userDetails.email === user.email) // Match email with logged-in user's email
              .map((plan) => (
                <div key={plan._id} className="trainee-plan-section">
                  {/* User Details Table */}
                  <h2>User Details</h2>
                  <table className="user-details-table">
                    <thead>
                      <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{plan.userDetails.firstname}</td>
                        <td>{plan.userDetails.lastname}</td>
                        <td>{plan.userDetails.email}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Training Plan Details Table */}
                  <h2>Training Plan Details</h2>
                  <table className="training-plan-details-table">
                    <thead>
                      <tr>
                        <th>Experience Range</th>
                        <th>Genus</th>
                        <th>Category</th>
                        <th>Skills</th>
                        <th>Must Have Skill</th>
                        <th>Course Duration</th>
                        <th>Course Start Date</th>
                        <th>Course End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.trainingPlanDetails
                        .sort((a, b) => {
                          // Sort by experienceRange (numeric comparison)
                          const [aStart] = a.experienceRange.split('-').map(Number);
                          const [bStart] = b.experienceRange.split('-').map(Number);
                          if (aStart !== bStart) return aStart - bStart;

                          // Sort by genus (alphabetically)
                          if (a.genus !== b.genus) return a.genus.localeCompare(b.genus);

                          // Sort by category (alphabetically)
                          if (a.category !== b.category) return a.category.localeCompare(b.category);

                          // Sort by skills (alphabetically)
                          if (a.skills !== b.skills) return a.skills.localeCompare(b.skills);

                          // Sort by importance (Must Have first, Good to Have second)
                          const importanceOrder = { "Must Have": 1, "Good to Have": 2 };
                          if (importanceOrder[a.mustHaveSkill] !== importanceOrder[b.mustHaveSkill]) {
                            return importanceOrder[a.mustHaveSkill] - importanceOrder[b.mustHaveSkill];
                          }

                          // Sort by course duration (numeric comparison)
                          return a.courseDuration - b.courseDuration;
                        })
                        .map((detail, index, array) => {
                          // Calculate rowspans for experience range, genus, and category
                          const isFirstExperienceRange = index === 0 || detail.experienceRange !== array[index - 1].experienceRange;
                          const isFirstGenus = index === 0 || detail.genus !== array[index - 1].genus || detail.experienceRange !== array[index - 1].experienceRange;
                          const isFirstCategory = index === 0 || detail.category !== array[index - 1].category || detail.genus !== array[index - 1].genus || detail.experienceRange !== array[index - 1].experienceRange;

                          return (
                            <tr key={detail._id}>
                              {/* Merge Experience Range with rowspan */}
                              {isFirstExperienceRange && (
                                <td rowSpan={getExperienceRangeRowSpan(plan.trainingPlanDetails, detail.experienceRange)}>
                                  {detail.experienceRange}
                                </td>
                              )}

                              {/* Merge Genus with rowspan */}
                              {isFirstGenus && (
                                <td rowSpan={getGenusRowSpan(plan.trainingPlanDetails, detail.genus)}>{detail.genus}</td>
                              )}

                              {/* Merge Category with rowspan */}
                              {isFirstCategory && (
                                <td rowSpan={getCategoryRowSpan(plan.trainingPlanDetails, detail.genus, detail.category)}>
                                  {detail.category}
                                </td>
                              )}

                              <td>{detail.skills}</td>
                              <td>{detail.mustHaveSkill}</td>
                              <td>{detail.courseDuration}</td>
                              <td>{formatDate(detail.courseStartDate)}</td> {/* Format the start date */}
                              <td>{formatDate(detail.courseEndDate)}</td>  
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ))}
          </>
        )}
      </div>
    </>
  );
};

export default ViewTrainingPlan;
