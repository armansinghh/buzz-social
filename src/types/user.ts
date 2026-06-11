export interface UserProfile {
  uid: string;

  username?: string;
  name?: string;

  avatar?: string;
  photoURL?: string;    // the photoURL from Firebase Auth (e.g. from Google sign-in)

  email?: string;

  followers?: string[];
  following?: string[];

}