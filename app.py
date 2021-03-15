'''The backend, written in python'''
import os
from flask import Flask, send_from_directory, json
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())  # This is to load your env variables from .env

APP = Flask(__name__, static_folder='./build/static')
# Point SQLAlchemy to your Heroku database
APP.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# Gets rid of a warning
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB = SQLAlchemy(APP)
# IMPORTANT: This must be AFTER creating db variable to prevent
# circular import issues
import models

DB.create_all()

CORS = CORS(APP, resources={r"/*": {"origins": "*"}})
SOCKETIO = SocketIO(APP,
                    cors_allowed_origins="*",
                    json=json,
                    manage_session=False)


@APP.route('/', defaults={"filename": "index.html"})
@APP.route('/<path:filename>')
def index(filename):
    '''Used for index'''
    return send_from_directory('./build', filename)


def print_players():
    '''Function used to output the current rankings of players.'''
    player_names = DB.session.query(models.Player.username).order_by(
        models.Player.points.desc())
    names = []
    for i in player_names:
        names.append(str(i))

    new_names = format_list(names)

    return new_names


def print_points():
    '''Function used to output a list of rankings'''
    player_points = DB.session.query(models.Player.points).order_by(
        models.Player.points.desc())
    pts = []
    for i in player_points:
        pts.append(str(i))

    new_points = format_list(pts)
    return new_points


def format_list(old):
    '''Properly formats the list we send back'''
    new_list = []
    for value in enumerate(old):
        temp = value[1]
        temp = temp.replace("(", "")
        temp = temp.replace(")", "")
        temp = temp.replace("'", "")
        temp = temp.replace(",", "")
        new_list.append(temp)

    return new_list


def add_player(name):
    '''Function to add username to DB'''
    all_players = models.Player.query.all()
    users = []
    for player in all_players:
        users.append(player.username)
    if name not in users:
        new_user = models.Player(username=name, points=100)
        DB.session.add(new_user)
        DB.session.commit()
        return True

    return False


def update_points(name, status):
    '''Used to update the point totals for a specifc user'''
    user = DB.session.query(models.Player).filter_by(username=name).first()
    if status == 'win':
        setattr(user, 'points', user.points + 1)
        DB.session.commit()
        user = models.Player.query.filter_by(username=name).first()
        print("Winner's Points")
        print(user.points)

    if status == 'loss':
        setattr(user, 'points', user.points - 1)
        DB.session.commit()
        user = models.Player.query.filter_by(username=name).first()
        print("Loser's Points")
        print(user.points)


@SOCKETIO.on('connect')
def on_connect():
    '''When a client connects from this Socket connection, this function is run'''
    print('User connected!')


@SOCKETIO.on('disconnect')
def on_disconnect():
    '''When a client disconnects from this Socket connection, this function is run'''
    print('User disconnected!')


@SOCKETIO.on('move')
def on_move(data):
    '''When a client emits the event 'move' to the server, this function is run'''
    print(str(data))
    SOCKETIO.emit('move', data, broadcast=True, include_self=False)


# Have a players and Spectators array in the back end.
PLAYERS = []
SPECTATORS = []


@SOCKETIO.on('login')
def on_login(data):
    '''When a client logs in'''
    if data['name'] in PLAYERS:
        SOCKETIO.emit('deny', data, broadcast=True, include_self=True)
    elif data['name'] in SPECTATORS:
        SOCKETIO.emit('deny', data, broadcast=True, include_self=True)
    else:
        SOCKETIO.emit('confirm', data, broadcast=True, include_self=True)
        var = add_player(data['name'])

        if var:
            print("New user added")
        else:
            print("Returning user not added")

        if len(PLAYERS) < 2:
            PLAYERS.append(data['name'])
        else:
            SPECTATORS.append(data['name'])

        data['players'] = PLAYERS
        data['spectators'] = SPECTATORS
        data['ready'] = False
        data['rank_names'] = print_players()
        data['rank_points'] = print_points()

        if len(PLAYERS) == 2:
            data['ready'] = True

        SOCKETIO.emit('login', data, broadcast=True, include_self=True)


# Variable to store the current winner
CURRENT_WINNER = ""


@SOCKETIO.on('winner')
def on_winner(data):
    ''' This function will get a winner and update the DB accordingly '''
    global CURRENT_WINNER

    print(str(data))
    if CURRENT_WINNER == "":
        CURRENT_WINNER = data["name"]
        update_points(CURRENT_WINNER, 'win')
        print("CURRENT WINNER IS: " + CURRENT_WINNER)
        data['rank_names'] = print_players()
        data['rank_points'] = print_points()
        SOCKETIO.emit('update', data, broadcast=True, include_self=True)


# Variable to store current loser
CURRENT_LOSER = ""


@SOCKETIO.on('loser')
def on_loser(
        data):  # This function will get a winner and update the DB accordingly
    ''' When the player who lost sends a message to the client '''
    global CURRENT_LOSER

    print(str(data))
    if CURRENT_LOSER == "":
        CURRENT_LOSER = data["name"]
        update_points(CURRENT_LOSER, 'loss')
        print("CURRENT LOSER IS: " + CURRENT_LOSER)
        data['rank_names'] = print_players()
        data['rank_points'] = print_points()
        SOCKETIO.emit('update', data, broadcast=True, include_self=True)


# Use an array to hold the players who hit restart.
RESTART = []


@SOCKETIO.on('restart')
def on_restart(
        data):  # data is whatever arg you pass in your emit call on client
    ''' When the reset event is recieved '''
    global CURRENT_WINNER
    global CURRENT_LOSER
    print(str(data))

    if data['username'] not in RESTART:
        if data['username'] in PLAYERS:
            RESTART.append(data['username'])

    print(RESTART)

    if len(RESTART) == 2:
        SOCKETIO.emit('confirm_restart',
                      data,
                      broadcast=True,
                      include_self=True)
        CURRENT_WINNER = ""
        CURRENT_LOSER = ""
        print("AFTER RESTART, CURRENT WINNER IS: " + CURRENT_WINNER)
        print("AND CURRENT LOSER IS: " + CURRENT_LOSER)
        RESTART.clear()

    elif data['username'] in PLAYERS:
        SOCKETIO.emit('restart', data, broadcast=True, include_self=True)


# Note we need to add this line so we can import app in the python shell
if __name__ == "__main__":
    # Note that we don't call app.run anymore. We call socketio.run with app arg
    SOCKETIO.run(
        APP,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )
