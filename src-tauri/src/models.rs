use diesel::prelude::*;

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::routines)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Routine {
    pub id: i32,
    pub name: String,
    pub note: Option<String>,
    pub schedule_type: i32,
    pub num_days_in_schedule: i32,
    pub start_day: i32,
    pub workout_template_order: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::user_settings)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct UserSetting {
    pub id: i32,
    pub show_timestamp_on_completed_set: i32,
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
    pub save_calculation_string: i32,
    pub show_calculation_buttons: i32,
    pub default_increment_calculation_multiplier: f32,
    pub default_calculation_tab: String,
    pub shown_workout_properties: String,
    pub default_plate_collection_id: i32,
    pub show_secondary_exercise_groups: i32,
    pub automatically_update_active_measurements: i32,
    pub default_num_new_sets: String,
    pub shown_time_period_properties: String,
    pub default_diet_log_day_is_yesterday: i32,
    pub show_warmups_in_exercise_details: i32,
    pub show_multisets_in_exercise_details: i32,
    pub show_pace_in_exercise_details: i32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::exercises)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Exercise {
    pub id: i32,
    pub name: String,
    pub exercise_group_set_string_primary: String,
    pub exercise_group_map_string_secondary: Option<String>,
    pub note: Option<String>,
    pub is_favorite: i32,
    pub calculation_string: String,
    pub chart_load_exercise_options: String,
    pub chart_load_exercise_options_categories: String,
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
    pub day: i32,
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
    pub is_template: i32,
    pub workout_template_id: i32,
    pub note: Option<String>,
    pub comment: Option<String>,
    pub is_completed: i32,
    pub time_completed: Option<String>,
    pub is_warmup: i32,
    pub weight: f32,
    pub reps: i32,
    pub rir: i32,
    pub rpe: i32,
    pub time_in_seconds: i32,
    pub distance: f32,
    pub resistance_level: f32,
    pub partial_reps: i32,
    pub is_tracking_weight: i32,
    pub is_tracking_reps: i32,
    pub is_tracking_rir: i32,
    pub is_tracking_rpe: i32,
    pub is_tracking_time: i32,
    pub is_tracking_distance: i32,
    pub is_tracking_resistance_level: i32,
    pub is_tracking_partial_reps: i32,
    pub is_tracking_user_weight: i32,
    pub weight_unit: String,
    pub distance_unit: String,
    pub multiset_id: i32,
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
    pub routine_id: i32,
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
    pub body_fat_percentage: Option<f32>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::equipment_weights)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct EquipmentWeight {
    pub id: i32,
    pub name: String,
    pub weight: f32,
    pub weight_unit: String,
    pub is_favorite: i32,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::distances)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Distance {
    pub id: i32,
    pub name: String,
    pub distance: f32,
    pub distance_unit: String,
    pub is_favorite: i32,
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
    pub multiset_type: i32,
    pub set_order: String,
    pub is_template: i32,
    pub note: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::plate_collections)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct PlateCollection {
    pub id: i32,
    pub name: String,
    pub handle_id: i32,
    pub available_plates_string: String,
    pub num_handles: i32,
    pub weight_unit: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::time_periods)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct TimePeriod {
    pub id: i32,
    pub name: String,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub note: Option<String>,
    pub diet_phase: Option<String>,
    pub injury: Option<String>,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = crate::schema::diet_logs)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct DietLog {
    pub id: i32,
    pub date: String,
    pub calories: i32,
    pub fat: Option<i32>,
    pub carbs: Option<i32>,
    pub protein: Option<i32>,
    pub comment: Option<String>,
}