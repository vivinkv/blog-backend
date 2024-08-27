//forums

const { createForum, updateForum, getAllForums, deleteForum } = require("../controller/api/forum.controller");

const express=require('express');
const router=express.Router();


router.get('/forums',getAllForums);
router.post('/forums',createForum);
router.put('/forum/:id',updateForum)
router.delete('/forum/:id',deleteForum);

module.exports=router