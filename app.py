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


def print_players():
    '''Function used to output the current rankings of players.'''
    all_players = db.session.query(models.Player.username).order_by(models.Player.points.desc())
    users = []
    for player in all_players:
        users.append(player.username)

    return users
    
def print_points():
    '''Function used to output a list of rankings'''
    all_players = db.session.query(models.Player.points).order_by(models.Player.points.desc())
    points = []
    for player in all_players:
        points.append(player.points)

    return points


def add_player(name):
    '''Function to add username to DB'''
    all_players = models.Player.query.all()
    users = []
    for player in all_players:
        users.append(player.username)
    if name not in users:
        new_user = models.Player(username=name, points=100)
        db.session.add(new_user)
        db.session.commit()
        print("Added new user: ")
        print(name)
    else:
        print("Duplicate user will not be added")


def update_points(name, status):
    '''Used to update the point totals for a specifc user'''
    user = db.session.query(models.Player).filter_by(username=name).first()
    if status == 'win':
        setattr(user, 'points', user.points+1)
        db.session.commit()
        user = models.Player.query.filter_by(username=name).first()
        print("Winner's Points")
        print(user.points)
    
    if status == 'loss':
        setattr(user, 'points', user.points-1)
        db.session.commit()
        user = models.Player.query.filter_by(username=name).first()
        print("Loser's Points")
        print(user.points)

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
def on_move(data): # data is whatever arg you pass in your emit call on client
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
        add_player(data['name'])

        if len(players) < 2:
            players.append(data['name'])
        else:
            spectators.append(data['name'])

        data['players'] = players
        data['spectators'] = spectators
        data['ready'] = False

        if len(players) == 2:
            data['ready'] = True

        socketio.emit('login', data, broadcast=True, include_self=True)

current_winner = ""
@socketio.on('winner')
def on_winner(data): # This function will get a winner and update the DB accordingly
    global current_winner
    
    print(str(data))
    if current_winner == "":
        current_winner = data["name"]
        update_points(current_winner, 'win')
        print("CURRENT WINNER IS: " + current_winner)


current_loser = ""
@socketio.on('loser')
def on_loser(data): # This function will get a winner and update the DB accordingly
    global current_loser
    
    print(str(data))
    if current_loser == "":
        current_loser = data["name"]
        update_points(current_loser, 'loss')
        print("CURRENT LOSER IS: " + current_loser)


restart = []
@socketio.on('restart')
def on_restart(data): # data is whatever arg you pass in your emit call on client
    global current_winner
    global current_loser
    print(str(data))

    if data['username'] not in restart:
        if data['username'] in players:
            restart.append(data['username'])

    print(restart)

    if len(restart) == 2:
        socketio.emit('confirm_restart', data, broadcast=True, include_self=True)
        current_winner = ""
        current_loser = ""
        print("AFTER RESTART, CURRENT WINNER IS: " + current_winner +" AND CURRENT LOSER IS: " + current_loser)
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
