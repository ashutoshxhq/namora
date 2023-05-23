NPROCS = $(shell grep -c 'processor' /proc/cpuinfo)
MAKEFLAGS += -j$(NPROCS)

.PHONY: dev-extension-start
dev-extension-start:
	@echo "Starting web extension..."
	pnpm run start

.PHONY: dev-extension-tailwind-start
dev-extension-tailwind-start:
	@echo "Starting tailwind watcher..."
	npx tailwindcss -i ./src/input.css -o ./src/output.css --watch

dev: dev-extension-start dev-extension-tailwind-start