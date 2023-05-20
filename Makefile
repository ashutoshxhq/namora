NPROCS = $(shell grep -c 'processor' /proc/cpuinfo)
MAKEFLAGS += -j$(NPROCS)

dev: dev-engine dev-console

.PHONY: dev-engine
dev-engine:
	@echo "Starting engine service..."
	cd apps/engine-service && cargo run

.PHONY: dev-console
dev-console:
	@echo "Starting web console..."
	cd apps/web-console && pnpm run dev

.PHONY: dev-console
dev-extension:
	@echo "Starting web extension..."
	cd apps/web-extension && pnpm run start