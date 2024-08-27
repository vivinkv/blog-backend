//forums

const { createForum, updateForum, getAllForums, deleteForum } = require("../controller/api/forum.controller");

const express=require('express');
const router=express.Router();


router.get('/',getAllForums);
router.post('/',createForum);
router.put('/:id',updateForum)
router.delete('/:id',deleteForum);

module.exports=router