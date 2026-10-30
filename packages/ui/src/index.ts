/**
 * BizContext UI Component Library
 * Shared component foundations, design tokens, and primitives.
 */

export const UI_VERSION = "0.1.0";

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
}

export interface BadgeProps {
  text: string;
  color?: "slate" | "emerald" | "amber" | "rose" | "indigo";
}
