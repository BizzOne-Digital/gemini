import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import AdminUser from "@/models/AdminUser";
import { authConfig } from "./auth.config";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await AdminUser.findOne({
          email: (credentials.email as string).toLowerCase(),
        });

        if (!user || !user.isActive) return null;

        if (user.lockUntil && user.lockUntil > new Date()) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCK_TIME);
          }
          await user.save();
          return null;
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});

export async function requireAuth(requiredRoles?: string[]) {
  const session = await auth();
  if (!session?.user) return null;
  if (requiredRoles && !requiredRoles.includes(session.user.role)) return null;
  return session;
}
