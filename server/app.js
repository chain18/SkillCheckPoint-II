import express  from "express";
import bodyParser from "body-parser";
import userRouter from "./apps/user.js";
import postRouter from "./apps/post.js";
import replyRouter from "./apps/reply.js";

const app = express();
const PORT = 4000; 
app.use(bodyParser.json());

app.use("/users",userRouter);
app.use("/posts",postRouter);
app.use("/posts",replyRouter);

app.listen(PORT, () => { console.log(`Server start at Port ${PORT}`); });

