import sys
import json
import dbutils

conn = dbutils.connect()
cursor = conn.cursor()

configfile = sys.argv[1]
print configfile
config = json.load(open(configfile, "rb"))
gameid = config["id"]

conn = dbutils.connect()
cursor = conn.cursor()
# create new row in Games
query = """
        INSERT INTO GamesNew(GAMEID, CONFIG)
        VALUES ('%s', '%s')
        """ % (gameid, json.dumps(config))
print query
cursor.execute(query)
conn.commit()
conn.close()
