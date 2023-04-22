// @generated automatically by Diesel CLI.

diesel::table! {
    jobs (id) {
        id -> Uuid,
        name -> Varchar,
        plan -> Jsonb,
        status -> Varchar,
        trigger -> Jsonb,
        user_id -> Uuid,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    review_artifacts (id) {
        id -> Uuid,
        artifact_type -> Varchar,
        data -> Jsonb,
        status -> Varchar,
        job_id -> Uuid,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    jobs,
    review_artifacts,
);
