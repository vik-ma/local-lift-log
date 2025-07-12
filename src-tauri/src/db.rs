use dirs::config_dir;
use dotenvy::dotenv;

use std::env;
use std::fs;
use std::path::Path;
use std::path::PathBuf;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init() {
    if !db_file_exists() {
        create_db_file();
    }

    run_migrations();
}

fn run_migrations() {
    let mut connection = establish_connection();
    connection.run_pending_migrations(MIGRATIONS).unwrap();
}

fn establish_connection() -> SqliteConnection {
    let db_path = "sqlite://".to_string() + get_db_path().as_str();

    SqliteConnection::establish(&db_path)
        .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

fn create_db_file() {
    let db_path = get_db_path();
    let db_dir = Path::new(&db_path).parent().unwrap();

    if !db_dir.exists() {
        fs::create_dir_all(db_dir).unwrap();
    }

    fs::File::create(db_path).unwrap();
}

fn db_file_exists() -> bool {
    let db_path = get_db_path();
    Path::new(&db_path).exists()
}

fn get_db_path() -> String {
    let config_dir = config_dir().unwrap();
    let app_dir = "local-lift-log";
    let filename = get_filename();

    let mut db_path = PathBuf::from(&config_dir);
    db_path.push(app_dir);
    db_path.push(filename);

    db_path.to_str().unwrap().to_string()
}

fn get_filename() -> String {
    dotenv().ok();
    let filename = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    filename
}
