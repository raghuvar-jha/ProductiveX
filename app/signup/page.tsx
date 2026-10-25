"use client"

import Signup from '@/component/Signup'
import React from 'react'



type SignupData = {
  name: string;
  email: string;
  password: string;
};

async function handleSignup(data:SignupData) {
    await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

const page = () => {
  return (
    <Signup onSignup={handleSignup}></Signup>
  )
}

export default page