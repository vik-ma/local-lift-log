// @generated automatically by Diesel CLI.

diesel::table! {
    routines (id) {
        id -> Integer,
        name -> Text,
        note -> Nullable<Text>,
        is_schedule_weekly -> Bool,
        num_days_in_schedule -> SmallInt,
        custom_schedule_start_date -> Nullable<Text>,
    }
}

diesel::table! {
    user_settings (id) {
        id -> Integer,
        show_timestamp_on_completed_set -> Bool,
        active_routine_id -> Integer,
    }
}

diesel::table! {
    exercises (id) {
        id -> Integer,
        name -> Text,
        exercise_group_set_string -> Text,
        note -> Nullable<Text>,
    }
}

diesel::table! {
    workout_templates (id) {
        id -> Integer,
        name -> Text,
        set_list_order -> Text,
        note -> Nullable<Text>,
    }
}

diesel::table! {
    workout_template_schedules (id) {
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
        is_template -> Bool,
        workout_template_id -> Integer,
        note -> Nullable<Text>,
        comment -> Nullable<Text>,
        is_completed -> Bool,
        time_completed -> Nullable<Text>,
        is_warmup -> Bool,
        weight -> Float,
        reps -> SmallInt,
        rir -> SmallInt,
        time_in_seconds -> Integer,
        distance -> Float,
        resistance_level -> Float,
        is_tracking_weight -> Bool,
        is_tracking_reps -> Bool,
        is_tracking_rir -> Bool,
        is_tracking_rpe -> Bool,
        is_tracking_time -> Bool,
        is_tracking_distance -> Bool,
        is_tracking_resistance_level -> Bool,
        weight_unit -> Nullable<Text>,
        distance_unit -> Nullable<Text>,
    }
}
