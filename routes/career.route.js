const express=require('express');
const { getAllJobs, getJobDetails, updateJob, deleteJob, createJob } = require('../controller/api/career.controller');
const { userAuth } = require('../middleware/auth.middleware');
const router=express.Router();


router.get('/',getAllJobs);
router.get('/:id',getJobDetails);
router.use(userAuth);
router.post('/',createJob);
router.put('/:id',updateJob);
router.delete('/:id',deleteJob);

module.exports=router;