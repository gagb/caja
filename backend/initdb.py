import dbutils

conn = dbutils.connect()
cursor = conn.cursor()

def count_tables():
    query = """
            SELECT COUNT(TABLE_NAME) FROM INFORMATION_SCHEMA.TABLES;
            """
    count = cursor.execute(query).fetchval()
    return count

# def table_exists(table_name):
    # query = """
            # SELECT COUNT(*)
                    # FROM INFORMATION_SCHEMA.TABLES
                    # WHERE TABLE_NAME = '%s'
            # """ % table_name
    # count = cursor.execute(query).fetchval()
    # return count != 0

# def delete_table(table_name):
    # query = "DROP TABLE %s" % table_name
    # cursor.execute(query)
    # conn.commit()

print("Num tables: %s" % count_tables())
cursor.execute("""
       CREATE TABLE GamesNew(
       GAMEID VARCHAR(255) NOT NULL PRIMARY KEY,
       CONFIG TEXT NOT NULL,
       );
       """) 

print("Creating fresh InteractionLog")
cursor.execute("""
       CREATE TABLE InteractionLogNew(
       GAMEID VARCHAR(255) FOREIGN KEY REFERENCES GamesNew(GAMEID),
       HITID VARCHAR(255) NOT NULL,
       ASSIGNMENTID VARCHAR(255) NOT NULL,
       WORKERID VARCHAR(255) NOT NULL,
       H1FAIL TEXT NOT NULL,
       TIME BIGINT NOT NULL,
       ROUND INT NOT NULL,
       FEATURES TEXT NOT NULL,
       H INT NOT NULL,
       H1 INT NOT NULL,
       ACTION INT NOT NULL,
       SCORE FLOAT NOT NULL, 
       SURVEYCODE INT NOT NULL,
       PRIMARY KEY (WORKERID, ROUND)
       );
       """) 
conn.commit()

print("Num tables: %s" % count_tables())

conn.close()
