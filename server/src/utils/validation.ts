import { MyRequest } from "../types";
import { EMAIL_REGEX } from "../contstants";
import { LoginInput } from "./LoginInput";
import { RegistrationInput } from "./RegistrationInput";

const isLoggedIn = (req: MyRequest) => {
  if (req.session.userId)
    return {
      errors: [{ message: "You are already logged in" }],
    };

  return null;
};

const validateUsername = (username: string) => {
  if (username.length < 2)
    return {
      errors: [{ message: "Username cannot be less than 2 characters" }],
    };

  return null;
};

const validateEmail = (email: string) => {
  if (email && email.length < 2)
    return {
      errors: [{ message: "Username cannot be less than 2 characters" }],
    };

  if (email && !email.match(EMAIL_REGEX))
    return {
      errors: [{ message: "Invalid email" }],
    };

  return null;
};

const validatePassword = (password: string) => {
  if (password.length < 2)
    return {
      errors: [{ message: "Password cannot be less than 2 characters" }],
    };

  return null;
};

export const validateRegistrationInput = (
  options: RegistrationInput,
  req: MyRequest
) => {
  const { username, email, password, confirmPassword } = options;

  const sessionErrors = isLoggedIn(req);
  if (sessionErrors) return sessionErrors;

  const usernameErrors = validateUsername(username);
  if (usernameErrors) return usernameErrors;

  if (email) {
    const emailErrors = validateEmail(email);
    if (emailErrors) return emailErrors;
  }

  const passwordErrors = validatePassword(password);
  if (passwordErrors) return passwordErrors;

  if (password !== confirmPassword)
    return { errors: [{ message: "Passwords do not match" }] };

  return null;
};

export const validateLoginInput = (options: LoginInput, req: MyRequest) => {
  const { username, password } = options;

  const sessionErrors = isLoggedIn(req);
  if (sessionErrors) return sessionErrors;

  const usernameErrors = validateUsername(username);
  if (usernameErrors) return usernameErrors;

  const passwordErrors = validatePassword(password);
  if (passwordErrors) return passwordErrors;

  return null;
};
