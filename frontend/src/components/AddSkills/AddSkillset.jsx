import React, { useState, useEffect, useContext, useRef } from 'react';
import './AddSkillset.css';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { toast } from 'react-toastify';



const AddSkillset = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState(''); // Kept the original state for editing categories
  const [skill, setSkill] = useState(''); // Kept the original state for editing skills
  const [newCategoryInput, setNewCategoryInput] = useState(''); // For adding new category
  const [newSkillInput, setNewSkillInput] = useState(''); // For adding new skill
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isNewCategoryInputEnabled, setIsNewCategoryInputEnabled] = useState(false);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true); // State to track loading

  const [courseDuration, setCourseDuration] = useState(''); // For editing course duration
  const [newCourseDurationInput, setNewCourseDurationInput] = useState(''); // For adding course duration

  const [editingCourseDuration, setEditingCourseDuration] = useState(null);


  const deleteButtonRef = useRef(null);

  useEffect(() => {
    setLoading(true); // Start loading
    const fetchCategories = async () => {
      try {
        const res = await apiClient(token).get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchCategories();
  }, [token]);

  const handleAddSkill = async (e) => {
    e.preventDefault();

    const categoryToUse = isNewCategoryInputEnabled ? newCategoryInput : selectedCategory;

    if (!categoryToUse || !newSkillInput || !newCourseDurationInput) {
      toast.error('Please enter a valid category and skill.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const res = await apiClient(token).post('/api/categories/add-skill', {
        categoryName: categoryToUse,
        skill: newSkillInput,
        courseDuration: newCourseDurationInput,
      });

      if (res.data) {
        setCategories(res.data);
        setSelectedCategory('');
        setNewCategoryInput('');
        setNewSkillInput('');
        setIsNewCategoryInputEnabled(false);
        toast.success('Skill added successfully!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      toast.error('Failed to add skill. Please try again.', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDeleteSkill = async (categoryName, skillName) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the skill: "${skillName}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await apiClient(token).post('/api/categories/delete-skill', {
                categoryName,
                skill: skillName,
              });
              const res = await apiClient(token).get('/api/categories');
              setCategories(res.data);

              // Show success notification
              toast.success('Skill deleted successfully!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            } catch (err) {
              toast.error('Failed to delete skill. Please try again.', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          }
        },
        {
          label: 'No',
          onClick: () => {
            // Do nothing, just close the dialog
          }
        }
      ]
    });
  };


  const handleEditSkill = (categoryName, skillId, oldSkill, oldCourseDuration) => {
    setEditingSkill({ categoryName, skillId, oldSkill }); // Use skillId for editing instead of skillName
    setSkill(oldSkill); // Set the skill to the current skill to allow editing
    // setEditingCourseDuration(null); // Close the course duration editing
  };
  const handleEditCourseDuration = (categoryName, skillId, oldCourseDuration) => {
    setEditingCourseDuration({ categoryName, skillId }); // Track the skill being edited for course duration
    setCourseDuration(oldCourseDuration); // Set the course duration for editing
  };




  const handleUpdateSkill = async (categoryName, oldSkill) => {
    try {
      // 1. Update the skill in the categories
      await apiClient(token).post('/api/categories/edit-skill', {
        categoryName,
        oldSkill,
        newSkill: skill,
        courseDuration
      });

      // 2. Update the skill in the Master table
      await apiClient(token).post('/api/update-skill', { // Make sure this is your route
        oldSkill,
        newSkill: skill,
      });

      // Fetch the updated categories
      const res = await apiClient(token).get('/api/categories');
      setCategories(res.data);
      setEditingSkill(null); // Clear editing mode
      setSkill(''); // Clear the input field
    } catch (err) {
      console.error('Error updating skill:', err);
    }
  };

  const handleUpdateCourseDuration = async (categoryName, oldSkill, courseDuration) => {
    try {
      await apiClient(token).post('/api/categories/edit-course-duration', {
        categoryName,
        oldSkill,
        courseDuration,
      });

      const res = await apiClient(token).get('/api/categories');
      setCategories(res.data);
      setEditingCourseDuration(null); // Clear editing mode
      setCourseDuration(''); // Clear input
    } catch (err) {
      console.error('Error updating course duration:', err);
    }
  };



  // Start editing category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
  };

  // Update the category name and close input when blur event occurs (but not when clicking delete)
  const handleUpdateCategory = async (oldCategoryName, e) => {
    if (deleteButtonRef.current && deleteButtonRef.current.contains(e.relatedTarget)) {
      return; // Ignore blur if the target is the delete button
    }

    if (newCategory === oldCategoryName || !newCategory.trim()) {
      setEditingCategory(null); // If name hasn't changed or is empty, close editing mode
      return;
    }

    try {
      await apiClient(token).post('/api/categories/edit-category-name', {
        categoryName: oldCategoryName,
        newCategoryName: newCategory,
      });

      const res = await apiClient(token).get('/api/categories');
      setCategories(res.data);
      setEditingCategory(null); // Clear editing mode
      setNewCategory(''); // Clear the input field
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  // Delete category and remove its row
  const handleDeleteCategory = async (categoryName) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the category: "${categoryName}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await apiClient(token).post('/api/categories/delete-category', {
                categoryName,
              });

              // Remove the deleted category from the state
              setCategories(prevCategories => prevCategories.filter(category => category.name !== categoryName));

              // Show success notification
              toast.success('Category deleted successfully!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            } catch (err) {
              toast.error('Failed to delete category. Please try again.', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            }
          }
        },
        {
          label: 'No',
          onClick: () => {
            // Close the dialog without any action
          }
        }
      ]
    });
  };


  return (

    <>

      <header className="header-container">
        <h1>Add Categories and Skills</h1>
        {/* <h2>Streamline Your Testing with the QA Master Plan</h2> */}
      </header>


      <div className="add-skillset-container">

        {loading ? (<div className="loading-container">
          <CircularProgress />
        </div>) : (
          <>
            <form onSubmit={editingSkill ? handleUpdateSkill : handleAddSkill} className="add-skillset-form">


              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'new-category') {
                      setIsNewCategoryInputEnabled(true);
                      setSelectedCategory('new-category');
                    } else {
                      setIsNewCategoryInputEnabled(false);
                      setSelectedCategory(value);
                    }
                  }}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories
                    .filter(category => !category.isCategoryDeleted) // Filter out deleted categories
                    .map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  <option value="new-category">Add New Category</option>
                </select>
              </div>

              {/* Always show the input box but disable it by default */}
              <div className="form-group" id="new-category-group">
                <label htmlFor="newCategory">New Category Name</label>
                <input
                  type="text"
                  id="newCategory"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  disabled={!isNewCategoryInputEnabled} // Enable only if "Add New Category" is selected
                  required={isNewCategoryInputEnabled} // Make required only when enabled
                  style={{
                    backgroundColor: !isNewCategoryInputEnabled ? '#eaeaea' : 'white', // Set grey background if disabled
                  }}
                />
              </div>


              <div className="form-group">
                <label htmlFor="skill">{editingSkill ? 'Skill' : 'Skill'}</label>
                <input
                  type="text"
                  id="skill"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="courseDuration">Course Duration</label>
                <input
                  type="text"
                  id="courseDuration"
                  value={newCourseDurationInput}
                  onChange={(e) => setNewCourseDurationInput(e.target.value)}
                  required
                />
              </div>


              <button type="submit" className="btn-add">
                {editingSkill ? 'Add' : 'Add'}
              </button>
            </form>

            <div className="category-list">
              <h2>Categories and Skills</h2>
              <table style={{ background: 'white', width: '60%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '20%', textAlign: 'center' }}>Category</th>
                    <th style={{ width: '70%' }}>Skills</th>
                    <th style={{ width: '10%' }}>Course Duration</th>

                  </tr>
                </thead>
                <tbody>
                  {categories
                    .filter((category) => !category.isCategoryDeleted) // Filter out deleted categories
                    .map((category) => (
                      <tr key={category._id}>
                        {/* Category Name Column */}
                        <td className="table-skill" style={{ textAlign: 'center' }}>
                          {editingCategory && editingCategory._id === category._id ? (
                            <div className="category-edit">
                              <input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onBlur={(e) => handleUpdateCategory(category.name, e)} // Update category name when focus is lost
                                autoFocus
                              />
                              <button
                                className="delete-btn"
                                ref={deleteButtonRef}
                                onClick={() => handleDeleteCategory(category.name)}
                              >
                                ✖
                              </button>
                            </div>
                          ) : (
                            <span onDoubleClick={() => handleEditCategory(category)}>{category.name}</span>
                          )}
                        </td>

                        {/* Skill Name Column */}
                        <td>
                          {category.skills
                            .filter((skill) => !skill.isSkillDeleted) // Ensure only non-deleted skills are shown
                            .map((skillObj, index, filteredSkills) => (
                              <React.Fragment key={index}>
                                <div className="skill-row">
                                  {editingSkill && editingSkill.skillId === skillObj._id ? (
                                    <input
                                      className="skill-input editing-input"
                                      value={skill}
                                      onChange={(e) => setSkill(e.target.value)}
                                      onBlur={() =>
                                        handleUpdateSkill(category.name, skillObj.skillName, skillObj._id)
                                      } // Save when focus is lost
                                    />
                                  ) : (
                                    <span
                                      className="skill-text"
                                      onDoubleClick={() =>
                                        handleEditSkill(category.name, skillObj._id, skillObj.skillName, skillObj.courseDuration)
                                      }
                                    >
                                      {skillObj.skillName}
                                    </span>
                                  )}

                                  {/* Conditionally show the delete button only when the skill is in edit mode */}
                                  {editingSkill && editingSkill.skillId === skillObj._id && (
                                    <button
                                      className="delete-btn"
                                      onClick={() => handleDeleteSkill(category.name, skillObj.skillName)}
                                    >
                                      ✖
                                    </button>
                                  )}
                                </div>

                                {/* Add a separator only between skills, not after the last one */}
                                {index < filteredSkills.length - 1 && <hr className="skill-separator" />}
                              </React.Fragment>
                            ))}
                        </td>

                       
                        {/* Course Duration Column */}
                        <td>
                          {category.skills
                            .filter((skill) => !skill.isSkillDeleted)
                            .map((skillObj, index, filteredSkills) => (
                              <React.Fragment key={skillObj._id}>
                                {/* Display course duration for each skill */}
                                {editingCourseDuration && editingCourseDuration.skillId === skillObj._id ? (
                                  <input
                                    className="course-duration-input editing-input-duration"
                                    value={courseDuration}
                                    onChange={(e) => setCourseDuration(e.target.value)}
                                    onBlur={() =>
                                      handleUpdateCourseDuration(category.name, skillObj.skillName, courseDuration)
                                    }
                                  />
                                ) : (
                                  <span
                                    className="course-duration-text"
                                    onDoubleClick={() =>
                                      handleEditCourseDuration(category.name, skillObj._id, skillObj.courseDuration)
                                    }
                                  >
                                    {skillObj.courseDuration}
                                  </span>
                                )}

                                {/* Add separator only if there are multiple skills and this is not the last one */}
                                {index < filteredSkills.length - 1 && <hr className="course-duration-separator" />}
                              </React.Fragment>
                            ))}
                        </td>



                      </tr>
                    ))}
                </tbody>


              </table>
            </div>
          </>)}
      </div>
    </>

  );
};

export default AddSkillset;
