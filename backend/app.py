import json
import os
from flask import Flask
from flask import send_from_directory
from flask_cors import CORS
from flask import request
from flask import abort

import dbutils

app = Flask(__name__)

@app.route("/")
def hello():
    return json.dumps({"status": "alive"})

@app.route("/static/<filename>")
def send_static_file(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, "frontend"), filename)

@app.route("/game/<gameid>/<workerid>", methods=["GET"])
def send_game_data(gameid, workerid):
    ok2play = dbutils.check_ok2play(gameid, workerid)
    if ok2play is True:
        config = dbutils.get_game_config(gameid)
        if config is not None:
            last_round, score = dbutils.get_last_round(gameid, workerid)
        else:
            abort(404)
        return json.dumps({"config": config, "round": last_round, "score": score})
    else:
        abort(404)


@app.route("/log", methods=["POST"])
def log2db():
    json_data = request.get_json()
    success = dbutils.insert_log(json_data)
    if not success:
        abort(404)
    return json.dumps({"success": success})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
