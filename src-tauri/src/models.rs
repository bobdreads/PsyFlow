use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub id: String,
    pub user_id: String,
    pub theme: String,
    pub currency: String,
    pub notifications_enabled: bool,
    pub session_duration: i32,
    pub default_session_value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Patient {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub cpf: Option<String>,
    pub address: Option<String>,
    pub created_at: String,
}

// Resposta padrão para o Frontend
#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self { success: true, data: Some(data), error: None }
    }
    
    pub fn error(msg: String) -> Self {
        Self { success: false, data: None, error: Some(msg) }
    }
}