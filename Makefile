all:
	make images
	make up

dev:
	cd backend && npm run dev & \
	cd frontend && npm run dev

images:
	docker compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up


down:
	docker compose -f ./docker-compose.yml down


clean: 
	docker compose -f ./docker-compose.yml down --rmi all -v

fclean: clean
	docker system prune -f --volumes

re: fclean all

.PHONY: all clean fclean re up down dev images