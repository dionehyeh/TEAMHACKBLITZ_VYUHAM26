import type { Metadata } from "next";
import { AuthPageLayout } from "../../components/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Sign In | Minto - Zero-Friction Authentication",
  description:
    "One click. Zero friction. Connect your wallet or sign in with enterprise credentials to access your autonomous workspace.",
};

export default function LoginPage() {
  return <AuthPageLayout mode="login" />;
}
