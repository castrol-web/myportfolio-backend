import express from "express";
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import Works from "../models/Works.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import crypto from "crypto";
import Skills from "../models/Skills.js";
import Testimonials from "../models/Testimonials.js";
import Brands from "../models/Brands.js";
import Contact from "../models/Contact.js";
import WorkExperience from "../models/WorkExperience.js";

const router = express.Router();
router.use(cors());

// Check for environment variables
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.AWS_BUCKET_NAME) {
    throw new Error("Missing required AWS environment variables.");
}

//s3 credentials
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;


//s3 object
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: region
})

//image storage in memory
const storage = multer.memoryStorage();

//upload object
const upload = multer({ storage: storage });

//random image name
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");



//upload testimonial
router.post("/upload-testimonial", upload.single("ImageUrl"), async (req, res) => {
    try {
        const { name, Company, Feedback } = req.body;
        if (!name || !Company || !Feedback) {
            return res.status(400).json({ message: "All fields are required!" })
        }
        if (!req.file || !req.file.buffer) {
            return res.status(404).json({ message: "file not found" })
        }
        //icon name
        const imageurl = randomImageName();
        //params for s3 bucket
        const params = {
            Bucket: bucketName,
            Key: imageurl,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        //command 
        const command = new PutObjectCommand(params);
        //send to s3
        await s3.send(command);
        //save to db
        const newTestimonial = new Testimonials({
            name,
            Company,
            Feedback,
            ImageUrl: imageurl
        })
        await newTestimonial.save();
        res.status(201).json({ message: "Testimonial uploaded Successfully" });
    } catch (error) {
        console.error("Error uploading Testimonial:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



//contact me route
router.post("/contact-me", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required!" });
        }
        const newContact = new Contact({
            name,
            email,
            message,
        })
        await newContact.save();
        return res.status(201).json({ message: "Message Sent Successfully!" })

    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});





//getting all the projects worked for
router.get("/project-works", async (req, res) => {
    try {
        const projects = await Works.find({});
        if (!projects) {
            return res.status(404).json({ message: "no projects found" })
        }
        const ProjectArray = [];
        //getting image url from each project
        const projectPromise = projects.map(async (project) => {
            const url = await generateSignedUrl(project.imageUrl);
            //pushing in the project array
            ProjectArray.push({ project, photoUrl: url });
        });
        await Promise.all(projectPromise);
        return res.status(201).json({ ProjectArray });

    } catch (error) {
        console.error("Error generating works:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


//fetching testimonial
router.get("/get-testimonial", async (req, res) => {
    try {
        const testimonials = await Testimonials.find({});
        if (!testimonials) {
            return res.status(404).json({ message: "no testimonial found!" })
        }
        //initialize skill array
        const testimonialArray = [];
        const testimonialPromise = testimonials.map(async (testimonial) => {
            //generating url from s3
            const url = await generateSignedUrl(testimonial.ImageUrl);
            testimonialArray.push({ testimonial, ImageUrl: url })
        })
        await Promise.all(testimonialPromise)
        return res.status(201).json({ testimonialArray });
    } catch (error) {
        console.error("Error generating testimonials:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//fetching brands
router.get("/get-brands", async (req, res) => {
    try {
        const brands = await Brands.find({});
        if (!brands) {
            return res.status(404).json({ message: "no brands found!" })
        }
        //initialize skill array
        const brandsArray = [];
        const brandsPromise = brands.map(async (brand) => {
            //generating url from s3
            const url = await generateSignedUrl(brand.ImageUrl);
            brandsArray.push({ brand, ImageUrl: url })
        })
        await Promise.all(brandsPromise)
        return res.status(201).json({ brandsArray });
    } catch (error) {
        console.error("Error generating brands:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})


//fetching skills
router.get("/get-skills", async (req, res) => {
    try {
        const skills = await Skills.find({});
        if (!skills) {
            return res.status(404).json({ message: "no skill found!" })
        }
        //initialize skill array
        const skillArray = [];
        const skillPromise = skills.map(async (skill) => {
            //generating url from s3
            const url = await generateSignedUrl(skill.Icon);
            skillArray.push({ skill, Icon: url })
        })
        await Promise.all(skillPromise)
        return res.status(201).json({ skillArray });
    } catch (error) {
        console.error("Error generating skills:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})
router.get("/get-experience", async (req, res) => {
    try {
        const experience = await WorkExperience.find({});
        if (!experience) {
            return res.status(404).json({ message: "no experience found!" })
        }
        return res.status(201).json(experience);
    } catch (error) {
        console.error("Error generating experience:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

//generate signed image url
async function generateSignedUrl(imageUrl) {
    //object params to fetch the image
    const params = {
        Bucket: bucketName,
        Key: imageUrl,
    };
    //command
    const command = new GetObjectCommand(params);
    //get the url
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}


export default router;