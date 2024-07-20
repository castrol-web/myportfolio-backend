import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import usersRoutes from "./routes/admin.js"
dotenv.config();
const app = express();

//cross origin middleware 
app.use(cors({
    origin: ["http://localhost:3001"],
    methods: ['GET', 'PUT', 'DELETE', 'POST'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongooseUrl = process.env.MONGOOSE_CONNECTION;
//Database connection
try {
    await mongoose.connect(mongooseUrl);
    console.log("DB connection successful");
} catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
}


app.use("/api/users", usersRoutes);

const port = process.env.PORT || 8050
//listening port 
app.listen(port, "0.0.0.0", function (err) {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`listening on localhost:${port}`);
})