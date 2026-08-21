'use client';

import React from 'react';
import { AuthSplitLayout, LoginForm } from '../../../components/auth';

export default function CustomerLoginPage() {
  return (
    <AuthSplitLayout
      bgImage="/images/background/1.jpg"
      showcaseTitle="Welcome to the Workspace of the Future"
      showcaseDescription="Experience enterprise-grade facilities, high-speed connectivity, and modern collaborative spaces tailored for visionary professionals."
      showShowcaseLogo={false}
      headerPromptText="Don't have an account?"
      headerActionText="Sign Up"
      headerActionHref="/register"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
