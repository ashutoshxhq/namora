-- Your SQL goes here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table jobs (
    id uuid default uuid_generate_v4() not null primary key,
    name varchar not null,
    plan jsonb not null,
    status varchar not null,
    trigger jsonb not null,
    user_id uuid not null,
    team_id uuid not null,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);

create table review_artifacts (
    id uuid default uuid_generate_v4() not null primary key,
    artifact_type varchar not null,
    data jsonb not null,
    status varchar not null,
    job_id uuid not null,
    team_id uuid not null,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);