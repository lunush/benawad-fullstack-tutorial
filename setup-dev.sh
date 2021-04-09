podman run --rm -d -p 6379:6379 --name lireddit-reddis docker.io/redis:alpine
podman run --rm -d -p 5432:5432 --name lireddit-postgres -e POSTGRES_DB=lireddit -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres docker.io/postgres:alpine
