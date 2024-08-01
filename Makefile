login:
	docker login agents.azurecr.io --username agents

build:
	sudo docker build -t agents.azurecr.io/abhdevdb .

push: 
	docker push agents.azurecr.io/abhdevdb:latest



