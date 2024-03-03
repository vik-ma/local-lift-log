use dotenvy::dotenv;
use std::env;
use std::fs;
use std::path::Path;

pub fn init() {
    if !db_file_exists() {
        create_db_file();
    }
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
    let module_path = std::module_path!();
    let parent_dir = Path::new(&module_path).parent().unwrap();
    let filename = get_filename();
    let db_path = parent_dir.join(filename);
    db_path.to_str().unwrap().to_string()
}

fn get_filename() -> String {
    dotenv().ok();
    let filename = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    filename
}
