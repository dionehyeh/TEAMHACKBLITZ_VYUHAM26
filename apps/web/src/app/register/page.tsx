import type { Metadata } from "next";
import { AuthPageLayout } from "../../components/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Create Account | Minto - Zero-Friction Authentication",
  description:
    "Register for Minto. Connect your cryptographic wallet or sign up with enterprise credentials in seconds.",
};

export default function RegisterPage() {
  return <AuthPageLayout mode="register" />;
}
