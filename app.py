import os
from flask import Flask, send_from_directory, json
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv()) # This is to load your env variables from .env

app = Flask(__name__, static_folder='./build/static')
# Point SQLAlchemy to your Heroku database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
# IMPORTANT: This must be AFTER creating db variable to prevent
# circular import issues
import models
db.create_all()


cors = CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)


# When a client connects from this Socket connection, this function is run
@socketio.on('connect')
def on_connect():
    print('User connected!')

# When a client disconnects from this Socket connection, this function is run
@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')

# When a client emits the event 'chat' to the server, this function is run
# 'chat' is a custom event name that we just decided
@socketio.on('move')
def on_chat(data): # data is whatever arg you pass in your emit call on client
    print(str(data))
    # This emits the 'chat' event from the server to all clients except for
    # the client that emmitted the event that triggered this function
    socketio.emit('move', data, broadcast=True, include_self=False)

players = []
spectators = []

@socketio.on('login')
def on_login(data): # data is whatever arg you pass in your emit call on client

    if data['name'] in players:
        socketio.emit('deny', data, broadcast=True, include_self=True)
    elif data['name'] in spectators:
        socketio.emit('deny', data, broadcast=True, include_self=True)
    else:
        socketio.emit('confirm', data, broadcast=True, include_self=True)
        if len(players) < 2:
            players.append(data['name'])
        else:
            spectators.append(data['name'])

        print(players)
        print(spectators)
        data['players'] = players
        data['spectators'] = spectators
        data['ready'] = False

        if len(players) == 2:
            data['ready'] = True

        socketio.emit('login', data, broadcast=True, include_self=True)


restart = []
@socketio.on('restart')
def on_restart(data): # data is whatever arg you pass in your emit call on client

    print(str(data))

    if data['username'] not in restart:
        if data['username'] in players:
            restart.append(data['username'])

    print(restart)

    if len(restart) == 2:
        socketio.emit('confirm_restart', data, broadcast=True, include_self=True)
        restart.clear()

    elif data['username'] in players:
        socketio.emit('restart', data, broadcast=True, include_self=True)


# Note we need to add this line so we can import app in the python shell
if __name__ == "__main__":
# Note that we don't call app.run anymore. We call socketio.run with app arg
    socketio.run(
        app,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
