set -x
docker stop ${SERVER_CONTAINER}
docker rm ${SERVER_CONTAINER}
docker run -d -it --name ${SERVER_CONTAINER} -p ${HOST_PORT}:5000 ${SERVER_IMAGE}
docker exec -it ${SERVER_CONTAINER} rm -rf /app
docker exec -it ${SERVER_CONTAINER} mkdir /app
docker cp ./. ${SERVER_CONTAINER}:/app
docker exec -it --env FLASK_ENV=${FLASK_ENV} --env SERVER=$SERVER --env DATABASE=$DATABASE --env USER=$USER --env PASSWORD=$PASSWORD ${SERVER_CONTAINER} bash -c "cd /app && python backend/app.py"
