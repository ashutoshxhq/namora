NPROCS = $(shell grep -c 'processor' /proc/cpuinfo)
MAKEFLAGS += -j$(NPROCS)

dev: dev-engine dev-console

.PHONY: dev-engine
dev-engine:
	@echo "Starting engine service..."
	cd engine-service && cargo run

.PHONY: dev-console
dev-console:
	@echo "Starting web console..."
	cd console && npm run dev

.PHONY: dev-worker
dev-worker:
	@echo "Starting worker..."
	cd change-worker && cargo run

.PHONY: engine-migrate
engine-migrate:
	@echo "Migrating database..."
	cd engine-service && diesel migration run