import React, { useState, useEffect, useContext } from 'react';
import './MasterPlan.css';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';


const MasterPlan = () => {
  const [experienceData, setExperienceData] = useState([]);
  const [selectedGenus, setSelectedGenus] = useState('');
  const [selectedExperienceRange, setSelectedExperienceRange] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [importance, setImportance] = useState(''); // Track 'Must Have' or 'Good to Have'
  const [newCategorySkillList, setNewCategorySkillList] = useState([]);
  const [loading, setLoading] = useState(true); // State to track loading
  const { token } = useContext(AuthContext);

  const sortCategorySkillList = (list) => {
    return list.slice().sort((a, b) => {
      const [startA, endA] = a.experienceRange.split('-').map(Number);
      const [startB, endB] = b.experienceRange.split('-').map(Number);

      if (startA !== startB) {
        return startA - startB;
      }
      return endA - endB;
    });
  };



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      try {
        const experienceRes = await apiClient(token).get('/api/experience-genus');
        setExperienceData(experienceRes.data);

        const categoryRes = await apiClient(token).get('/api/categories');
        setCategories(categoryRes.data);

        // Fetch master data only after categories are fetched
        const masterRes = await apiClient(token).get('/api/getAllMasterData');
        const updatedEntries = masterRes.data.map((entry) => {
          const category = categoryRes.data.find(cat => cat._id === entry.category._id);
          const skill = category?.skills.find(s => s.skillName === entry.skill);
          return {
            ...entry,
            flagged: skill?.isSkillDeleted || false
          };
        });
        // setNewCategorySkillList(updatedEntries);
        setNewCategorySkillList(sortCategorySkillList(updatedEntries));

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchData();
  }, [token]);


  // Update skills based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const selectedCategoryData = categories.find(category => category._id === selectedCategory);
      setSkills(selectedCategoryData?.skills || []);
    } else {
      setSkills([]);
    }
  }, [selectedCategory, categories]);

  // Handle selection of genus and update experience range based on selected genus
  useEffect(() => {
    if (selectedGenus) {
      const selectedGenusData = experienceData.find(item => item.genus === selectedGenus);
      setSelectedExperienceRange(selectedGenusData?.experienceRange || '');
    }
  }, [selectedGenus, experienceData]);

  const handleAddCategorySkill = async () => {

    const skillImportance = importance || 'Good to Have';

    if (!selectedGenus || !selectedExperienceRange || !selectedCategory || !selectedSkill) {
      alert('Please select genus, experience range, category, skill, and importance.');
      return;
    }

    // Find the selected category object to include its name
    const selectedCategoryData = categories.find(category => category._id === selectedCategory);
    const skillInCategory = selectedCategoryData.skills.find(skill => skill.skillName === selectedSkill);

    const newEntry = {
      experienceRange: selectedExperienceRange,
      genus: selectedGenus,
      category: selectedCategory,  // This is now the ObjectId
      skill: selectedSkill,
      importance: skillImportance,
      flagged: skillInCategory?.isSkillDeleted || false, // Set flagged if the skill is marked as deleted
    };

    try {
      // Send data to the server using the existing apiClient
      const res = await apiClient(token).post('/api/add-masterData', newEntry);

      // If the save is successful, add the entry to the local state and populate the category name
      const updatedEntry = {
        ...res.data,
        category: {
          _id: selectedCategoryData._id,
          name: selectedCategoryData.name,
        }
      };

      // setNewCategorySkillList([...newCategorySkillList, updatedEntry]);
      setNewCategorySkillList(sortCategorySkillList([...newCategorySkillList, updatedEntry]));

      // Reset form selections
      setSelectedGenus('');
      setSelectedExperienceRange('');
      setSelectedCategory('');
      setSelectedSkill('');
      setImportance('');

      // Show success notification
      toast.success('Skill added successfully!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error('Error saving master entry:', error);
      alert('Failed to save data. Please try again.');
    }
  };

  // Check if any row has flagged = true
  const isAnyFlaggedTrue = newCategorySkillList.some(entry => entry.flagged === true);

  const getExperienceRangeRowSpan = (list, experienceRange) => {
    return list.filter(entry => entry.experienceRange === experienceRange).length;
  };

  const getGenusRowSpan = (list, genus) => {
    return list.filter(entry => entry.genus === genus).length;
  };


  const getCategoryRowSpan = (list, genus, category) => {
    return list.filter(entry => entry.genus === genus && entry.category.name === category).length;
  };


  return (
    <>

      <header className="header-container">
        <h1 className="header-plan">Master Plan</h1>
        {/* <h2>Streamline Your Testing with the QA Master Plan</h2> */}
      </header>

      <div className="add-skillset-container">
        {loading ? (

          <div className="loading-container">
            <CircularProgress />
            {/* <header className="header-container">
                    <h1>We care.</h1>
                    <h2>Caring is our superpower.</h2>
                 </header> */}

          </div>
        ) : (
          <>
            <form className="add-skillset-form">

              {/* Dropdown for selecting genus */}
              <div className="form-group">
                <label htmlFor="genus">Genus</label>
                <select
                  id="genus"
                  value={selectedGenus}
                  onChange={(e) => setSelectedGenus(e.target.value)}
                  required
                // size="5"
                >
                  <option value="" disabled>Select Genus</option>
                  {experienceData
                    .sort((a, b) => a.genus.localeCompare(b.genus))
                    .map((item) => (
                      <option key={item._id} value={item.genus}>
                        {item.genus}
                      </option>
                    ))}
                </select>
              </div>

              {/* Display corresponding experience range for the selected genus */}
              <div className="form-group">
                <label htmlFor="experienceRange">Experience Range (Years)</label>
                <input
                  type="text"
                  id="experienceRange"
                  value={selectedExperienceRange}
                  readOnly
                  required
                />
              </div>

              {/* Dropdown for selecting category */}
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories
                    .filter(category => !category.isCategoryDeleted)
                    .map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dropdown for selecting skill */}
              <div className="form-group">
                <label htmlFor="skill">Skill</label>
                <select
                  id="skill"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  required
                  disabled={!skills.length}
                >
                  <option value="" disabled>Select Skill</option>
                  {skills
                    .filter(skill => !skill.isSkillDeleted)
                    .map((skillObj, index) => (
                      <option key={index} value={skillObj.skillName}>
                        {skillObj.skillName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Must Have Checkbox */}
              <label htmlFor="mustHave"><b>Must Have</b></label>
              <input
                style={{ marginLeft: '10px' }}
                type="checkbox"
                id="mustHave"
                name="importance"
                checked={importance === 'Must Have'}
                onChange={(e) => {
                  setImportance(e.target.checked ? 'Must Have' : '');
                }}
              />

              {/* Button to add the selected genus, experienceRange, category, skill, and importance to the table */}
              <button type="button" className="btn-add" onClick={handleAddCategorySkill}>
                Add
              </button>
            </form>

            {/* Table to display the added information */}
            <div className="added-category-skill-list" style={{ background: 'white' }}>
              {/* <h2>Added Information</h2> */}
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Exp Range (Years)</th>
                    <th style={{ width: '20%' }}>Genus</th>
                    <th style={{ width: '30%' }}>Category</th>

                    <th style={{ width: '30%' }}>Skills</th>
                    <th style={{ width: '10%' }}>Must Have Skill</th>
                    <th style={{ width: '10%' }}>Course Duration</th>
                    {/* {isAnyFlaggedTrue && <th>Flagged</th>} */}
                  </tr>
                </thead>
                <tbody>
                  {newCategorySkillList.slice()
                    .sort((a, b) => {
                      // First, sort by experienceRange (numerically)




                      const [startA] = a.experienceRange.split('-').map(Number);
                      const [startB] = b.experienceRange.split('-').map(Number);
                      if (startA !== startB) {
                        return startA - startB;
                      }

                      // Then, sort by genus alphabetically
                      const genusCompare = a.genus.localeCompare(b.genus);
                      if (genusCompare !== 0) {
                        return genusCompare;
                      }

                      // Then, sort by category alphabetically within the same genus
                      const categoryCompare = a.category.name.localeCompare(b.category.name);
                      if (categoryCompare !== 0) {
                        return categoryCompare;
                      }


                      // Then, within the same category, prioritize "Must Have" skills
                      if (a.importance === 'Must Have' && b.importance !== 'Must Have') {
                        return -1; // a comes first
                      } else if (a.importance !== 'Must Have' && b.importance === 'Must Have') {
                        return 1; // b comes first
                      }

                      // Finally, sort by skill alphabetically within the same category
                      return a.skill.localeCompare(b.skill);
                    })
                    .map((entry, index, array) => {
                      const experienceRangeRowSpan = getExperienceRangeRowSpan(array, entry.experienceRange);
                      const genusRowSpan = getGenusRowSpan(array, entry.genus);
                      const categoryRowSpan = getCategoryRowSpan(array, entry.genus, entry.category.name);


                      // Find the category from the categories state
                      const category = categories.find(cat => cat._id === entry.category._id);
                      // Find the skill in the selected category
                      const skill = category?.skills.find(skill => skill.skillName === entry.skill);
                      // Get the course duration from the skill
                      const courseDuration = skill?.courseDuration || 'N/A';

                      return (
                        <tr key={index} className="master-row">
                          {/* Apply rowspan for the experienceRange if it's the first occurrence */}
                          {(index === 0 || array[index - 1].experienceRange !== entry.experienceRange) && (
                            <td rowSpan={experienceRangeRowSpan} style={{ width: '10%', textAlign: 'center' }}>
                              {entry.experienceRange}
                            </td>
                          )}

                          {/* Apply rowspan for the genus if it's the first occurrence */}
                          {(index === 0 || array[index - 1].genus !== entry.genus) && (
                            <td rowSpan={genusRowSpan} style={{ width: '20%' }}>
                              {entry.genus}
                            </td>
                          )}

                          {/* Apply rowspan for the category if it's the first occurrence within the same genus */}
                          {(index === 0 || array[index - 1].category.name !== entry.category.name || array[index - 1].genus !== entry.genus) && (
                            <td rowSpan={categoryRowSpan} style={{ width: '30%' }}>
                              {entry.category.name}
                            </td>
                          )}

                          <td style={{ width: '30%' }}>
                            <span style={{ display: 'flex', alignItems: 'center', wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word', maxWidth: '100%' }}>
                              <span style={{ flexGrow: 1 }}>{entry.skill}</span>
                              {entry.flagged && (
                                <img width="28px" height="28px" title="The skill is deleted or no longer in use." src="https://img.icons8.com/ios-filled/50/FA5252/flag--v1.png" alt="flag--v1" />
                              )}
                            </span>
                          </td>

                          <td style={{ width: '10%', textAlign: 'center' }}>
                            {entry.importance === 'Must Have' && (
                              <img
                                src="https://img.icons8.com/emoji/48/check-mark-button-emoji.png"
                                alt="Must Have"
                                title="Must Have"
                                style={{ width: '34px', height: '34px' }}
                              />
                            )}
                          </td>

                          {/* Display the dynamically fetched courseDuration */}
                          <td style={{ width: '10%', textAlign: 'center' }}>
                            {courseDuration} {/* Show courseDuration */}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>

              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MasterPlan;