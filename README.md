## ft_transcendence

hive school project

Modules that we wanna do:

- Use framework as backend
- Use a front-end framework or toolkit.
- Use a database for the backend.
- Standard user management, authentication, users across tournaments
- Implementing a remote authentication.
- Game Customization Options.
- User and Game Stats Dashboards
- Implement WAF/ModSecurity with Hardened Configuration and HashiCorp Vault for Secrets Management.
- Implement Two-Factor Authentication (2FA) and JWT
- Support on all devices.
- Expanding Browser Compatibility.
- Multiple language supports
- Add accessibility for Visually Impaired Users.

## How to run

in first terminal

````sh
cd backend
npm i
npm run dev
```sh

in second terminal
```sh
cd frontend
npm i
npm run dev
````

# Run the app in Docker:

docker compose up --build

## Clean the Docker:

docker compose down --volumes --remove-orphans
docker system prune -a --volumes -f
