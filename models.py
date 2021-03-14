'''Creates a class to use for the DB'''
from app import DB

class Player(DB.Model):
    ''' The DB entries will have id, username, and points '''
    id = DB.Column(DB.Integer, primary_key=True)
    username = DB.Column(DB.String(80), unique=True, nullable=False)
    points = DB.Column(DB.Integer, nullable=False)

    def __repr__(self):
        return '<Player %r>' % self.username
