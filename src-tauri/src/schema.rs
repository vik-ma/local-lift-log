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
        save_calculation_string -> SmallInt,
        show_calculation_buttons -> SmallInt,
        default_increment_calculation_multiplier -> Float,
        default_calculation_tab -> Text,
        shown_workout_properties -> Text,
        default_plate_calculation_id -> Integer,
    }
}

diesel::table! {
    exercises (id) {
        id -> Integer,
        name -> Text,
        exercise_group_set_string -> Text,
        note -> Nullable<Text>,
        is_favorite -> SmallInt,
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
        day -> SmallInt,
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
        partial_reps -> SmallInt,
        is_tracking_weight -> SmallInt,
        is_tracking_reps -> SmallInt,
        is_tracking_rir -> SmallInt,
        is_tracking_rpe -> SmallInt,
        is_tracking_time -> SmallInt,
        is_tracking_distance -> SmallInt,
        is_tracking_resistance_level -> SmallInt,
        is_tracking_partial_reps -> SmallInt,
        is_tracking_user_weight -> SmallInt,
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
    }
}

diesel::table! {
    user_weights (id) {
        id -> Integer,
        weight -> Float,
        weight_unit -> Text,
        date -> Text,
        comment -> Nullable<Text>,
    }
}

diesel::table! {
    equipment_weights (id) {
        id -> Integer,
        name -> Text,
        weight -> Float,
        weight_unit -> Text,
        is_favorite -> SmallInt,
    }
}

diesel::table! {
    distances (id) {
        id -> Integer,
        name -> Text,
        distance -> Float,
        distance_unit -> Text,
        is_favorite -> SmallInt,
    }
}

diesel::table! {
    measurements (id) {
        id -> Integer,
        name -> Text,
        default_unit -> Text,
        measurement_type -> Text,
        is_favorite -> SmallInt,
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
        multiset_type -> SmallInt,
        set_order -> Text,
        is_template -> SmallInt,
        note -> Nullable<Text>,
    }
}

diesel::table! {
    plate_calculations (id) {
        id -> Integer,
        name -> Text,
        handle_id -> Integer,
        available_plates_string -> Text,
        num_handles -> SmallInt,
        weight_unit -> Text,
    }
}
