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
    pub locale: String,
    pub clock_style: String,
    pub time_input_behavior_hhmmss: String,
    pub time_input_behavior_mmss: String,
    pub default_increment_weight: f32,
    pub default_increment_distance: f32,
    pub default_increment_time: i32,
    pub default_increment_resistance_level: f32,
    pub save_calculation_string: i16,
    pub show_calculation_buttons: i16,
    pub default_increment_calculation_multiplier: f32,
    pub default_calculation_tab: String,
    pub shown_workout_properties: String,
    pub default_plate_calculation_id: i32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::exercises)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Exercise {
    pub id: i32,
    pub name: String,
    pub exercise_group_set_string: String,
    pub note: Option<String>,
    pub is_favorite: i16,
    pub calculation_string: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::workout_templates)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct WorkoutTemplate {
    pub id: i32,
    pub name: String,
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
    pub partial_reps: i16,
    pub is_tracking_weight: i16,
    pub is_tracking_reps: i16,
    pub is_tracking_rir: i16,
    pub is_tracking_rpe: i16,
    pub is_tracking_time: i16,
    pub is_tracking_distance: i16,
    pub is_tracking_resistance_level: i16,
    pub is_tracking_partial_reps: i16,
    pub is_tracking_user_weight: i16,
    pub weight_unit: String,
    pub distance_unit: String,
    pub multiset_id: i16,
    pub user_weight: f32,
    pub user_weight_unit: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::workouts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Workout {
    pub id: i32,
    pub workout_template_id: i32,
    pub date: String,
    pub exercise_order: String,
    pub note: Option<String>,
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
    pub is_favorite: i16,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::distances)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Distance {
    pub id: i32,
    pub name: String,
    pub distance: f32,
    pub distance_unit: String,
    pub is_favorite: i16,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::measurements)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Measurement {
    pub id: i32,
    pub name: String,
    pub default_unit: String,
    pub measurement_type: String,
    pub is_favorite: SmallInt,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_measurements)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserMeasurement {
    pub id: i32,
    pub date: String,
    pub comment: Option<String>,
    pub measurement_values: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::multisets)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Multiset {
    pub id: i32,
    pub multiset_type: i16,
    pub set_order: String,
    pub is_template: i16,
    pub note: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::plate_calculations)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct PlateCalculation {
    pub id: i32,
    pub name: String,
    pub handle_id: i32,
    pub available_plates_string: String,
    pub num_handles: i16,
    pub weight_unit: String,
}