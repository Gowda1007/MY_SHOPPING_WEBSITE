const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectToDb = require("./db/db");
const cookieParser = require("cookie-parser");


const authRouter = require("./routes/auth.routes")
const userRouter = require("./routes/user.routes");
const sellerRouter = require("./routes/seller.routes");
const productsRouter = require("./routes/products.routes");
const paymentRouter = require("./routes/payment.routes");
const recommendationRouter = require("./routes/recommendation.routes");

connectToDb();
const app = express();

const corsOptions = {
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true,
};




app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


app.use("/user", userRouter);
app.use("/seller", sellerRouter);
app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/payment", paymentRouter);
app.use("/recommendations", recommendationRouter);

module.exports = app;
