pub mod models;
pub mod db;

use tauri::{State, Manager};
use std::sync::Mutex;
use rusqlite::{Connection, params};
use models::{User, Patient, Settings, Session, ApiResponse};
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

    let res = conn.execute(
        "INSERT INTO User (id, name, email, password_hash) VALUES (?1, ?2, ?3, ?4)",
        params![user_id, name, email, hashed],
    );

    match res {
        Ok(_) => {
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
    
    let mut stmt = conn.prepare("SELECT id, name, email, password_hash FROM User WHERE email = ?1").unwrap();
    let user_iter = stmt.query_map(params![email], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
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

// NOVO: Editar Paciente
#[tauri::command]
fn update_patient(state: State<AppState>, id: String, payload: serde_json::Value) -> ApiResponse<()> {
    let conn = state.db.lock().unwrap();
    
    let name = payload["name"].as_str().unwrap_or("");
    let phone = payload["phone"].as_str().map(|s| s.to_string());
    let email = payload["email"].as_str().map(|s| s.to_string());

    let res = conn.execute(
        "UPDATE Patient SET name = ?1, phone = ?2, email = ?3, updatedAt = CURRENT_TIMESTAMP WHERE id = ?4",
        params![name, phone, email, id],
    );

    match res {
        Ok(_) => ApiResponse::success(()),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

#[tauri::command]
fn delete_patient(state: State<AppState>, id: String, user_id: String) -> ApiResponse<()> {
    let conn = state.db.lock().unwrap();
    let res = conn.execute(
        "UPDATE Patient SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?1 AND userId = ?2",
        params![id, user_id],
    );

    match res {
        Ok(_) => ApiResponse::success(()),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

// --- COMANDOS DE SESSÕES ---

#[tauri::command]
fn create_session(state: State<AppState>, payload: serde_json::Value) -> ApiResponse<Session> {
    let conn = state.db.lock().unwrap();
    let id = Uuid::new_v4().to_string();

    let user_id = payload["userId"].as_str().unwrap_or("");
    let patient_id = payload["patientId"].as_str().unwrap_or("");
    let start_time = payload["startTime"].as_str().unwrap_or("");
    let end_time = payload["endTime"].as_str().unwrap_or("");
    let notes = payload["notes"].as_str().map(|s| s.to_string());
    let value = payload["value"].as_f64().unwrap_or(0.0);
    let status = payload["status"].as_str().unwrap_or("scheduled");

    let res = conn.execute(
        "INSERT INTO Session (id, userId, patientId, startTime, endTime, notes, value, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, user_id, patient_id, start_time, end_time, notes, value, status],
    );

    match res {
        Ok(_) => ApiResponse::success(Session {
            id,
            user_id: user_id.to_string(),
            patient_id: patient_id.to_string(),
            start_time: start_time.to_string(),
            end_time: end_time.to_string(),
            notes,
            value,
            status: status.to_string(),
            created_at: chrono::Local::now().to_rfc3339(),
        }),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

// CORREÇÃO: Removemos a função genérica problemática e usamos esta específica
#[tauri::command]
fn list_sessions_by_patient(state: State<AppState>, patient_id: String) -> ApiResponse<Vec<Session>> {
    let conn = state.db.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, userId, patientId, startTime, endTime, notes, value, status, createdAt FROM Session WHERE patientId = ?1 AND deletedAt IS NULL ORDER BY startTime DESC").unwrap();
    
    // Como patient_id é passado como argumento da função, ele vive o suficiente!
    let rows = stmt.query_map(params![patient_id], |row| {
        Ok(Session {
            id: row.get(0)?,
            user_id: row.get(1)?,
            patient_id: row.get(2)?,
            start_time: row.get(3)?,
            end_time: row.get(4)?,
            notes: row.get(5)?,
            value: row.get(6)?,
            status: row.get(7)?,
            created_at: row.get(8)?,
        })
    });

    match rows {
        Ok(iter) => {
            let sessions: Vec<Session> = iter.filter_map(Result::ok).collect();
            ApiResponse::success(sessions)
        },
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

// NOVO: Editar Sessão
#[tauri::command]
fn update_session(state: State<AppState>, id: String, payload: serde_json::Value) -> ApiResponse<()> {
    let conn = state.db.lock().unwrap();
    
    let start_time = payload["startTime"].as_str().unwrap_or("");
    let end_time = payload["endTime"].as_str().unwrap_or("");
    let notes = payload["notes"].as_str().map(|s| s.to_string());
    let value = payload["value"].as_f64().unwrap_or(0.0);
    let status = payload["status"].as_str().unwrap_or("scheduled");

    let res = conn.execute(
        "UPDATE Session SET startTime = ?1, endTime = ?2, notes = ?3, value = ?4, status = ?5, updatedAt = CURRENT_TIMESTAMP WHERE id = ?6",
        params![start_time, end_time, notes, value, status, id],
    );

    match res {
        Ok(_) => ApiResponse::success(()),
        Err(e) => ApiResponse::error(e.to_string()),
    }
}

// NOVO: Excluir Sessão
#[tauri::command]
fn delete_session(state: State<AppState>, id: String) -> ApiResponse<()> {
    let conn = state.db.lock().unwrap();
    let res = conn.execute("UPDATE Session SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?1", params![id]);
    match res { Ok(_) => ApiResponse::success(()), Err(e) => ApiResponse::error(e.to_string()) }
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
        .plugin(tauri_plugin_log::Builder::default().build())
        .setup(|app| {
            let conn = db::init_db(app.handle()).expect("failed to init db");
            app.manage(AppState { db: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            register, login,
            create_patient, list_patients, update_patient, delete_patient, // Pacientes
            create_session, list_sessions_by_patient, update_session, delete_session, // Sessões
            get_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}