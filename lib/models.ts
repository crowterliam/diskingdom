import { Env, queryDB, executeDB, getSingle } from './db';

// User model interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: number;
}

export interface Game {
  id: number;
  name: string;
  description: string | null;
  system: string | null;
  owner_id: number;
  discord_server_id: string | null;
  created_at: number;
}

export interface GameMember {
  id: number;
  game_id: number;
  user_id: number;
  role: string;
  joined_at: number;
}

export interface Recording {
  id: number;
  game_id: number;
  session_name: string | null;
  filename: string;
  r2_key: string;
  discord_channel_id: string | null;
  recorded_at: number;
  duration: number | null;
}

export interface Transcription {
  id: number;
  recording_id: number;
  content: string;
  transcribed_at: number;
}

export interface DiscordServer {
  id: string;
  name: string;
  owner_id: number;
  bot_added_at: number;
}

// User functions
export async function createUser(
  env: Env,
  username: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const result = await executeDB(
    env,
    `INSERT INTO users (username, email, password_hash) 
     VALUES (?, ?, ?)`,
    [username, email, passwordHash]
  );
  return result.meta.last_row_id as number;
}

export async function getUserById(env: Env, id: number): Promise<User | null> {
  return getSingle<User>(
    env,
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
}

export async function getUserByEmail(env: Env, email: string): Promise<User | null> {
  return getSingle<User>(
    env,
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
}

export async function getUserByUsername(env: Env, username: string): Promise<User | null> {
  return getSingle<User>(
    env,
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
}

// Game functions
export async function createGame(
  env: Env,
  name: string,
  description: string | null,
  system: string | null,
  ownerId: number,
  discordServerId: string | null
): Promise<number> {
  const result = await executeDB(
    env,
    `INSERT INTO games (name, description, system, owner_id, discord_server_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, description, system, ownerId, discordServerId]
  );
  return result.meta.last_row_id as number;
}

export async function getGameById(env: Env, id: number): Promise<Game | null> {
  return getSingle<Game>(
    env,
    'SELECT * FROM games WHERE id = ?',
    [id]
  );
}

export async function getGamesByUserId(env: Env, userId: number): Promise<Game[]> {
  return queryDB<Game>(
    env,
    `SELECT g.* FROM games g
     JOIN game_members gm ON g.id = gm.game_id
     WHERE gm.user_id = ?
     UNION
     SELECT * FROM games WHERE owner_id = ?
     ORDER BY created_at DESC`,
    [userId, userId]
  );
}

export async function updateGame(
  env: Env,
  id: number,
  name: string,
  description: string | null,
  system: string | null
): Promise<void> {
  await executeDB(
    env,
    `UPDATE games SET name = ?, description = ?, system = ?
     WHERE id = ?`,
    [name, description, system, id]
  );
}

export async function deleteGame(env: Env, id: number): Promise<void> {
  await executeDB(
    env,
    'DELETE FROM games WHERE id = ?',
    [id]
  );
}

// Game member functions
export async function addGameMember(
  env: Env,
  gameId: number,
  userId: number,
  role: string = 'player'
): Promise<number> {
  const result = await executeDB(
    env,
    `INSERT INTO game_members (game_id, user_id, role)
     VALUES (?, ?, ?)`,
    [gameId, userId, role]
  );
  return result.meta.last_row_id as number;
}

export async function getGameMembers(env: Env, gameId: number): Promise<GameMember[]> {
  return queryDB<GameMember>(
    env,
    'SELECT * FROM game_members WHERE game_id = ?',
    [gameId]
  );
}

export async function updateGameMemberRole(
  env: Env,
  gameId: number,
  userId: number,
  role: string
): Promise<void> {
  await executeDB(
    env,
    `UPDATE game_members SET role = ?
     WHERE game_id = ? AND user_id = ?`,
    [role, gameId, userId]
  );
}

export async function removeGameMember(
  env: Env,
  gameId: number,
  userId: number
): Promise<void> {
  await executeDB(
    env,
    'DELETE FROM game_members WHERE game_id = ? AND user_id = ?',
    [gameId, userId]
  );
}

// Recording functions
export async function createRecording(
  env: Env,
  gameId: number,
  sessionName: string | null,
  filename: string,
  r2Key: string,
  discordChannelId: string | null,
  duration: number | null
): Promise<number> {
  const result = await executeDB(
    env,
    `INSERT INTO recordings (game_id, session_name, filename, r2_key, discord_channel_id, duration)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gameId, sessionName, filename, r2Key, discordChannelId, duration]
  );
  return result.meta.last_row_id as number;
}

export async function getRecordingById(env: Env, id: number): Promise<Recording | null> {
  return getSingle<Recording>(
    env,
    'SELECT * FROM recordings WHERE id = ?',
    [id]
  );
}

export async function getRecordingsByGameId(env: Env, gameId: number): Promise<Recording[]> {
  return queryDB<Recording>(
    env,
    'SELECT * FROM recordings WHERE game_id = ? ORDER BY recorded_at DESC',
    [gameId]
  );
}

export async function deleteRecording(env: Env, id: number): Promise<void> {
  await executeDB(
    env,
    'DELETE FROM recordings WHERE id = ?',
    [id]
  );
}

// Transcription functions
export async function createTranscription(
  env: Env,
  recordingId: number,
  content: string
): Promise<number> {
  const result = await executeDB(
    env,
    `INSERT INTO transcriptions (recording_id, content)
     VALUES (?, ?)`,
    [recordingId, content]
  );
  return result.meta.last_row_id as number;
}

export async function getTranscriptionById(env: Env, id: number): Promise<Transcription | null> {
  return getSingle<Transcription>(
    env,
    'SELECT * FROM transcriptions WHERE id = ?',
    [id]
  );
}

export async function getTranscriptionByRecordingId(env: Env, recordingId: number): Promise<Transcription | null> {
  return getSingle<Transcription>(
    env,
    'SELECT * FROM transcriptions WHERE recording_id = ?',
    [recordingId]
  );
}

// Discord server functions
export async function addDiscordServer(
  env: Env,
  id: string,
  name: string,
  ownerId: number
): Promise<void> {
  await executeDB(
    env,
    `INSERT INTO discord_servers (id, name, owner_id)
     VALUES (?, ?, ?)`,
    [id, name, ownerId]
  );
}

export async function getDiscordServerById(env: Env, id: string): Promise<DiscordServer | null> {
  return getSingle<DiscordServer>(
    env,
    'SELECT * FROM discord_servers WHERE id = ?',
    [id]
  );
}

export async function getDiscordServersByUserId(env: Env, userId: number): Promise<DiscordServer[]> {
  return queryDB<DiscordServer>(
    env,
    'SELECT * FROM discord_servers WHERE owner_id = ?',
    [userId]
  );
}

export async function deleteDiscordServer(env: Env, id: string): Promise<void> {
  await executeDB(
    env,
    'DELETE FROM discord_servers WHERE id = ?',
    [id]
  );
}
