-- Your SQL goes here

create table nylas_accounts (
    id uuid default uuid_generate_v4() not null primary key,
    account_id varchar not null,
    email_address varchar not null,
    access_token varchar not null,
    provider varchar not null,
    token_type varchar not null,
    status varchar not null,
    user_id uuid not null references users,
    team_id uuid not null references teams,
    created_at timestamp default CURRENT_TIMESTAMP,
    updated_at timestamp default CURRENT_TIMESTAMP,
    deleted_at timestamp
);