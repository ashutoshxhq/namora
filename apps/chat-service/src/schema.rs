// @generated automatically by Diesel CLI.

diesel::table! {
    teams (id) {
        id -> Uuid,
        name -> Nullable<Varchar>,
        website -> Nullable<Varchar>,
        about -> Nullable<Text>,
        no_of_seats -> Nullable<Int4>,
        metadata -> Nullable<Jsonb>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        firstname -> Varchar,
        lastname -> Varchar,
        email -> Varchar,
        password -> Varchar,
        username -> Varchar,
        role -> Varchar,
        profile_pic -> Nullable<Varchar>,
        about -> Nullable<Text>,
        timezone -> Nullable<Varchar>,
        metadata -> Nullable<Jsonb>,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(users -> teams (team_id));

diesel::allow_tables_to_appear_in_same_query!(
    teams,
    users,
);
