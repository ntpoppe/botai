# Botai - World of Warcraft Discord Bot

A Discord bot designed to enhance our World of Warcraft experience.

## Purpose

Botai serves as a multi-functional Discord bot that integrates with World of Warcraft APIs to provide real-time auction house data, raid roster management, and LLM-powered conversation capabilities. The bot is specifically designed for my WoW guild.

## Architecture Overview

The application is structured as a Node.js Discord bot with the following key components:

### Core Bot System (`src/bot/`)
- **`run.js`** - Main bot entry point and interaction handler
- **`deploy-commands.js`** - Deploys slash commands to Discord servers

#### Command Structure (`src/bot/commands/`)

#### Core Bot (`src/bot/`)
Handles bot initialization and lifecycle—logging in, registering commands with Discord, and dispatching incoming interactions to the appropriate handlers.

#### Commands (`src/bot/commands/`)
Contains grouped modules defining slash-command schemas and logic. Each subfolder (WoW, utility, admin, dev, random) encapsulates related command behaviors (data fetches, user prompts, moderation tools, testing utilities, etc.).

#### API Layer (`src/api/`)
Abstracts external integrations—managing OAuth tokens, building and sending requests to Blizzard or local AI models, and applying retry/pagination logic. Provides a clean interface for higher-level code to fetch and transform data.

#### Database Layer (`src/db/`)
Manages persistence—configuring the Postgres connection pool, offering generic read routines, and running upsert workflows that synchronize API-fetched data into normalized tables (realms, items, auctions, regions).

#### Utilities (`src/bot/utils/`)
Offers cross-cutting helpers such as structured logging setup and common data-extraction or transformation functions shared across the bot.  


## Key Features

### Auction House Integration
- Real-time auction data from multiple realms and factions
- Statistical analysis with outlier filtering
- Price conversion (copper to gold/silver/copper)
- Autocomplete search functionality
- External resource linking

### Raid Management
- Interactive raid creation with Discord modals
- Class and specialization selection with role assignment
- Status tracking (bench, late, tentative, absence)
- Discord event integration
- Real-time roster updates
- Automatic embed management

### AI Chat System
- OpenAI GPT-4 integration
- WoW-specific knowledge base
- Conversation context maintenance
- Template-based system prompts
- Automatic conversation cleanup

### Database Integration
- PostgreSQL backend for data persistence
- Auction data caching and synchronization
- Item database management
- Realm and region data storage

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Discord Bot Token
- Blizzard API credentials
- OpenAI API key

## Environment Variables

```env
# Discord
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_DATABASE=your_db_name
DB_PORT=5432

# Blizzard API
WOW_CLIENT_ID=your_blizzard_client_id
WOW_CLIENT_SECRET=your_blizzard_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Known Issues

- **Upsert Scripts**: The database upsert scripts in `src/db/upserts/` are currently non-functional due to Blizzard API endpoint changes. These scripts were designed to sync auction house data, item information, and realm data but require updates to work with current API endpoints.
