//forums

const { createForum, updateForum, getAllForums, deleteForum, createReply, updateReply, deleteReply } = require("../controller/api/forum.controller");

const express=require('express');
const router=express.Router();

//forum
router.get('/',getAllForums);
router.post('/',createForum);
router.put('/:id',updateForum)
router.delete('/:id',deleteForum);
//replies
router.post('/:blog_id/reply',createReply);
router.put('/reply/:id',updateReply);
router.delete('/reply/:id',deleteReply);
module.exports=router