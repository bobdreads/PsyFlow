use rusqlite::{Connection, Result};
use tauri::Manager;

pub fn init_db(app_handle: &tauri::AppHandle) -> Result<Connection> {
    let app_dir = app_handle.path().app_data_dir().unwrap_or_else(|_| std::path::PathBuf::from("."));
    
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).unwrap();
    }

    let db_path = app_dir.join("psyflow.db");
    let conn = Connection::open(db_path)?;

    // Tabela User
    conn.execute(
        "CREATE TABLE IF NOT EXISTS User (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Tabela Settings
    conn.execute(
        "CREATE TABLE IF NOT EXISTS Settings (
            id TEXT PRIMARY KEY,
            userId TEXT UNIQUE NOT NULL,
            theme TEXT DEFAULT 'light',
            currency TEXT DEFAULT 'BRL',
            notificationsEnabled BOOLEAN DEFAULT 1,
            sessionDuration INTEGER DEFAULT 50,
            defaultSessionValue REAL DEFAULT 0.0,
            FOREIGN KEY(userId) REFERENCES User(id)
        )",
        [],
    )?;

    // Tabela Patient
    conn.execute(
        "CREATE TABLE IF NOT EXISTS Patient (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            cpf TEXT,
            birthDate DATETIME,
            address TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            FOREIGN KEY(userId) REFERENCES User(id)
        )",
        [],
    )?;

    // Tabela Session
    conn.execute(
        "CREATE TABLE IF NOT EXISTS Session (
            id TEXT PRIMARY KEY,
            patientId TEXT NOT NULL,
            userId TEXT NOT NULL,
            startTime DATETIME NOT NULL,
            endTime DATETIME NOT NULL,
            notes TEXT,
            value REAL DEFAULT 0.0,
            status TEXT DEFAULT 'scheduled',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            FOREIGN KEY(patientId) REFERENCES Patient(id),
            FOREIGN KEY(userId) REFERENCES User(id)
        )",
        [],
    )?;

    Ok(conn)
}