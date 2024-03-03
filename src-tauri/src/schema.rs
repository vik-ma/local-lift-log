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
