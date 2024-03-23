// @generated automatically by Diesel CLI.

diesel::table! {
    routines (id) {
        id -> Integer,
        name -> Text,
        note -> Nullable<Text>,
        is_schedule_weekly -> SmallInt,
        num_days_in_schedule -> SmallInt,
        custom_schedule_start_date -> Nullable<Text>,
    }
}

diesel::table! {
    user_settings (id) {
        id -> Integer,
        show_timestamp_on_completed_set -> SmallInt,
        active_routine_id -> Integer,
        default_unit_weight -> Text,
        default_unit_distance -> Text,
        default_time_input -> Text,
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
        is_template -> SmallInt,
        workout_template_id -> Integer,
        note -> Nullable<Text>,
        comment -> Nullable<Text>,
        is_completed -> SmallInt,
        time_completed -> Nullable<Text>,
        is_warmup -> SmallInt,
        weight -> Float,
        reps -> SmallInt,
        rir -> SmallInt,
        rpe -> SmallInt,
        time_in_seconds -> Integer,
        distance -> Float,
        resistance_level -> Float,
        is_tracking_weight -> SmallInt,
        is_tracking_reps -> SmallInt,
        is_tracking_rir -> SmallInt,
        is_tracking_rpe -> SmallInt,
        is_tracking_time -> SmallInt,
        is_tracking_distance -> SmallInt,
        is_tracking_resistance_level -> SmallInt,
        weight_unit -> Nullable<Text>,
        distance_unit -> Nullable<Text>,
    }
}

diesel::table! {
    workouts (id) {
        id -> Integer,
        workout_template_id -> Integer,
        date -> Text,
        set_list_order -> Text,
        note -> Nullable<Text>,
    }
}
