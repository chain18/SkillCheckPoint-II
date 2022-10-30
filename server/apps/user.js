import { Router } from "express";
import { pool } from "../utils/db.js";

const userRouter = Router();

userRouter.get("/", async (req, res) => {
  const usersData = await pool.query(`select * from users`);
  return res.status(200).json({
    data: usersData.rows,
  });
});

userRouter.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const userData = await pool.query(`select * from users where user_id = $1`, [
    userId,
  ]);

  return res.status(200).json({
    data: userData.rows,
  });
});

userRouter.post("/", async (req, res) => {
  const newUser = {
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    created_at: new Date(),
    updated_at: new Date(),
    last_login: new Date(),
  };

  await pool.query(
    `insert into users (username, password, firstname, lastname,
    created_at, last_login, updated_at) values ($1,$2,$3,$4,$5,$6,$7)`,

    [
      newUser.username,
      newUser.password,
      newUser.firstname,
      newUser.lastname,
      newUser.created_at,
      newUser.last_login,
      newUser.updated_at,
    ]
  );
  return res
    .status(201)
    .json({ message: "New user has been created successfully" });
});

userRouter.get("/", async (req, res) => {
  const userData = await pool.query(`select * from users`);
  return res.status(200).json({ data: userData.rows, message: "Succesfully" });
});

userRouter.put("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = {
      ...req.body,
      updated_at: new Date(),
    };

    await pool.query(
      `update users set username = $1, password = $2, firstname = $3 , lastname =$4 where user_id= $5`,
      [
        updatedUser.username,
        updatedUser.password,
        updatedUser.firstname,
        updatedUser.lastname,
        userId,
      ]
    );

    res.status(200).json({
      message: "User data has been updated successfully",
    });
  } catch (err) {
    throw err;
  }
});

userRouter.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query(`delete from users where user_id = $1`, [userId]);
    res.status(200).json({
      message: "User data has been delete successfully",
    });
  } catch (err) {
    throw err;
  }
});
export default userRouter;
