import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/adminModel.js";
import connectDB from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@petpal.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await Admin.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      role: "admin",
    });

    console.log("Admin seeded successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectRun) {
  await connectDB();
  await seedAdmin();
  await mongoose.connection.close();
}
