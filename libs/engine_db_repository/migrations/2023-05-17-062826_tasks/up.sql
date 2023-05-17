-- Your SQL goes here

create table tasks (
    id uuid default uuid_generate_v4() not null primary key,
    task_type varchar not null,
    title varchar not null,
    description text,
    plan jsonb,
    trigger jsonb,
    status varchar not null,
    user_id uuid not null references users,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);

create table task_activity_logs (
    id uuid default uuid_generate_v4() not null primary key,
    activity_type varchar not null,
    description text,
    data jsonb not null,
    task_id uuid not null references tasks,
    user_id uuid not null references users,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);
