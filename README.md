# DIS Kingdom - Discord Bot for Kingdoms & Warfare

A Discord bot for managing Kingdoms & Warfare campaigns, built on Cloudflare Workers. This bot provides comprehensive tools for managing domains, units, battles, and intrigue sessions from the MCDM Productions' Kingdoms & Warfare supplement for Dungeons & Dragons 5th Edition.

## Features

- **Domain Management**: Create and manage political domains with skills, defenses, and resources
- **Unit Management**: Create and track military units with stats, conditions, and traits
- **Battle System**: Run warfare battles with unit deployment, initiative tracking, and combat resolution
- **Intrigue System**: Conduct political intrigue sessions with skill tests and domain actions
- **Dice Rolling**: Specialized dice rolling for warfare and intrigue mechanics
- **Reference Information**: Quick access to rules and reference information

## Project Structure

```
├── src
│   ├── commands.js                -> Command registration
│   ├── register.js                -> Sets up commands with Discord API
│   ├── server.js                  -> Main server and request handling
│   ├── knw/                       -> Kingdoms & Warfare specific code
│   │   ├── commands/              -> Command handlers
│   │   │   ├── warfare/           -> Warfare command implementations
│   │   │   └── intrigue/          -> Intrigue command implementations
│   │   ├── models/                -> Data models
│   │   └── utils/                 -> Utility functions
│   │       ├── dice.js            -> Dice rolling utilities
│   │       ├── formatter.js       -> Message formatting utilities
│   │       ├── storage.js         -> Storage interface (backward compatibility)
│   │       └── storage/           -> Modular storage system
│   │           ├── core.js        -> Core storage functions
│   │           ├── unit.js        -> Unit storage
│   │           ├── domain.js      -> Domain storage
│   │           ├── battle.js      -> Battle storage
│   │           ├── intrigue.js    -> Intrigue storage
│   │           ├── discord.js     -> Discord-related storage
│   │           └── index.js       -> Main entry point
├── wrangler.toml                  -> Cloudflare Workers configuration
└── package.json
```

## Setup Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers
- A [Discord Developer Account](https://discord.com/developers/applications)

### Step 1: Discord Application Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "DIS Kingdom")
3. Navigate to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable any necessary intents
5. Under the "Token" section, click "Reset Token" and copy the new token (you'll need this later)
6. Navigate to the "OAuth2" tab
7. Under "OAuth2 URL Generator", select the following scopes:
   - `applications.commands`
   - `bot`
8. Under "Bot Permissions", select:
   - `Send Messages`
   - `Use Slash Commands`
   - `Embed Links` (for formatted messages)
9. Copy the generated URL and open it in a browser to add the bot to your server

### Step 2: Cloudflare Setup

1. Create a [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one
2. Navigate to the Workers section
3. Create a new Worker with the name "diskingdom" (or your preferred name)
4. Create a new KV Namespace:
   - Go to "KV" under Workers
   - Click "Create namespace"
   - Name it "KNW_DATA"
   - Copy the Namespace ID (you'll need this for configuration)

### Step 3: Local Development Setup

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/diskingdom.git
   cd diskingdom
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

4. Update the KV namespace ID in `wrangler.toml`:
   ```toml
   kv_namespaces = [
     { binding = "KNW_DATA", id = "your-kv-namespace-id-here" }
   ]
   ```

### Step 4: Register Commands

Register the bot's commands with Discord:

```
npm run register
```

### Step 5: Local Testing

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

### Step 6: Deployment

1. Configure Cloudflare Worker secrets:
   ```
   wrangler secret put DISCORD_TOKEN
   wrangler secret put DISCORD_PUBLIC_KEY
   wrangler secret put DISCORD_APPLICATION_ID
   ```

2. Deploy to Cloudflare Workers:
   ```
   npm run publish
   ```

3. Update your Discord application's "Interactions Endpoint URL" to your Cloudflare Worker URL:
   - Go to your application in the Discord Developer Portal
   - Navigate to "General Information"
   - Update the "Interactions Endpoint URL" with your Worker URL (e.g., `https://diskingdom.yourusername.workers.dev/`)
   - Click "Save Changes"

## Usage Guide

### Warfare Commands

- `/warfare unit create` - Create a new military unit
- `/warfare unit view` - View details of a unit
- `/warfare unit list` - List all units
- `/warfare battle create` - Create a new battle
- `/warfare battle add_domain` - Add a domain to a battle
- `/warfare battle add_unit` - Add a unit to a battle
- `/warfare battle deploy_unit` - Deploy a unit on the battlefield
- `/warfare battle start` - Start a battle
- `/warfare roll attack` - Roll an attack
- `/warfare roll damage` - Roll damage

### Intrigue Commands

- `/intrigue domain create` - Create a new domain
- `/intrigue domain view` - View details of a domain
- `/intrigue domain list` - List all domains
- `/intrigue session create` - Create a new intrigue session
- `/intrigue session action` - Take an action in an intrigue session
- `/intrigue roll` - Roll a domain skill check
- `/intrigue reference` - Get reference information

## Storage System

The bot uses a modular storage system that supports both in-memory storage (for development) and Cloudflare KV storage (for production). The storage system is organized into the following components:

- `core.js` - Core storage functions
- `unit.js` - Unit-specific storage
- `domain.js` - Domain-specific storage
- `battle.js` - Battle-specific storage
- `intrigue.js` - Intrigue-specific storage
- `discord.js` - Discord-specific storage (server, channel, user)
- `index.js` - Main entry point that exports all storage functions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [MCDM Productions](https://www.mcdmproductions.com/) for creating Kingdoms & Warfare
- [Discord.js](https://discord.js.org/) for the Discord API wrapper
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
