NPROCS = $(shell grep -c 'processor' /proc/cpuinfo)
MAKEFLAGS += -j$(NPROCS)

.PHONY: dev-engine
dev-engine:
	@echo "Starting engine service..."
	cd apps/engine-service && cargo run

.PHONY: dev-console
dev-console:
	@echo "Starting web console..."
	cd apps/web-console && pnpm run dev

.PHONY: dev-extension-start
dev-extension-start:
	@echo "Starting web extension..."
	cd apps/web-extension && pnpm run start

.PHONY: dev-extension-tailwind-start
dev-extension-tailwind-start:
	@echo "Starting web extension..."
	cd apps/web-extension && pnpm run start

dev-extension: dev-extension-start dev-extension-tailwind-start 