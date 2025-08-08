import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Email and password are required');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          console.log('👤 User found:', !!user, user ? user.role : 'none');

          if (!user || !user.password) {
            console.log('❌ User not found or no password');
            throw new Error('Invalid credentials');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('🔑 Password valid:', isValid);
          
          if (!isValid) {
            console.log('❌ Invalid password');
            throw new Error('Invalid credentials');
          }

          // Allow all registered users for regular login
          // Admin-specific routes will be protected separately
          const allowedRoles = ['admin', 'manager', 'support', 'user', 'viewer'];
          if (!allowedRoles.includes(user.role)) {
            console.log('❌ Role not allowed:', user.role);
            throw new Error('Access denied');
          }

          console.log('✅ Login successful for:', user.email, 'Role:', user.role);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            phone: user.phone || undefined,
            role: user.role
          };
        } catch (error) {
          console.log('💥 Auth error:', error instanceof Error ? error.message : 'Unknown error');
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        
        // Fetch fresh user data from database to ensure we have the latest info
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              image: true,
            },
          });
          
          if (user) {
            session.user.firstName = user.firstName || undefined;
            session.user.lastName = user.lastName || undefined;
            session.user.phone = user.phone || undefined;
            session.user.image = user.image || undefined;
          }
        } catch (error) {
          console.error('Error fetching user data in session callback:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
