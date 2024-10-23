import React, { useState, useEffect, useContext } from 'react';
import './MasterPlanIndivisual.css';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';

const MasterPlanIndivisual = () => {

  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [traineeData, setTraineeData] = useState([]);

  const [experienceRange, setExperienceRange] = useState(''); // Store fetched experience range
  const [genusData, setGenusData] = useState([]); // Store the genus and experience data from API

  const [genusDetails, setGenusDetails] = useState([]); // New state for storing genus details

  const [courseDates, setCourseDates] = useState({});


  // Handle change of genus selection
  // Handle change of genus selection
  const handleGenusSelection = async (e) => {
    const selectedGenus = e.target.value;
    setSelectedUsername(selectedGenus);  // Store the selected genus

    // Fetch detailed data based on the selected genus
    try {
      setLoading(true);
      const genusDetailsRes = await apiClient(token).post('/api/get-by-genus', { genus: selectedGenus });
      // console.log(genusDetailsRes.data);
      setGenusDetails(genusDetailsRes.data); // Store the fetched genus details

      // Find the experience range related to the selected genus
      const genusInfo = genusData.find((item) => item.genus === selectedGenus);
      if (genusInfo) {
        setExperienceRange(genusInfo.experienceRange); // Set the experience range for the selected genus
      } else {
        setExperienceRange(''); // Clear if no match is found
      }
    } catch (err) {
      console.error('Error fetching genus details:', err);
    } finally {
      setLoading(false);
    }
  };


  const calculateEndDate = (startDate, durationInDays) => {
    if (!startDate || !durationInDays) return '';

    const start = new Date(startDate);

    // Adding days reliably
    start.setDate(start.getDate() + parseInt(durationInDays, 10));

    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed in JS
    const dd = String(start.getDate()).padStart(2, '0'); // Ensure day is two digits

    return `${yyyy}-${mm}-${dd}`; // Return the formatted date
  };




  const handleSave = async () => {
    // Find the selected user's details from traineeData
    const selectedUser = traineeData.find(
      (trainee) => trainee.genus === selectedUsername
    );

    if (!selectedUser || !selectedStartDate || genusDetails.length === 0) {
      alert("Username, Course Start Date, and Genus details are mandatory");
      return;
    }

    // Create the user details object
    const userDetails = {
      firstname: selectedUser.firstname,
      lastname: selectedUser.lastname,
      email: selectedUser.email,
    };

    // Create the trainingPlanDetails array with any number of objects
    const trainingPlanDetails = genusDetails.map((entry) => {
      const skillDetails = entry.category.skills.find(
        (skill) => skill.skillName === entry.skill
      );

      const courseStartDate = courseDates[entry._id]?.startDate || '';
      const courseEndDate = courseDates[entry._id]?.endDate || '';

      // Ensure the course end date is also filled before saving
      if (!courseStartDate || !courseEndDate) {
        alert("Course Start Date and Course End Date are mandatory");
        return null;
      }

      // Form the data object for each genus
      return {
        experienceRange: entry.experienceRange,
        genus: entry.genus,
        category: entry.category.name,
        skills: entry.skill,
        mustHaveSkill: entry.importance,
        courseDuration: skillDetails?.courseDuration || 0,
        courseStartDate: courseStartDate,
        courseEndDate: courseEndDate,
      };
    }).filter(item => item !== null); // Filter out null values if any validation failed

    // If there's valid data to save
    if (trainingPlanDetails.length > 0) {
      // The final object with user details and any number of training plans
      const dataToSend = {
        userDetails,
        trainingPlanDetails
      };

      try {
        // Make a GET request to check if any user has a training plan
        const allUsersResponse = await apiClient(token).get('/api/trainee-plan-getall');
        const allTraineePlans = allUsersResponse.data;

        // Check if the user already has a training plan by matching email
        const userWithPlan = allTraineePlans.find(traineePlan => traineePlan.userDetails.email === userDetails.email);

        if (userWithPlan) {
          // If user exists, send PUT request to update the trainee plan
          const response = await apiClient(token).put('/api/update-trainee-plan', dataToSend);

          // Success notification or handling
          toast.success("Data updated successfully!");
          console.log("Server response (update):", response.data);

        } else {
          // If user does not exist, send POST request to create new trainee plan
          const response = await apiClient(token).post('/api/create-trainee-plan-detail', dataToSend);

          // Success notification or handling
          toast.success("Data saved successfully!");
          console.log("Server response (create):", response.data);
        }

      } catch (err) {
        // Error handling
        console.error('Error saving or updating data on the backend:', err);
        toast.error("Error saving data.");
      }
    }
  };



  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so +1
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(getTodayDate());





  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {

        const usersRes = await apiClient(token).get('/api/all-trainee');
        console.log(usersRes.data);
        setTraineeData(usersRes.data); // Set trainee data

        // Fetch genus and experience range
        const genusRes = await apiClient(token).get('/api/experience-genus');
        setGenusData(genusRes.data); // Store genus and experience range data

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchData();
  }, [token]);

  const getExperienceRangeRowSpan = (list, experienceRange) => {
    return list.filter(entry => entry.experienceRange === experienceRange).length;
  };

  const getGenusRowSpan = (list, genus) => {
    return list.filter(entry => entry.genus === genus).length;
  };


  const getCategoryRowSpan = (list, genus, category) => {
    return list.filter(entry => entry.genus === genus && entry.category.name === category).length;
  };

  const logDateGap = (oldDate, newDate, entry) => {
    const oldDateObj = new Date(oldDate);
    const newDateObj = new Date(newDate);
    const differenceInDays = Math.ceil((newDateObj - oldDateObj) / (1000 * 60 * 60 * 24));
    console.log(`Skill: ${entry.skill}, Gap between old and new start date: ${differenceInDays} days`);
  };





  const setContinuousDatesFrom = (startIndex, newStartDate) => {
    let lastEndDate = newStartDate;  // Start with the newly changed start date

    const updatedCourseDates = genusDetails.map((entry, index) => {
      if (index < startIndex) {
        // Keep dates before the changed date unchanged
        return courseDates[entry._id];
      }

      const skillDetails = entry.category.skills.find(skill => skill.skillName === entry.skill);
      const courseDurationInDays = skillDetails?.courseDuration || 0;

      const oldStartDate = courseDates[entry._id]?.startDate || '';
      const oldEndDate = courseDates[entry._id]?.endDate || '';

      // Calculate the new start and end dates
      const startDate = lastEndDate;
      const endDate = calculateEndDate(startDate, courseDurationInDays);

      // Log the gap between old and new start dates for the skill that was changed
      if (index === startIndex) {
        logDateGap(oldStartDate, startDate, entry);
      }

      // Set the last end date to be this skill's end date + 1 day for the next skill
      lastEndDate = calculateEndDate(endDate, 1); // 1 day gap for the next skill

      return {
        startDate,
        endDate
      };
    });

    // Update the state with the recalculated dates
    setCourseDates((prev) => ({
      ...prev,
      ...updatedCourseDates.reduce((acc, dates, idx) => {
        acc[genusDetails[idx]._id] = dates;
        return acc;
      }, {})
    }));
  };



  return (
    <>

      <header className="header-container">
        <h1 className="header-plan">Design Indivisual Master Plan</h1>

      </header>

      <div className="add-skillset-container">
     
            <form className="add-skillset-form">

              {/* Dropdown for selecting trainee */}

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <select
                  id="username"
                  value={selectedUsername}
                  onChange={handleGenusSelection}
                  required
                >
                  <option value="" disabled>Select Username</option>
                  {traineeData
                    .map((item) => (
                      <option key={item._id} value={item.genus}>
                        {`${item.firstname} ${item.lastname} (${item.email})`}
                      </option>
                    ))}
                </select>
              </div>

              {/* Display corresponding genus for the selected trainee */}
              <div className="form-group">
                <label htmlFor="genus">Genus</label>
                <input
                  type="text"
                  id="genus"
                  value={selectedUsername}  // Genus is set automatically based on the selected trainee
                  readOnly
                  required
                />
              </div>

              {/* Display corresponding experience range for the selected genus */}
              <div className="form-group">
                <label htmlFor="experienceRange">Experience Range (Years)</label>
                <input
                  type="text"
                  id="experienceRange"
                  value={experienceRange}  // This will display the fetched experience range
                  readOnly
                  required
                />
              </div>


            </form>

            <form className="add-skillset-form">






              {/* Calendar input for selecting date */}
              <div className="form-group">
                <label htmlFor="courseDate">Course Start Date</label>
                <input
                  type="date"
                  id="courseDate"
                  value={selectedStartDate}  // You will need to manage this state
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setSelectedStartDate(newStartDate); // Update the selected start date
                    // Set continuous dates starting from the first skill
                    setContinuousDatesFrom(0, newStartDate);
                  }}  // Manage the date selection
                  required
                />
              </div>


              <button type="button" className="btn-add" onClick={handleSave}>
                Save
              </button>

              <button type="button" className="btn-add">
                Send Email
              </button>
            </form>


           
      
        {loading?(

<div className="loading-container-new">
            <CircularProgress />
          </div>

        ):(

          <div className="added-category-skill-list" style={{ background: 'white' }}>

          <table>
            <thead>
              <tr>


                <th style={{ width: '10%' }}>Experience Range</th>
                <th style={{ width: '10%' }}>Genus</th>
                <th style={{ width: '10%' }}>Category</th>
                <th style={{ width: '30%' }}>Skills</th>
                <th style={{ width: '10%' }}>Must Have Skill</th>
                <th style={{ width: '10%' }}>Course Duration (in days)</th>
                <th style={{ width: '15%' }}>Course Start Date</th>
                <th style={{ width: '15%' }}>Course End Date</th>


              </tr>
            </thead>
            <tbody>
              {genusDetails


                .sort((a, b) => {
                  // 1. Sort by experienceRange (assuming numeric ranges)
                  const [aStart] = a.experienceRange.split('-').map(Number);
                  const [bStart] = b.experienceRange.split('-').map(Number);
                  if (aStart !== bStart) return aStart - bStart;

                  // 2. Sort by genus (alphabetical)
                  if (a.genus !== b.genus) return a.genus.localeCompare(b.genus);

                  // 3. Sort by category name (alphabetical)
                  if (a.category.name !== b.category.name) return a.category.name.localeCompare(b.category.name);

                  // 4. Sort by skill name (alphabetical)
                  // if (a.skill !== b.skill) return a.skill.localeCompare(b.skill);

                  // 5. Sort by importance (Must Have first, then Good to Have)
                  const importanceOrder = { "Must Have": 1, "Good to Have": 2 };
                  if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
                    return importanceOrder[a.importance] - importanceOrder[b.importance];
                  }

                  // 6. Sort by skill duration in ascending order
                  const skillDetailsA = a.category.skills.find(skill => skill.skillName === a.skill);
                  const skillDetailsB = b.category.skills.find(skill => skill.skillName === b.skill);
                  const courseDurationA = skillDetailsA?.courseDuration || 0;
                  const courseDurationB = skillDetailsB?.courseDuration || 0;
                  return courseDurationA - courseDurationB;
                })








                .map((entry, index, array) => {
                  // Find the course duration for the entry's skill
                  const skillDetails = entry.category.skills.find(
                    (skill) => skill.skillName === entry.skill
                  );

                  // console.log("yyyy", entry.skill);

                  // Get course duration in days (or default to 0 if not found)
                  const courseDurationInDays = skillDetails?.courseDuration || 0;

                  // Get the start and end dates for this particular entry
                  const entryDates = courseDates[entry._id] || { startDate: '', endDate: '' };


                  // Check if the current row is the first occurrence for Experience Range
                  const isFirstExperienceRange =
                    index === 0 || entry.experienceRange !== array[index - 1].experienceRange;

                  // Check if the current row is the first occurrence for Genus
                  const isFirstGenus =
                    index === 0 ||
                    entry.genus !== array[index - 1].genus ||
                    entry.experienceRange !== array[index - 1].experienceRange;

                  // Check if the current row is the first occurrence for Category
                  const isFirstCategory =
                    index === 0 ||
                    entry.category.name !== array[index - 1].category.name ||
                    entry.genus !== array[index - 1].genus ||
                    entry.experienceRange !== array[index - 1].experienceRange;


                    const previousSkillEndDate = index > 0 ? courseDates[genusDetails[index - 1]._id]?.endDate : '';


                  return (
                    <tr key={entry._id}>
                      {/* Merge Experience Range with rowspan */}
                      {isFirstExperienceRange && (
                        <td rowSpan={getExperienceRangeRowSpan(genusDetails, entry.experienceRange)}>
                          {entry.experienceRange}
                        </td>
                      )}

                      {/* Merge Genus with rowspan */}
                      {isFirstGenus && (
                        <td rowSpan={getGenusRowSpan(genusDetails, entry.genus)}>{entry.genus}</td>
                      )}

                      {/* Merge Category with rowspan */}
                      {isFirstCategory && (
                        <td rowSpan={getCategoryRowSpan(genusDetails, entry.genus, entry.category.name)}>
                          {entry.category.name}
                        </td>
                      )}
                      <td>{entry.skill}</td>
                      <td>{entry.importance}</td>
                      <td>{courseDurationInDays}</td> {/* Display course duration in days */}
                      <td>
                        <input
                          type="date"
                          value={entryDates.startDate}
                          min={previousSkillEndDate}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            // Recalculate dates starting from the changed skill's start date
                            setContinuousDatesFrom(index, newStartDate);
                          }}
                        />
                      </td>
                      <td>
                        <input type="date" value={entryDates.endDate} readOnly />
                      </td>
                    </tr>
                  );
                })}
            </tbody>




          </table>
        </div>


        )}





      </div>
    </>
  );
};


export default MasterPlanIndivisual;
