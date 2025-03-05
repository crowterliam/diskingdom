import { Env } from './db';
import { User, createUser, getUserByEmail, getUserByUsername } from './models';
import { createSession, Session } from './session';

// For password hashing in a Cloudflare Worker environment
// We'll use the Web Crypto API which is available in Workers
export async function hashPassword(password: string): Promise<string> {
  // Convert the password string to a buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Hash the password using SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert the hash buffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hashedPassword;
}

export interface RegisterResult {
  success: boolean;
  userId?: number;
  error?: string;
}

export async function registerUser(
  env: Env,
  username: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  // Validate input
  if (!username || !email || !password) {
    return { success: false, error: 'All fields are required' };
  }
  
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }
  
  // Check if username or email already exists
  const existingUserByUsername = await getUserByUsername(env, username);
  if (existingUserByUsername) {
    return { success: false, error: 'Username already exists' };
  }
  
  const existingUserByEmail = await getUserByEmail(env, email);
  if (existingUserByEmail) {
    return { success: false, error: 'Email already exists' };
  }
  
  // Hash the password
  const passwordHash = await hashPassword(password);
  
  // Create the user
  try {
    const userId = await createUser(env, username, email, passwordHash);
    return { success: true, userId };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export async function loginUser(
  env: Env,
  email: string,
  password: string
): Promise<LoginResult> {
  // Validate input
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }
  
  // Get the user by email
  const user = await getUserByEmail(env, email);
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Verify the password
  const isPasswordValid = await verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Create a session
  try {
    const session = await createSession(env, user.id);
    return { success: true, user, session };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

// Helper function to set session cookie in response
export function setSessionCookie(response: Response, session: Session): Response {
  const cookieValue = `session=${session.id}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24}`;
  response.headers.append('Set-Cookie', cookieValue);
  return response;
}

// Helper function to clear session cookie in response
export function clearSessionCookie(response: Response): Response {
  const cookieValue = 'session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0';
  response.headers.append('Set-Cookie', cookieValue);
  return response;
}
