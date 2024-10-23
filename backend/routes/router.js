import express from 'express';
import auth from '../middleware/auth.js';
import { changePassword, getAllUsers, login, register, testRegister, uploadProfileImage,getAllTrainees } from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';
import { addSkill, getAllCategories,toggleSkillDeleted,editCategoryName,editSkill,toggleCategoryDeleted,addCategoriesAndSkills ,editCourseDuration} from '../controllers/categoryController.js';
import {  addExperienceGenusMapping, getAllExperienceGenusMappings,editGenus ,editExperience,deleteExperienceGenusMapping,addMultipleExperienceGenusMappings} from '../controllers/experienceGenusController.js';
import {getAllMasterEntries,addMasterEntry,updateMasterSkill,deleteAllMasterData,addMultipleMasterEntries,getMasterEntriesByGenus} from '../controllers/masterController.js';

import {createTraineePlanDetails,getAllTraineePlanDetails,updatePlanningDetailsForUser}  from '../controllers/TraineePlanDetailsController.js'



const router = express.Router();



router.post('/create-trainee-plan-detail',adminAuth,createTraineePlanDetails);
router.get('/trainee-plan-getall',auth,getAllTraineePlanDetails);
router.put('/update-trainee-plan',adminAuth,updatePlanningDetailsForUser);





router.post('/testing/add', testRegister)
router.post('/register', adminAuth, register);
router.post('/login', login);
router.get('/all-users', auth, getAllUsers);

router.get('/all-trainee', adminAuth, getAllTrainees);
router.put('/change-password', auth, changePassword)
router.post('/upload-image', auth, uploadProfileImage);








router.post("/categories/addallskill",adminAuth, addCategoriesAndSkills)

router.post("/categories/add-skill",adminAuth, addSkill)
router.post('/categories/delete-skill', adminAuth, toggleSkillDeleted);
router.post('/categories/delete-category', adminAuth, toggleCategoryDeleted);
router.get("/categories", adminAuth, getAllCategories)
router.post('/categories/edit-category-name', adminAuth, editCategoryName);
router.post('/categories/edit-skill', adminAuth, editSkill);

router.post('/categories/edit-course-duration', editCourseDuration);








router.post('/experience-genus/addmultiple', adminAuth, addMultipleExperienceGenusMappings);


router.post('/experience-genus/add', adminAuth, addExperienceGenusMapping);
router.get('/experience-genus', adminAuth, getAllExperienceGenusMappings);
router.put('/experience-genus/edit-genus',adminAuth,editGenus);
router.put('/experience-genus/edit-experience',adminAuth,editExperience);
router.delete('/experience-genus/delete', adminAuth, deleteExperienceGenusMapping);
























router.post('/add-allmasterData', adminAuth, addMultipleMasterEntries);

router.get('/getAllMasterData', adminAuth, getAllMasterEntries);
router.post('/add-masterData', adminAuth, addMasterEntry);
router.post('/update-skill',adminAuth, updateMasterSkill);
router.delete('/delete-all',adminAuth, deleteAllMasterData);

router.post('/get-by-genus',adminAuth, getMasterEntriesByGenus);







export default router;






