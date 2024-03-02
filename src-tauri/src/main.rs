// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "CREATE TABLE routines (
          id INTEGER PRIMARY KEY,
          name TEXT,
          note TEXT,
          is_schedule_weekly BOOLEAN,
          num_days_in_schedule SMALLINT,
          custom_schedule_start_date TEXT
        );",
        kind: MigrationKind::Up,
    }]
}

fn main() {
    let migrations = get_migrations();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:local_lift_log_db.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
