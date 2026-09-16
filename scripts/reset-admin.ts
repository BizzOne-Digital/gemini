import "./load-env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AdminUser from "../src/models/AdminUser";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/homestyle-diner";
const email = (process.env.ADMIN_SEED_EMAIL || "admin@homestylediner.ca").toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD || "Admin@Homestyle2024!";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const hashed = await bcrypt.hash(password, 12);

  const user = await AdminUser.findOneAndUpdate(
    { email },
    {
      name: "Super Admin",
      email,
      password: hashed,
      role: "super_admin",
      isActive: true,
      failedLoginAttempts: 0,
      lockUntil: undefined,
    },
    { upsert: true, new: true }
  );

  console.log("Admin account ready:");
  console.log(`  Email: ${user.email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role: ${user.role}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
