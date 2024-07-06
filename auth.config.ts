import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { saltAndHashPassword } from "./utils/helper";

export default {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const hash = saltAndHashPassword(credentials.password);

        let user: any = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
              password: hash,
            },
          });
        } else {
          const isMatch = bcrypt.compareSync(
            credentials.password as string,
            user.password
          );
          if (!isMatch) {
            throw new Error("Incorrect password.");
          }
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
