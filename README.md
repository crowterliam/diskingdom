# Harper - Discord Bot for Recording and Transcribing Tabletop RPGs

A Discord bot for recording and transcribing tabletop RPG sessions, built on Cloudflare Workers. This bot provides tools for recording voice channels, storing the recordings, and transcribing them using groq-distil-whisper.

## Features

- **Voice Recording**: Record entire Discord voice channels for your tabletop RPG sessions
- **Secure Storage**: Store recordings securely in Cloudflare R2
- **Automatic Transcription**: Transcribe recordings using groq-distil-whisper
- **Easy Access**: Retrieve recordings and transcriptions with simple slash commands
- **Session Management**: Organize recordings by session name for easy reference

## Project Structure

```
├── src
│   ├── commands.js                -> Command registration
│   ├── register.js                -> Sets up commands with Discord API
│   ├── server.js                  -> Main server and request handling
│   ├── recording/                 -> Recording specific code
│   │   ├── commands/              -> Command handlers
│   │   │   ├── record.js          -> Record command implementation
│   │   │   ├── recordings.js      -> Recordings command implementation
│   │   │   ├── transcription.js   -> Transcription command implementation
│   │   │   └── index.js           -> Command exports
│   │   └── utils/                 -> Utility functions
│   │       ├── voice.js           -> Voice channel utilities
│   │       ├── recording.js       -> Recording utilities
│   │       ├── transcription.js   -> Transcription utilities
│   │       └── index.js           -> Utility exports
├── wrangler.toml                  -> Cloudflare Workers configuration
└── package.json
```

## Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers
- A [Discord Developer Account](https://discord.com/developers/applications)
- A [Groq API Account](https://console.groq.com/) for transcription

### Step 1: Discord Application Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Harper")
3. Navigate to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable the following intents:
   - **Server Members Intent**
   - **Message Content Intent**
   - **Voice State Intent**
5. Under the "Token" section, click "Reset Token" and copy the new token (you'll need this later)
6. Navigate to the "OAuth2" tab
7. Under "OAuth2 URL Generator", select the following scopes:
   - `applications.commands`
   - `bot`
8. Under "Bot Permissions", select:
   - `Send Messages`
   - `Use Slash Commands`
   - `Embed Links` (for formatted messages)
   - `Connect` (to join voice channels)
   - `Speak` (for voice channel access)
   - `Use Voice Activity` (for voice detection)
9. Copy the generated URL and open it in a browser to add the bot to your server

### Step 2: Cloudflare Setup

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one
2. Navigate to the Workers section
3. Create a new Worker with the name "harper" (or your preferred name)
4. Create a new KV Namespace:
   - Go to "KV" under Workers
   - Click "Create namespace"
   - Name it "HARPER_DATA"
   - Copy the Namespace ID (you'll need this for configuration)
5. Create a new R2 Bucket:
   - Go to "R2" under Storage
   - Click "Create bucket"
   - Name it "harper-recordings"
   - Copy the bucket name (you'll need this for configuration)

### Step 3: Groq API Setup

1. Create a [Groq account](https://console.groq.com/) if you don't have one
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key (you'll need this for configuration)

### Step 4: Local Development Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/harper.git
   cd harper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Rename `example.dev.vars` to `.dev.vars`
   - Add your Discord credentials:
     ```
     DISCORD_TOKEN=your_bot_token
     DISCORD_PUBLIC_KEY=your_public_key
     DISCORD_APPLICATION_ID=your_application_id
     ```
   - Add your Groq API key:
     ```
     GROQ_API_KEY=your_groq_api_key
     ```

4. Update the KV namespace ID and R2 bucket in `wrangler.toml`:
   ```toml
   kv_namespaces = [
     { binding = "HARPER_DATA", id = "your-kv-namespace-id-here" }
   ]
   
   r2_buckets = [
     { binding = "RECORDINGS_BUCKET", bucket_name = "harper-recordings" }
   ]
   ```

### Step 5: Register Commands

Register the bot's commands with Discord:

```
npm run register
```

### Step 6: Local Testing

1. Start the local development server:
   ```
   npm start
   ```

2. In a separate terminal, start ngrok to create a tunnel:
   ```
   npm run ngrok
   ```

3. Copy the HTTPS URL provided by ngrok (e.g., `https://1234-56-78-910-11.ngrok.io`)

4. Update your Discord application's "Interactions Endpoint URL" in the Discord Developer Portal:
   - Go to your application
   - Navigate to "General Information"
   - Paste the ngrok URL in the "Interactions Endpoint URL" field
   - Add `/` to the end of the URL (e.g., `https://1234-56-78-910-11.ngrok.io/`)
   - Click "Save Changes"

### Step 7: Deployment

1. Configure Cloudflare Worker secrets:
   ```
   wrangler secret put DISCORD_TOKEN
   wrangler secret put DISCORD_PUBLIC_KEY
   wrangler secret put DISCORD_APPLICATION_ID
   wrangler secret put GROQ_API_KEY
   ```

2. Deploy to Cloudflare Workers:
   ```
   npm run publish
   ```

3. Update your Discord application's "Interactions Endpoint URL" to your Cloudflare Worker URL:
   - Go to your application in the Discord Developer Portal
   - Navigate to "General Information"
   - Update the "Interactions Endpoint URL" with your Worker URL (e.g., `https://harper.yourusername.workers.dev/`)
   - Click "Save Changes"

## Usage Guide

### Recording Commands

- `/record start [session_name]` - Start recording the current voice channel
- `/record stop` - Stop the current recording session

### Recordings Management

- `/recordings list` - List all available recordings
- `/recordings get [recording_id]` - Get a specific recording with a download link

### Transcription Commands

- `/transcription get [recording_id]` - Get the transcription for a recording

## Storage System

The bot uses a combination of Cloudflare KV and R2 storage:

- **KV Storage**: Stores metadata about recordings and transcriptions
- **R2 Storage**: Stores the actual audio files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Discord.js](https://discord.js.org/) for the Discord API wrapper
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
- [Groq](https://groq.com/) for the distil-whisper transcription API
