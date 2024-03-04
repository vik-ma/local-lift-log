use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::routines)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Routine {
    pub id: i32,
    pub name: String,
    pub note: Option<String>,
    pub is_schedule_weekly: bool,
    pub num_days_in_schedule: i16,
    pub custom_schedule_start_date: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserSetting {
    pub id: i32,
    pub show_timestamp_on_completed_set: bool,
}
