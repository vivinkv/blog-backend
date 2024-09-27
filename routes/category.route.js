const express=require('express');
const { getAllCategory,getCategoryBasedBlog } = require('../controller/api/category.controller');
const router=express.Router();

router.get('/',getAllCategory);
router.get('/:id/:slug',getCategoryBasedBlog);


module.exports=router