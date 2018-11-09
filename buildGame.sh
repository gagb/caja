set -x
docker exec -it --env SERVER=$SERVER --env DATABASE=$DATABASE --env USER=$USER --env PASSWORD=$PASSWORD ${SERVER_CONTAINER} bash -c "cd /app && python backend/buildgame.py $1"
