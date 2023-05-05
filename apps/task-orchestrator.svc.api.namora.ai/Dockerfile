FROM rust:1.65 as builder
RUN mkdir ./apps
RUN mkdir ./libs
COPY --from=libs ./ ./libs
RUN cd apps && USER=root cargo new --bin task-orchestrator-service
WORKDIR ./apps/task-orchestrator-service

ADD . ./

RUN cargo build --release


FROM debian:bullseye-slim

ARG APP=/usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates tzdata libpq-dev gcc libc6-dev curl gnupg lsb-release \
    && rm -rf /var/lib/apt/lists/*
    

EXPOSE 8000

ENV TZ=Etc/UTC \
    APP_USER=appuser

RUN groupadd $APP_USER \
    && useradd -g $APP_USER $APP_USER \
    && mkdir -p ${APP}

COPY --from=builder /apps/task-orchestrator-service/target/release/task-orchestrator-service ${APP}/task-orchestrator-service
COPY --from=builder /apps/task-orchestrator-service/prompts ${APP}/prompts

RUN chown -R $APP_USER:$APP_USER ${APP}

USER $APP_USER
WORKDIR ${APP}

CMD ["./task-orchestrator-service"]