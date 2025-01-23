// @generated automatically by Diesel CLI.

diesel::table! {
    routines (id) {
        id -> Integer,
        name -> Text,
        note -> Nullable<Text>,
        is_schedule_weekly -> Integer,
        num_days_in_schedule -> Integer,
        start_day -> Integer,
        workout_template_order -> Nullable<Text>,
    }
}

diesel::table! {
    user_settings (id) {
        id -> Integer,
        show_timestamp_on_completed_set -> Integer,
        active_routine_id -> Integer,
        default_unit_weight -> Text,
        default_unit_distance -> Text,
        default_time_input -> Text,
        default_unit_measurement -> Text,
        active_tracking_measurements -> Text,
        locale -> Text,
        clock_style -> Text,
        time_input_behavior_hhmmss -> Text,
        time_input_behavior_mmss -> Text,
        default_increment_weight -> Float,
        default_increment_distance -> Float,
        default_increment_time -> Integer,
        default_increment_resistance_level -> Float,
        save_calculation_string -> Integer,
        show_calculation_buttons -> Integer,
        default_increment_calculation_multiplier -> Float,
        default_calculation_tab -> Text,
        shown_workout_properties -> Text,
        default_plate_collection_id -> Integer,
        workout_ratings_order -> Text,
        show_secondary_exercise_groups -> Integer,
        automatically_update_active_measurements -> Integer,
        default_num_new_sets -> Text,
        shown_time_period_properties -> Text,
        default_diet_log_day_is_yesterday -> Integer,
    }
}

diesel::table! {
    exercises (id) {
        id -> Integer,
        name -> Text,
        exercise_group_set_string_primary -> Text,
        exercise_group_set_string_secondary -> Nullable<Text>,
        note -> Nullable<Text>,
        is_favorite -> Integer,
        calculation_string -> Nullable<Text>,
    }
}

diesel::table! {
    workout_templates (id) {
        id -> Integer,
        name -> Text,
        exercise_order -> Text,
        note -> Nullable<Text>,
    }
}

diesel::table! {
    workout_routine_schedules (id) {
        id -> Integer,
        day -> Integer,
        workout_template_id -> Integer,
        routine_id -> Integer,
    }
}

diesel::table! {
    sets (id) {
        id -> Integer,
        workout_id -> Integer,
        exercise_id -> Integer,
        is_template -> Integer,
        workout_template_id -> Integer,
        note -> Nullable<Text>,
        comment -> Nullable<Text>,
        is_completed -> Integer,
        time_completed -> Nullable<Text>,
        is_warmup -> Integer,
        weight -> Float,
        reps -> Integer,
        rir -> Integer,
        rpe -> Integer,
        time_in_seconds -> Integer,
        distance -> Float,
        resistance_level -> Float,
        partial_reps -> Integer,
        is_tracking_weight -> Integer,
        is_tracking_reps -> Integer,
        is_tracking_rir -> Integer,
        is_tracking_rpe -> Integer,
        is_tracking_time -> Integer,
        is_tracking_distance -> Integer,
        is_tracking_resistance_level -> Integer,
        is_tracking_partial_reps -> Integer,
        is_tracking_user_weight -> Integer,
        weight_unit -> Text,
        distance_unit -> Text,
        multiset_id -> Integer,
        user_weight -> Float,
        user_weight_unit -> Text,
    }
}

diesel::table! {
    workouts (id) {
        id -> Integer,
        workout_template_id -> Integer,
        date -> Text,
        exercise_order -> Text,
        note -> Nullable<Text>,
        rating_general -> Integer,
        rating_energy -> Integer,
        rating_injury -> Integer,
        rating_sleep -> Integer,
        rating_calories -> Integer,
        rating_fasting -> Integer,
        rating_time -> Integer,
        rating_stress -> Integer,
        routine_id -> Integer,
    }
}

diesel::table! {
    user_weights (id) {
        id -> Integer,
        weight -> Float,
        weight_unit -> Text,
        date -> Text,
        comment -> Nullable<Text>,
        body_fat_percentage -> Nullable<Float>,
    }
}

diesel::table! {
    equipment_weights (id) {
        id -> Integer,
        name -> Text,
        weight -> Float,
        weight_unit -> Text,
        is_favorite -> Integer,
    }
}

diesel::table! {
    distances (id) {
        id -> Integer,
        name -> Text,
        distance -> Float,
        distance_unit -> Text,
        is_favorite -> Integer,
    }
}

diesel::table! {
    measurements (id) {
        id -> Integer,
        name -> Text,
        default_unit -> Text,
        measurement_type -> Text,
        is_favorite -> Integer,
    }
}

diesel::table! {
    user_measurements (id) {
        id -> Integer,
        date -> Text,
        comment -> Nullable<Text>,
        measurement_values -> Text,
    }
}

diesel::table! {
    multisets (id) {
        id -> Integer,
        multiset_type -> Integer,
        set_order -> Text,
        is_template -> Integer,
        note -> Nullable<Text>,
    }
}

diesel::table! {
    plate_collections (id) {
        id -> Integer,
        name -> Text,
        handle_id -> Integer,
        available_plates_string -> Text,
        num_handles -> Integer,
        weight_unit -> Text,
    }
}

diesel::table! {
    time_periods (id) {
        id -> Integer,
        name -> Text,
        start_date -> Nullable<Text>,
        end_date -> Nullable<Text>,
        note -> Nullable<Text>,
        caloric_intake -> Nullable<Text>,
        injury -> Nullable<Text>,
    }
}

diesel::table! {
    diet_logs (id) {
        id -> Integer,
        date -> Text,
        calories -> Integer,
        fat -> Option<Integer>,
        carbs -> Option<Integer>,
        protein -> Option<Integer>,
        comment -> Option<Text>,
    }
}
