'use client'; 

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton, SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo/Brand Name - Links to Home */}
        <Link href="/" className="text-xl font-bold hover:text-gray-300 transition duration-150 ease-in-out">
          TodoApp
        </Link>

        {/* Navigation Links/Auth Buttons */}
        <div className="flex items-center space-x-4">
          {/* Shows content when user IS logged IN */}
          <SignedIn>
             {/* You can add other links for logged-in users here if needed */}
             {/* Example: <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link> */}
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </SignedIn>

          {/* Shows content when user IS logged OUT */}
          <SignedOut>
            <SignInButton>
              Sign In
            </SignInButton>
            <SignUpButton>
              Sign Up
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}