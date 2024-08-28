//forums

const { createForum, updateForum, getAllForums, deleteForum, createReply, updateReply, deleteReply } = require("../controller/api/forum.controller");

const express=require('express');
const { userAuth } = require("../middleware/auth.middleware");
const router=express.Router();

//forum
router.use(userAuth);
router.get('/',getAllForums);
router.post('/',createForum);
router.put('/:id',updateForum)
router.delete('/:id',deleteForum);
//replies
router.post('/:forum_id/reply',createReply);
router.put('/:forum_id/reply/:reply_id',updateReply);
router.delete('/:forum_id/reply/:reply_id',deleteReply);
module.exports=router