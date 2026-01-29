pub mod models;
pub mod db;

use tauri::{State, Manager};
use std::sync::Mutex;
use rusqlite::{Connection, params};
use models::{User, Patient, Settings, ApiResponse};
use uuid::Uuid;
use bcrypt::{hash, verify, DEFAULT_COST};

// Estado global do Banco
struct AppState {
    db: Mutex<Connection>,
}

// --- COMANDOS DE AUTH ---

#[tauri::command]
fn register(state: State<AppState>, payload: serde_json::Value) -> ApiResponse<User> {
    let name = payload["name"].as_str().unwrap_or("");
    let email = payload["email"].as_str().unwrap_or("");
    let password = payload["password"].as_str().unwrap_or("");

    if email.is_empty() || password.is_empty() {
        return ApiResponse::error("Email e senha são obrigatórios".to_string());
    }

    let conn = state.db.lock().unwrap();
    let hashed = hash(password, DEFAULT_COST).unwrap();
    let user_id = Uuid::new_v4().to_string();

    // 1. Criar Usuário
    let res = conn.execute(
        "INSERT INTO User (id, name, email, password_hash) VALUES (?1, ?2, ?3, ?4)",
        params![user_id, name, email, hashed],
    );

    match res {
        Ok(_) => {
            // 2. Criar Settings Padrão
            let settings_id = Uuid::new_v4().to_string();
            let _ = conn.execute(
                "INSERT INTO Settings (id, userId) VALUES (?1, ?2)",
                params![settings_id, user_id],
            );

            ApiResponse::success(User {
                id: user_id,
                name: name.to_string(),
                email: email.to_string(),
            })
        },
        Err(e) => ApiResponse::error(format!("Erro ao cadastrar: {}", e)),
    }
}

#[tauri::command]
fn login(state: State<AppState>, payload: serde_json::Value) -> ApiResponse<User> {
    let email = payload["email"].as_str().unwrap_or("");
    let password = payload["password"].as_str().unwrap_or("");

    let conn = state.db.lock().unwrap();
    
    // Buscar usuário e hash
    let mut stmt = conn.prepare("SELECT id, name, email, password_hash FROM User WHERE email = ?1").unwrap();
    let user_iter = stmt.query_map(params![email], |row| {
        Ok((
            row.get::<_, String>(0)?, // id
            row.get::<_, String>(1)?, // name
            row.get::<_, String>(2)?, // email
            row.get::<_, String>(3)?, // hash
        ))
    });

    if let Ok(mut rows) = user_iter {
        if let Some(Ok((id, name, email_db, hash_db))) = rows.next() {
            if verify(password, &hash_db).unwrap_or(false) {
                return ApiResponse::success(User { id, name, email: email_db });
            }
        }
    }

    ApiResponse::error("Email ou senha inválidos".to_string())
}

// --- COMANDOS DE PACIENTES ---

#[tauri::command]
fn create_patient(state: State<AppState>, payload: serde_json::Value) -> ApiResponse<Patient> {
    let conn = state.db.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    
    // Extrair dados com segurança
    let user_id = payload["userId"].as_str().unwrap_or("");
    let name = payload["name"].as_str().unwrap_or("");
    let phone = payload["phone"].as_str().map(|s| s.to_string());
    let email = payload["email"].as_str().map(|s| s.to_string());

    let res = conn.execute(
        "INSERT INTO Patient (id, userId, name, phone, email) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, user_id, name, phone, email],
    );

    match res {
        Ok(_) => ApiResponse::success(Patient {
            id,
            user_id: user_id.to_string(),
            name: name.to_string(),
            phone,
            email,
            cpf: None,
            address: None,
            created_at: chrono::Local::now().to_rfc3339(),
        }),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

#[tauri::command]
fn list_patients(state: State<AppState>, user_id: String) -> ApiResponse<Vec<Patient>> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, email, phone, createdAt FROM Patient WHERE userId = ?1 AND deletedAt IS NULL ORDER BY name ASC").unwrap();
    
    let patients_iter = stmt.query_map(params![user_id], |row| {
        Ok(Patient {
            id: row.get(0)?,
            user_id: user_id.clone(),
            name: row.get(1)?,
            email: row.get(2)?,
            phone: row.get(3)?,
            cpf: None,
            address: None,
            created_at: row.get::<_, String>(4)?,
        })
    });

    match patients_iter {
        Ok(rows) => {
            let patients: Vec<Patient> = rows.filter_map(Result::ok).collect();
            ApiResponse::success(patients)
        },
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

#[tauri::command]
fn delete_patient(state: State<AppState>, id: String, user_id: String) -> ApiResponse<()> {
    let conn = state.db.lock().unwrap();
    // Soft delete
    let res = conn.execute(
        "UPDATE Patient SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?1 AND userId = ?2",
        params![id, user_id],
    );

    match res {
        Ok(_) => ApiResponse::success(()),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

// --- COMANDOS DE SETTINGS ---

#[tauri::command]
fn get_settings(state: State<AppState>, user_id: String) -> ApiResponse<Settings> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, theme, currency, notificationsEnabled, sessionDuration, defaultSessionValue FROM Settings WHERE userId = ?1").unwrap();
    
    let mut rows = stmt.query(params![user_id]).unwrap();

    if let Ok(Some(row)) = rows.next() {
        let settings = Settings {
            id: row.get(0).unwrap_or_default(),
            user_id,
            theme: row.get(1).unwrap_or("light".to_string()),
            currency: row.get(2).unwrap_or("BRL".to_string()),
            notifications_enabled: row.get(3).unwrap_or(true),
            session_duration: row.get(4).unwrap_or(50),
            default_session_value: row.get(5).unwrap_or(0.0),
        };
        return ApiResponse::success(settings);
    }
    
    ApiResponse::error("Configurações não encontradas".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_log::Builder::default().build()) // Agora temos o plugin!
        .setup(|app| {
            // Inicializa o Banco
            let conn = db::init_db(app.handle()).expect("failed to init db");
            // Gerencia o estado
            app.manage(AppState { db: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            register,
            login,
            create_patient,
            list_patients,
            delete_patient,
            get_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}