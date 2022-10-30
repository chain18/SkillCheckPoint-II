import { Router } from "express";
import { pool } from "../utils/db.js";


const replyRouter = Router();

replyRouter.post('/:id/replies' , async (req,res) => {
    const newReply = {...req.body , 
        created_at: new Date(),
        updated_at: new Date()};

        await pool.query(
            `insert into replies (user_id, post_id, content, img_url, 
                video_url, created_at, updated_at) values ($1,$2,$3,$4,$5,$6,$7)` ,
                [
                    newReply.user_id,
                    newReply.post_id,
                    newReply.content,
                    newReply.img_url,
                    newReply.video_url,
                    newReply.created_at,
                    newReply.updated_at
                ]
        );
        res.status(200).json({message: "Create new reply successfully"})
})

replyRouter.get("/:id/replies", async (req, res) => {
    try {
      const postId = req.params.id;
      const replies = await pool.query(
        `select * from replies where post_id = $1`,
        [postId]
      );
      res.status(200).json({
        data: replies.rows,
      });
    } catch (err) {
      throw err;
    }
  });

  replyRouter.post("/:id/replies/:agreement", async (req, res) => {
    try {
      const isAgree = req.params.agreement;
      const replyId = req.body.reply_id;
      const agree = await pool.query(
        `select count_agree from replies where reply_id = $1`,
        [replyId]
      );
  
      if (isAgree === true) {
        const updateCount = agree.rows[0].count_agree + 1;
        await pool.query(
          `update replies set count_agree = $1 where reply_id = $2`,
          [updateCount, replyId]
        );
      } else {
        const updateCount = agree.rows.count_agree - 1; // const updateCount = agree.rows[0].count_agree - 1;
        await pool.query(
          `update replies set count_agree = $1 where reply_id = $2`,
          [updateCount, replyId]
        );
      }
      return res.status(200).json({ message: "Sucessfully!" });
    } catch (err) {
      throw err;
    }
  });


  
export default replyRouter;