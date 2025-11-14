import fs from "fs";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const uploadDir = path.join(__dirname, "../../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to accept only Excel files
// const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//   const allowedMimeTypes = [
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
//     "application/vnd.ms-excel", // .xls
//   ];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only Excel files are allowed."));
//   }
// };

// Final multer upload instance
export const upload = multer({
  storage,
  // fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
