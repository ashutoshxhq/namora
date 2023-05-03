-- Your SQL goes here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
create table teams (
    id uuid default uuid_generate_v4() not null primary key,
    company_name varchar,
    company_website varchar,
    company_description varchar,
    company_email varchar,
    company_phone varchar,
    company_address varchar,
    vessel_connection_id varchar,
    vessel_access_token varchar,
    stripe_customer_id varchar,
    stripe_subscription_id varchar,
    plan varchar,
    subscription_status varchar,
    no_of_seats int default 1,
    trial_started_at timestamp,
    metadata jsonb,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);

create table users (
    id uuid default uuid_generate_v4() not null primary key,
    firstname varchar,
    lastname varchar,
    email varchar,
    username varchar,
    company_position varchar,
    position_description varchar,
    role varchar not null,
    credits int default 0,
    connection varchar,
    idp_user_id varchar not null,
    profile_pic varchar,
    readme text,
    timezone varchar,
    metadata jsonb,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);

create table review_jobs (
    id uuid default uuid_generate_v4() not null primary key,
    name varchar not null,
    plan jsonb not null,
    status varchar not null,
    trigger jsonb not null,
    user_id uuid not null references users,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);

create table review_artifacts (
    id uuid default uuid_generate_v4() not null primary key,
    artifact_type varchar not null,
    data jsonb not null,
    status varchar not null,
    job_id uuid not null references review_jobs,
    user_id uuid not null references users,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);