import os
import random
import json
import pyodbc

SERVER = os.environ["SERVER"]
USER = os.environ["USER"]
PASSWORD = os.environ["PASSWORD"]
DATABASE = os.environ["DATABASE"]
DRIVER = '{ODBC Driver 17 for SQL Server}'

def connect():
    conn_str = "DRIVER=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s" % (DRIVER,
            SERVER, DATABASE, USER, PASSWORD)
    conn = pyodbc.connect(conn_str)
    return conn

def insert_log(data):
    conn = connect()
    cursor = conn.cursor()
    query = """
            INSERT INTO InteractionLogNew (
               GAMEID,
               HITID,
               ASSIGNMENTID,
               WORKERID,
               H1FAIL,
               TIME,
               ROUND,
               FEATURES,
               H,
               H1,
               ACTION,
               SCORE, 
               SURVEYCODE)
            VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
            """ % (
                    data["gameid"],
                    data["hitid"],
                    data["assignmentid"],
                    data["workerid"],
                    json.dumps(data["h1fail"]),
                    data["time"],
                    data["round"],
                    json.dumps(data["features"]),
                    data["h"],
                    data["h1"],
                    data["action"],
                    data["score"],
                    data["code"],
                    )
    cursor.execute(query)
    conn.commit()
    conn.close()
    return True 

def get_last_round(gameid, workerid):
    conn = connect()
    cursor = conn.cursor()
    query = """
            SELECT ROUND, SCORE
                    FROM InteractionLogNew 
                    WHERE GAMEID = '%s' AND WORKERID = '%s'
                    ORDER BY ROUND DESC
            """ % (gameid, workerid)
    out = cursor.execute(query).fetchone()
    conn.close()
    last_round = None
    score = None
    if out is not None:
        last_round, score = out
    return last_round, score

def row2json(row):
    data = {
            "user": row[0],
            "round": row[1],
            "time": row[2],
            "action": row[3],
            "score": row[4]
            }
    return data

def yield_rows(table_name):
    conn = connect()
    cursor = conn.cursor()
    query = "SELECT * FROM %s" % table_name
    cursor.execute(query)
    while 1:
        row = cursor.fetchone()
        if row is None:
            conn.close()
            break
        yield row

def get_game_config(gameid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT CONFIG FROM GamesNew
    WHERE GAMEID='%s'
    """ % (gameid)
    print query
    config = cursor.execute(query).fetchval()
    if config is not None:
        config = json.loads(config)
    conn.close()
    print config
    return config

def get_data_samples(gameid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT * FROM DataSamples 
    WHERE GAMEID='%s'
    """ % (gameid)
    print query
    samples = cursor.execute(query).fetchall()
    conn.close()
    samples = [row2dict(row) for row in samples]
    return samples 

def row2dict(row):
    return {"samplenum": row[1], "features": row[2], "h": row[3], "h1": row[4]}

def create_user(userid, domain):
    conn = connect()
    cursor = conn.cursor()
    query = """
            SELECT COUNT(*)
                    FROM Users 
                    WHERE USERID = '%s'
            """ % userid 
    count = cursor.execute(query).fetchval()
    if count == 0:
        query = """
                INSERT INTO Users(USERID, SOURCE)
                VALUES ('%s', '%s')
                """ % (userid,
                        domain)
        cursor.execute(query)
        conn.commit()
    conn.close()
    return 


def generate_survey_code(gameid, userid, hitid, assignmentid):
    code = None
    conn = connect()
    cursor = conn.cursor()
    query = """
            SELECT COUNT(*)
                    FROM Assignments 
                    WHERE ASSIGNMENTID = '%s'
            """ % assignmentid 
    count = cursor.execute(query).fetchval()
    if count > 0:
        query = """
                SELECT SURVEYCODE 
                        FROM Assignments 
                        WHERE ASSIGNMENTID = '%s' AND USERID = '%s'
                """ % (assignmentid, userid)
        code  = cursor.execute(query).fetchval()

    if count == 0:
        code = random.randint(1000, 9999)
        query = """
                INSERT INTO Assignments(ASSIGNMENTID, GAMEID, USERID, HITID, SURVEYCODE)
                VALUES ('%s', '%s', '%s', '%s', '%s')
                """ % (assignmentid,
                        gameid,
                        userid,
                        hitid,
                        code)
        cursor.execute(query)
        conn.commit()
    conn.close()
    return code 

def getgame(gameid):
    config = get_game_config(gameid)
    return config 

def get_games():
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT * FROM GamesNew
    """
    data = cursor.execute(query).fetchall()
    conn.close()
    row2dict = lambda x: {"gameid": x[0], "config": json.loads(x[1])}
    data = [row2dict(row) for row in data]
    return data 

def get_assignments(gameid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT * FROM Assignments
    WHERE GAMEID='%s'
    """ % gameid
    assignments = cursor.execute(query).fetchall();
    row2dict = lambda x: {"assignmentid": x[0], "userid": x[2], "hitid": x[3], "code": x[4]}
    assignments = [row2dict(row) for row in assignments]
    conn.close()
    # print assignments
    return assignments 

def get_log(assignmentid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT * FROM InteractionLogNew 
    WHERE ASSIGNMENTID='%s'
    """ % assignmentid
    log = cursor.execute(query).fetchall();
    # print log
    conn.close()
    row2dict = lambda x: {"assignmentid": x[0], "samplenum": x[1], "time": x[2], "action": x[3], "score": x[4]}
    log = [row2dict(row) for row in log];
    return log 

def get_game_data(gameid):
    samples = get_data_samples(gameid)
    assignments = get_assignments(gameid)
    for i in range(len(assignments)):
        assignments[i]["log"] = get_log(assignments[i]["assignmentid"])
    data = {"samples": samples, "assignments": assignments}
    return data 

def is_new_worker(workerid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT COUNT(*) FROM InteractionLogNew 
    WHERE WORKERID='%s'
    """ % workerid
    count = cursor.execute(query).fetchval();
    conn.close()
    return count == 0 

def has_played(gameid, workerid):
    conn = connect()
    cursor = conn.cursor()
    query = """
    SELECT COUNT(*) FROM InteractionLogNew 
    WHERE WORKERID='%s' AND GAMEID='%s'
    """ % (workerid, gameid)
    count = cursor.execute(query).fetchval();
    conn.close()
    return count > 0 

def check_ok2play(gameid, workerid):
    if is_new_worker(workerid):
        return True
    else:
        if has_played(gameid, workerid):
            return True
        else:
            return False
