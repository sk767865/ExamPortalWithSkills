import React, { useState, useEffect, useContext, useRef } from 'react';
import './AddExperience.css';
import AuthContext from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

const AddExperience = () => {
  const [experienceStart, setExperienceStart] = useState('');
  const [experienceEnd, setExperienceEnd] = useState('');
  const [genus, setGenus] = useState('');
  const [mappings, setMappings] = useState([]);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [editingGenusIndex, setEditingGenusIndex] = useState(null); // Track which Genus is being edited
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null); // Track which Experience Range is being edited
  const [editExperienceRange, setEditExperienceRange] = useState('');
  const [editGenus, setEditGenus] = useState('');
  const inputRef = useRef(null); // Reference for click outside

  useEffect(() => {
    const fetchMappings = async () => {
      setLoading(true);
      try {
        const res = await apiClient(token).get('/api/experience-genus');
        const sortedData = sortMappings(res.data); // Sort the fetched data
        setMappings(sortedData);
      } catch (err) {
        console.error('Error fetching experience-genus mappings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMappings();
  }, [token]);

  const sortMappings = (mappings) => {
    const sortedMappings = mappings.slice().sort((a, b) => {
      const [startA, endA] = a.experienceRange.split('-').map(Number);
      const [startB, endB] = b.experienceRange.split('-').map(Number);

      if (startA !== startB) {
        return startA - startB;
      }
      return endA - endB;
    });
    return sortedMappings;
  };

  const handleAddMapping = async (e) => {
    e.preventDefault();

    const start = parseInt(experienceStart);
    const end = parseInt(experienceEnd);

    if (!experienceStart || !experienceEnd || !genus) {
      toast.error('Please fill all the fields', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (start >= end) {
      toast.error('Invalid experience range: Start should be less than End', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    for (let mapping of mappings) {
      const [existingStart, existingEnd] = mapping.experienceRange.split('-').map(Number);
      if (
        (start !== existingStart || end !== existingEnd) &&
        ((start >= existingStart && start < existingEnd) ||
          (end > existingStart && end <= existingEnd) ||
          (start < existingStart && end > existingEnd))
      ) {
        toast.error('Invalid experience range: The new range overlaps with or cuts an existing range.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
    }

    const experienceRange = `${experienceStart}-${experienceEnd}`;

    try {
      const res = await apiClient(token).post('/api/experience-genus/add', { genus, experienceRange });

      if (res.data) {
        setMappings(sortMappings([...mappings, res.data]));
        setExperienceStart('');
        setExperienceEnd('');
        setGenus('');
        toast.success('Experience and Genus added successfully!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      console.error('Error adding experience-genus mapping:', err);
      toast.error('Failed to add experience-genus mapping. Please try again.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleEditGenus = (index) => {
    setEditingGenusIndex(index);
    setEditGenus(mappings[index].genus);
    setEditingExperienceIndex(null);
  };

  const handleEditExperience = (index) => {
    setEditingExperienceIndex(index);
    setEditExperienceRange(mappings[index].experienceRange);
    setEditingGenusIndex(null);
  };

  const handleSaveEdit = async (index) => {
    const { _id, genus: currentGenus, experienceRange: currentExperienceRange } = mappings[index];

    try {
      let updatedData = { id: _id };
      let hasChanged = false;

      // Update experience range if changed
      if (editingExperienceIndex === index && editExperienceRange !== currentExperienceRange) {
        const [start, end] = editExperienceRange.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start >= end) {
          toast.error('Invalid Experience Range. Ensure format is correct (e.g., 1-2).');
          return;
        }

        // Prevent cross-cutting by checking overlapping ranges but allow exact duplicates
        const isCrossCutting = mappings.some((mapping, i) => {
          if (i === index) return false; // Ignore the current index
          const [existingStart, existingEnd] = mapping.experienceRange.split('-').map(Number);

          // Allow duplicates but prevent cross-cutting (overlapping)
          return !(
            (start === existingStart && end === existingEnd) || // Allow exact duplicates
            (end <= existingStart || start >= existingEnd)      // Allow non-overlapping ranges
          );
        });

        if (isCrossCutting) {
          toast.error('Invalid Experience Range: The new range overlaps with an existing range.', {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return;
        }
        updatedData.experienceRange = `${start}-${end}`;
        hasChanged = true;
      } else {
        updatedData.experienceRange = currentExperienceRange;
      }

      // Update genus if changed
      if (editingGenusIndex === index && editGenus !== currentGenus) {
        updatedData.genus = editGenus;
        hasChanged = true;
      } else {
        updatedData.genus = currentGenus;
      }

      // Log the data to check if the correct genus is being sent
      console.log('Data sent to API:', updatedData);

      if (hasChanged) {
        const res = await apiClient(token).put('/api/experience-genus/edit-experience', updatedData);

        if (res.data) {
          const updatedMappings = [...mappings];
          updatedMappings[index] = res.data.updatedMapping;
          setMappings(sortMappings(updatedMappings));
          toast.success('Mapping updated successfully!');
        }

        setEditingGenusIndex(null);
        setEditingExperienceIndex(null);
      }


      setEditingGenusIndex(null);
      setEditingExperienceIndex(null);


    } catch (err) {
      console.error('Error updating mapping:', err);
      toast.error('Failed to update mapping.');
    }
  };


  const handleDelete = (index) => {
    const { genus } = mappings[index]; // Get the genus name dynamically
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the genus: "${genus}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            const { _id, genus } = mappings[index];
            try {
              const res = await apiClient(token).delete('/api/experience-genus/delete', {
                data: { _id, genus },
              });

              if (res.status === 200) {
                const updatedMappings = mappings.filter((_, i) => i !== index);
                setMappings(sortMappings(updatedMappings));
                setEditingGenusIndex(null); // Reset genus edit state
                setEditingExperienceIndex(null); // Reset experience range edit state
                toast.success('Mapping deleted successfully!');
              }
            } catch (error) {
              if (error.response && error.response.status === 400) {
                toast.error('Genus exists in master data. Deletion not allowed.');
              } else {
                toast.error('Failed to delete genus. Please try again.');
              }
              console.error('Error during deletion:', error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {
            setEditingGenusIndex(null); // Close the genus edit box
            setEditingExperienceIndex(null); // Close the experience edit box
            toast.info('Deletion cancelled');
          }
        }
      ]
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        (editingGenusIndex !== null || editingExperienceIndex !== null)
      ) {
        if (editingGenusIndex !== null) {
          handleSaveEdit(editingGenusIndex);
        }
        if (editingExperienceIndex !== null) {
          handleSaveEdit(editingExperienceIndex);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingGenusIndex, editingExperienceIndex, editExperienceRange, editGenus]);

  return (
    <>
      <header className="header-container">
        <h1>Add Genus</h1>
      </header>

      <div className="add-experience-genus-container">
        {loading ? (
          <div className="loading-container">
            <CircularProgress />
          </div>
        ) : (
          <>
            <form onSubmit={handleAddMapping} className="add-experience-genus-form">
              <div className="form-group">
                <label htmlFor="experienceRange">Experience Range</label>
                <select
                  id="experienceStart"
                  value={experienceStart}
                  onChange={(e) => setExperienceStart(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Start
                  </option>
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <span>{' to '}</span>
                <select
                  id="experienceEnd"
                  value={experienceEnd}
                  onChange={(e) => setExperienceEnd(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select End
                  </option>
                  {Array.from({ length: 16 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="genus">Genus</label>
                <input
                  type="text"
                  id="genus"
                  value={genus}
                  onChange={(e) => setGenus(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-add">
                Add
              </button>
            </form>

            <div className="mapping-list">
              <h2>Experience and Genus</h2>
              <table style={{ background: 'white', width: "50%" }}>
                <thead>
                  <tr>
                    <th style={{ width: '10%', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Experience Range</th>
                    <th style={{ width: '40%' }}>Genus</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping, index, self) => {
                    // Check if the current experience range is the first occurrence
                    const isFirstOccurrence = self.findIndex(
                      (item) => item.experienceRange === mapping.experienceRange
                    ) === index;

                    // Count how many rows have the same experience range
                    const rowSpanCount = self.filter(
                      (item) => item.experienceRange === mapping.experienceRange
                    ).length;

                    return (
                      <tr key={index}>
                        {/* Render the experience range only for the first occurrence */}
                        {isFirstOccurrence && (
                          <td
                            rowSpan={rowSpanCount} // Span the experience range across rows with the same range
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle', // Vertically center the content
                              border: '1px solid #ddd',
                            }}
                            // onDoubleClick={() => handleEditExperience(index)}
                          >
                            {editingExperienceIndex === index ? (
                              <input
                                ref={inputRef}
                                type="text"
                                value={editExperienceRange}
                                onChange={(e) => setEditExperienceRange(e.target.value)}
                                autoFocus
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            ) : (
                              mapping.experienceRange
                            )}
                          </td>
                        )}

                        <td onDoubleClick={() => handleEditGenus(index)}>
                          {editingGenusIndex === index ? (
                            <>
                              <input
                                ref={inputRef}
                                type="text"
                                value={editGenus}
                                onChange={(e) => setEditGenus(e.target.value)}
                                autoFocus
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                              <button
                                className="delete-btn"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleDelete(index);
                                }}
                              >
                                ✖
                              </button>
                            </>
                          ) : (
                            mapping.genus
                          )}
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

export default AddExperience;
