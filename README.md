# Database Migration Tool

A web-based application for migrating database tables and data between MySQL databases with an intuitive user interface.

![Database Migration Tool UI](https://via.placeholder.com/800x400?text=Database+Migration+Tool+UI)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)

## Overview

The Database Migration Tool is a web application built with Node.js, Express, and MySQL that allows users to easily migrate tables and data between different MySQL databases. The tool provides a user-friendly interface where users can:

1. Connect to source and target databases
2. Select specific tables for migration
3. Choose to migrate just the structure or include data
4. Monitor migration progress in real-time
5. View detailed results of the migration process

## Features

### Database Connectivity
- Connect to MySQL databases using host, port, username, password, and database name
- Test database connections before migration
- Support for different database credentials for source and target

### Table Selection
- Browse and search tables from the source database
- Select individual tables or all tables for migration
- View table details before migration

### Migration Options
- Migrate table structure only or include data
- Drop existing tables in target database if they exist
- Preserve table structure including indexes and constraints

### Migration Process
- Real-time migration progress tracking
- Batch processing for large tables to prevent memory issues
- Detailed migration results including success/failure status, rows migrated, and time taken

### User Interface
- Responsive design using Bootstrap 5
- Intuitive drag-and-drop style interface
- Toast notifications for user feedback
- Error handling with user-friendly messages

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        Client Browser                           │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Express.js Web Server                      │
│                                                                 │
│  ┌───────────────┐   ┌────────────────┐   ┌─────────────────┐   │
│  │               │   │                │   │                 │   │
│  │    Routes     │──▶│  Controllers   │──▶│     Models      │   │
│  │               │   │                │   │                 │   │
│  └───────────────┘   └────────────────┘   └────────┬────────┘   │
│                                                    │            │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                                     ▼
┌────────────────────────────┐            ┌────────────────────────┐
│                            │            │                        │
│     Source Database        │            │     Target Database    │
│                            │            │                        │
└────────────────────────────┘            └────────────────────────┘
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Side                            │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐  │
│  │                │    │                │    │               │  │
│  │  HTML/EJS      │    │  CSS/Bootstrap │    │  JavaScript   │  │
│  │  Templates     │    │                │    │               │  │
│  │                │    │                │    │               │  │
│  └────────────────┘    └────────────────┘    └───────────────┘  │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Server Side                             │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐  │
│  │                │    │                │    │               │  │
│  │   Express.js   │    │  Controllers   │    │    Models     │  │
│  │   Routes       │    │                │    │               │  │
│  │                │    │                │    │               │  │
│  └────────┬───────┘    └───────┬────────┘    └───────┬───────┘  │
│           │                    │                     │          │
│           └────────────────────┼─────────────────────┘          │
│                                │                                │
└───────────────────────────────┬┴────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    MySQL Database Layer                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
db-migration-tool/
├── app.js                 # Main application file
├── package.json           # Project configuration
├── .env                   # Environment variables
├── config/                # Configuration files
├── controllers/           # Request handlers
│   └── migrationController.js  # Migration controller
├── models/                # Data models
│   └── database.js        # Database operations
├── public/                # Static files
│   ├── css/               # Stylesheets
│   │   └── styles.css     # Custom styles
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Common functions
│   │   └── migration.js   # Migration functionality
│   └── images/            # Image assets
├── routes/                # Application routes
│   └── migration.js       # Migration routes
└── views/                 # EJS templates
    ├── home.ejs           # Main page
    ├── error.ejs          # Error page
    ├── 404.ejs            # Not found page
    └── partials/          # Reusable page components
        ├── header.ejs     # Page header
        └── footer.ejs     # Page footer
```

### Data Flow

1. **User Interface Layer**: Provides input forms for database connections and table selection
2. **Controller Layer**: Processes user requests and coordinates between UI and database operations
3. **Model Layer**: Handles database connections and executes migration operations
4. **Database Layer**: Source and target databases where the actual migration occurs

## Installation

### Prerequisites

- Node.js (v14 or higher)
- NPM or PNPM
- MySQL Server (for source and target databases)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/db-migration-tool.git
   cd db-migration-tool
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   Or using PNPM:
   ```bash
   pnpm install
   ```

3. Create a `.env` file:
   ```
   PORT=3000
   ```

4. Start the application:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

### Connecting to Databases

1. On the home page, enter the connection details for your source database:
   - Host (e.g., localhost)
   - Port (default: 3306)
   - Username
   - Password
   - Database Name

2. Click "Test Connection" to verify the connection is working.

3. Click "Get Tables" to load available tables from the source database.

4. Enter the connection details for your target database and test the connection.

### Selecting Tables for Migration

1. From the available tables list, select the tables you want to migrate.
   - Use the search box to filter tables by name
   - Use "Select All" to select all tables

2. Click the arrow button to move selected tables to the migration list.

3. Check or uncheck "Include data in migration" based on your needs.

### Starting the Migration

1. Click "Start Migration" to begin the migration process.

2. Monitor the migration progress in the results table.

3. Review the status, rows migrated, time taken, and any error messages.

## API Documentation

### Endpoints

#### `POST /api/test-connection`
Tests a database connection.

**Request Body**:
```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "my_database"
}
```

**Response**:
```json
{
  "success": true
}
```

#### `POST /api/get-tables`
Gets tables from a database.

**Request Body**:
```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "my_database"
}
```

**Response**:
```json
{
  "success": true,
  "tables": [
    { "name": "users" },
    { "name": "products" }
  ]
}
```

#### `POST /api/get-table-structure`
Gets structure of a specific table.

**Request Body**:
```json
{
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "database": "my_database",
  "tableName": "users"
}
```

**Response**: Detailed table structure information.

#### `POST /api/migrate-table`
Migrates a table from source to target database.

**Request Body**:
```json
{
  "sourceHost": "localhost",
  "sourcePort": 3306,
  "sourceUsername": "root",
  "sourcePassword": "password",
  "sourceDatabase": "source_db",
  "targetHost": "localhost",
  "targetPort": 3306,
  "targetUsername": "root",
  "targetPassword": "password",
  "targetDatabase": "target_db",
  "tableName": "users",
  "includeData": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully migrated table users",
  "result": {
    "table": "users",
    "rowsImported": 100
  }
}
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the application with nodemon for automatic reloading on file changes.

### Project Structure

- **app.js**: Entry point of the application
- **models/database.js**: Database connectivity and migration logic
- **controllers/migrationController.js**: Request handling and business logic
- **routes/migration.js**: API endpoints
- **public/**: Static assets (CSS, JavaScript, images)
- **views/**: EJS templates for rendering HTML

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
