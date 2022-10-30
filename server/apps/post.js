import { Router } from "express";
import { pool } from "../utils/db.js";

const postRouter = Router();
// _____________________________________________GetPost______________________________________________________________
postRouter.get("/", async (req, res) => {
    try {
      const category = req.query.category || "";
        console.log(req);
      let query = "";
      let values = [];
  
      if (category) {
        query = 
          `select posts.post_id,posts.user_id,posts.title,posts.content,posts.img_url,posts.video_url,posts.upvote_count,posts.downvote_count,posts.created_at,
            posts.updated_at from post_category inner join categories on post_category.category_id = 
            categories.category_id inner join posts on posts.post_id = post_category.post_id where category_name  = $1`;
        values = [category];
      } else {
        query = "select * from posts";
      }
  
      const posts = await pool.query(query, values);
      res.status(200).json({
        data: posts.rows,
      });
    } catch (err) {
      throw err;
    }
  });
// _____________________________________________GetPostById______________________________________________________________
postRouter.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
      const post = await pool.query(
        `select * from posts where user_id = $1`,[userId]);
      res.status(200).json({
        data: post.rows,
      });
    } catch (err) {
      throw err;
    }
  });

// _____________________________________________PostContent&Add_Cat______________________________________________________________
postRouter.post("/", async (req,res) => {

    const newPost = { user_id: req.body.user_id ,title: req.body.title, content: req.body.content, img_url: req.body.img_url,
        video_url: req.body.video_url,category_list: req.body.category_list, 
    created_at:new Date(), 
    updated_at: new Date()};
        let categoryId;
        const postCategoryId = []
    newPost.category_list.map( async (category) => { //[cat,pet]
            categoryId =  await pool.query(`select category_id from categories where category_name = $1`,[category]) 
            console.log(category);
        if (categoryId.rows.length === 0){
            categoryId =  await pool.query (`insert into categories (category_name) values ($1) returning category_id`,[category])//category is parameter
            console.log("Create New category");
            console.log(categoryId.rows[0].category_id);
        } postCategoryId.push(categoryId.rows[0].category_id) // = id in rows  postCategoryId = [1:cat,2:pet]
      })
          
      const  postId = await pool.query(`insert into posts (user_id, title, content, img_url, video_url, category_list, 
        created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8) returning post_id`, //post id = 1
    
        [   newPost.user_id,
            newPost.title,
            newPost.content,        
            newPost.img_url,
            newPost.video_url,
            newPost.category_list,
            newPost.created_at,
            newPost.updated_at,
            
        ])
        
        postCategoryId.map( async (category_id) =>{
           
            await pool.query(`insert into post_category (post_id,category_id) values ($1,$2)`,[
                postId.rows[0].post_id,
                category_id
            ])
        })
    return res.status(201).json({ message: "New Post has been created successfully"})
    })
// _____________________________________________DeletePost______________________________________________________________
    postRouter.delete("/:id", async (req, res) => {
        try {
          const postId = req.params.id;
          await pool.query(`delete from posts where post_id = $1`, [
            postId,
          ]);
      
          await pool.query(
            `delete from post_category where post_id = $1`,
            [postId]
          );
      
          res.status(200).json({
            message: "Post has been delete from your dashboard successfully",
          });
        } catch (err) {
          throw err;
        }
      });
// _____________________________________________UpdatePost______________________________________________________________
      postRouter.put("/:id", async (req, res) => {
        try {
          const postId = req.params.id;
          const updatedPost = {
            ...req.body,
            updated_at: new Date(),
          };
      
          await pool.query(
            `update posts set title = $1, content = $2, img_url = $3, video_url = $4, updated_at = $5 where post_id= $6`,
            [
              updatedPost.title,
              updatedPost.content,
              updatedPost.img_url,
              updatedPost.video_url,
              updatedPost.updated_at,
              postId,
            ]
          );
      
          res.status(200).json({
            message: "Post has been updated successfully",
          });
        } catch (err) {
          throw err;
        }
      });
// _____________________________________________VotePost______________________________________________________________

      postRouter.post("/users/:id/:VoteController", async (req, res) => {
        try {
          const postId = req.params.id;
          const userId = req.body.user_id;
          const votes = req.params.VoteController;
          
          const isSameUser = await pool.query(
            `select * from votes where post_id = $1 and user_id = $2`,
            [postId, userId]
          );
      
          if (isSameUser.rows.length === 0) {
            await pool.query(
              `insert into votes (user_id,post_id,vote) values($1,$2,$3)`,
              [userId, postId, votes]
            );
          } else if (isSameUser.rows[0].vote == votes) {
            await pool.query(
              `update votes set vote = Null where post_id = $1 and user_id = $2`,
              [postId, userId]
            );
          } else {
            await pool.query(
              `update votes set vote = $1 where post_id = $2 and user_id = $3`,
              [votes, postId, userId] //change
            );
          }
      
          //update upvote and downvote
          const updateLike = await pool.query(
            `select count(votes) from votes where post_id = $1 and vote = $2`,
            [postId, true]
          );
      
          const updateUnlike = await pool.query(
            `select count(votes) from votes where post_id = $1 and vote = $2`,
            [postId, false]
          );
      
          await pool.query(
            `update posts set upvote_count = $1, downvote_count = $2 where post_id = $3`,
            [updateLike.rows[0].count, updateUnlike.rows[0].count, postId]
          );
      
          res.status(200).json({ message: "Successfully" });
        } catch (err) {
          throw err;
        }
      });
    
      
export default postRouter;
   