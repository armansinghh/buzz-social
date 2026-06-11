export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Your password must be at least 6 characters long.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again in a few minutes.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};