"use client";

import React, { useState } from "react";
import {
  AuthSplitLayout,
  RegisterForm,
  VerificationSuccessCard,
} from "../../../components/auth";

export default function CustomerRegisterPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");

  const handleSuccess = (email: string) => {
    setCreatedEmail(email);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <VerificationSuccessCard email={createdEmail} />;
  }

  return (
    <AuthSplitLayout
      showcaseTitle="Elevate Your Work Environment"
      showcaseDescription="Join a premier community of professionals. Access meticulously designed spaces that foster focus, collaboration, and high-tier productivity."
      headerPromptText="Already have an account?"
      headerActionText="Sign In"
      headerActionHref="/login"
    >
      <RegisterForm onSuccess={handleSuccess} />
    </AuthSplitLayout>
  );
}
