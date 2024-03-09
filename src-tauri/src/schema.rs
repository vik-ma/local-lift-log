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
        note -> Nullable<Text>
    }
}
