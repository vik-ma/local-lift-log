use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::routines)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Routine {
    pub id: i32,
    pub name: String,
    pub note: Option<String>,
    pub is_schedule_weekly: i16,
    pub num_days_in_schedule: i16,
    pub custom_schedule_start_date: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserSetting {
    pub id: i32,
    pub show_timestamp_on_completed_set: i16,
    pub active_routine_id: i32,
    pub default_unit_weight: String,
    pub default_unit_distance: String,
    pub default_time_input: String,
    pub default_unit_measurement: String,
    pub active_tracking_measurements: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::exercises)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Exercise {
    pub id: i32,
    pub name: String,
    pub exercise_group_set_string: String,
    pub note: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::workout_templates)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WorkoutTemplate {
    pub id: i32,
    pub name: String,
    pub set_list_order: String,
    pub exercise_order: String,
    pub note: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::workout_routine_schedules)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WorkoutRoutineSchedule {
    pub id: i32,
    pub day: i16,
    pub workout_template_id: i32,
    pub routine_id: i32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::sets)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Set {
    pub id: i32,
    pub workout_id: i32,
    pub exercise_id: i32,
    pub is_template: i16,
    pub workout_template_id: i32,
    pub note: Option<String>,
    pub comment: Option<String>,
    pub is_completed: i16,
    pub time_completed: Option<String>,
    pub is_warmup: i16,
    pub weight: f32,
    pub reps: i32,
    pub rir: i16,
    pub rpe: i16,
    pub time_in_seconds: i32,
    pub distance: f32,
    pub resistance_level: f32,
    pub is_tracking_weight: i16,
    pub is_tracking_reps: i16,
    pub is_tracking_rir: i16,
    pub is_tracking_rpe: i16,
    pub is_tracking_time: i16,
    pub is_tracking_distance: i16,
    pub is_tracking_resistance_level: i16,
    pub weight_unit: Option<String>,
    pub distance_unit: Option<String>,
    pub is_superset: i16,
    pub is_dropset: i16,
    pub multiset_values: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::workouts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Workout {
    pub id: i32,
    pub workout_template_id: i32,
    pub date: String,
    pub set_list_order: String,
    pub exercise_order: String,
    pub note: Option<String>,
    pub is_loaded: i16,
    pub rating: i16,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_weights)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserWeight {
    pub id: i32,
    pub weight: f32,
    pub weight_unit: String,
    pub date: String,
    pub comment: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::equipment_weights)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct EquipmentWeight {
    pub id: i32,
    pub name: String,
    pub weight: f32,
    pub weight_unit: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::distances)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Distance {
    pub id: i32,
    pub name: String,
    pub distance: f32,
    pub distance_unit: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::measurements)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Measurement {
    pub id: i32,
    pub name: String,
    pub default_unit: String,
    pub measurement_type: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_measurements)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserMeasurement {
    pub id: i32,
    pub measurement_id: i32,
    pub value: f32,
    pub unit: String,
    pub user_measurement_entry_id: i32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_measurement_entries)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserMeasurementEntry {
    pub id: i32,
    pub date: String,
    pub comment: Option<String>,
}
