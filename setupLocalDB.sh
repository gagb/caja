set -x
docker pull microsoft/mssql-server-linux:2017-latest

docker stop ${DB_CONTAINER} 
docker rm ${DB_CONTAINER}
docker run -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=$PASSWORD" \
		   -p 1433:1433 --name ${DB_CONTAINER} \
		   -d microsoft/mssql-server-linux:2017-latest
sleep 5
docker exec -it ${DB_CONTAINER} /opt/mssql-tools/bin/sqlcmd \
		    -S localhost -U SA -P "$PASSWORD" \
			-Q "CREATE DATABASE $DATABASE"
