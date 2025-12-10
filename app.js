import cookieParser from "cookie-parser";
import express from "express";
import errorMiddleware from "./middleware/error.middleware.js";
import testRoutes from "./Router/test.route.js";
import userRoutes from "./Router/user.route.js";
import topicRoutes from "./Router/topic.route.js";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "https://skillhub-frontend-tawny.vercel.app/",
    ],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("SkillHub Backend Running ✅");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/test", testRoutes);
app.use("/api/v1", topicRoutes);

app.use(errorMiddleware);

export default app;
