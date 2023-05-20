// @generated automatically by Diesel CLI.

diesel::table! {
    nylas_accounts (id) {
        id -> Uuid,
        account_id -> Varchar,
        email_address -> Varchar,
        access_token -> Varchar,
        provider -> Varchar,
        token_type -> Varchar,
        status -> Varchar,
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
        user_id -> Uuid,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    review_jobs (id) {
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
    task_activity_logs (id) {
        id -> Uuid,
        activity_type -> Varchar,
        description -> Nullable<Text>,
        data -> Jsonb,
        task_id -> Uuid,
        user_id -> Uuid,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    tasks (id) {
        id -> Uuid,
        task_type -> Varchar,
        title -> Varchar,
        description -> Nullable<Text>,
        plan -> Nullable<Jsonb>,
        trigger -> Nullable<Jsonb>,
        status -> Varchar,
        user_id -> Uuid,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    teams (id) {
        id -> Uuid,
        company_name -> Nullable<Varchar>,
        company_website -> Nullable<Varchar>,
        company_description -> Nullable<Varchar>,
        company_email -> Nullable<Varchar>,
        company_phone -> Nullable<Varchar>,
        company_address -> Nullable<Varchar>,
        vessel_connection_id -> Nullable<Varchar>,
        vessel_access_token -> Nullable<Varchar>,
        stripe_customer_id -> Nullable<Varchar>,
        stripe_subscription_id -> Nullable<Varchar>,
        plan -> Nullable<Varchar>,
        subscription_status -> Nullable<Varchar>,
        no_of_seats -> Nullable<Int4>,
        trial_started_at -> Nullable<Timestamp>,
        metadata -> Nullable<Jsonb>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        firstname -> Nullable<Varchar>,
        lastname -> Nullable<Varchar>,
        email -> Nullable<Varchar>,
        username -> Nullable<Varchar>,
        company_position -> Nullable<Varchar>,
        position_description -> Nullable<Varchar>,
        role -> Varchar,
        credits -> Nullable<Int4>,
        connection -> Nullable<Varchar>,
        idp_user_id -> Varchar,
        profile_pic -> Nullable<Varchar>,
        readme -> Nullable<Text>,
        timezone -> Nullable<Varchar>,
        metadata -> Nullable<Jsonb>,
        team_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(nylas_accounts -> teams (team_id));
diesel::joinable!(nylas_accounts -> users (user_id));
diesel::joinable!(review_artifacts -> review_jobs (job_id));
diesel::joinable!(review_artifacts -> teams (team_id));
diesel::joinable!(review_artifacts -> users (user_id));
diesel::joinable!(review_jobs -> teams (team_id));
diesel::joinable!(review_jobs -> users (user_id));
diesel::joinable!(task_activity_logs -> tasks (task_id));
diesel::joinable!(task_activity_logs -> teams (team_id));
diesel::joinable!(task_activity_logs -> users (user_id));
diesel::joinable!(tasks -> teams (team_id));
diesel::joinable!(tasks -> users (user_id));
diesel::joinable!(users -> teams (team_id));

diesel::allow_tables_to_appear_in_same_query!(
    nylas_accounts,
    review_artifacts,
    review_jobs,
    task_activity_logs,
    tasks,
    teams,
    users,
);
