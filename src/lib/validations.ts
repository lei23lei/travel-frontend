import { z } from "zod";

// Common validation patterns
const emailSchema = z.string().email("Please enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/\d/, "Password must contain at least one number");

const nameSchema = z
  .string()
  .min(1, "Name is required and cannot be empty")
  .max(30, "Name must be 30 characters or less")
  .transform((val) => val.trim());

// Auth form validation schemas
export const authValidations = {
  // Login form validation
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),

  // Register form validation
  register: z
    .object({
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),

  // Forgot password form validation
  forgotPassword: z.object({
    email: emailSchema,
  }),

  // Reset password form validation
  resetPassword: z
    .object({
      password: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),

  // User profile update validation
  updateProfile: z.object({
    name: nameSchema,
  }),
};

// Type exports for form data
export type LoginFormData = z.infer<typeof authValidations.login>;
export type RegisterFormData = z.infer<typeof authValidations.register>;
export type ForgotPasswordFormData = z.infer<
  typeof authValidations.forgotPassword
>;
export type ResetPasswordFormData = z.infer<
  typeof authValidations.resetPassword
>;
export type UpdateProfileFormData = z.infer<
  typeof authValidations.updateProfile
>;

// Individual schema exports for convenience
export const loginSchema = authValidations.login;
export const registerSchema = authValidations.register;
export const forgotPasswordSchema = authValidations.forgotPassword;
export const resetPasswordSchema = authValidations.resetPassword;
export const updateProfileSchema = authValidations.updateProfile;

// Individual field schemas for reuse
export { nameSchema, emailSchema, passwordSchema };
