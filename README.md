# Project 2: 

## Link to final product:
https://murmuring-ocean-10847.herokuapp.com/

## Requirements
Install these in the environment if you don't have them already.
1. `npm install`
2. `pip install Flask`
3. `pip install -r requirements.txt`
4. `pip install flask-socketio`
5. `pip install flask-cors`
6. `npm install -g heroku` (Not needed if you only want to run locally)
7. `pip install psycopg2-binary`
8. `pip install Flask-SQLAlchemy==2.1`

## Setup
#### Clone the Repositoy
1. On `https://github.com/new`, create a new personal repository. Name it whatever you want.
2. In terminal, in your home directory, clone the repo: `https://github.com/NJIT-CS490-SP21/project2-as3627.git`.
3. `cd` into the repository that is created and you should see all the files.
4. Then, connect this cloned repo to your new personal repo made in Step 1: `git remote set-url origin https://www.github.com/{your-username}/{repo-name}` 
(be sure to change your username and repo-name and remove the curly braces)
5. Run `git push origin main` to push the local repo to remote. You should now see this same code in your personal repo.

#### After Cloning
1. Run `echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > .env.development.local` in the project directory
2. `cd` into `react-starter` directory, and run `npm install socket.io-client --save`

#### Database setup
These first steps are the general setup for databases.
1. Install PostGreSQL: `sudo yum install postgresql postgresql-server postgresql-devel postgresql-contrib postgresql-docs` Enter yes to all prompts.
2. Initialize PSQL database: `sudo service postgresql initdb`
3. Start PSQL: `sudo service postgresql start`
4. Make a new superuser: `sudo -u postgres createuser --superuser $USER` If you get an error saying "could not change directory", that's okay! It worked!
5. Make a new database: `sudo -u postgres createdb $USER` If you get an error saying "could not change directory", that's okay! It worked!
6. Type `psql`
- Type this with your username and password (DONT JUST COPY PASTE): `create user some_username_here superuser password 'some_unique_new_password_here';` 
e.g. `create user namanaman superuser password 'mysecretpassword123';`
- do `\q` to quit.
- Save your username and password in a `sql.env` file with the format `SQL_USER=` and `SQL_PASSWORD=` (Not in the directory, in your environment)


This next part is dealing with heroku databases.
1. In your terminal, go to the directory with `app.py.`
- Login and fill creds: `heroku login -i`
- Create a new Heroku app (if you haven't already): `heroku create --buildpack heroku/python`
- Create a new remote DB on your Heroku app: `heroku addons:create heroku-postgresql:hobby-dev` (If that doesn't work, add a 
`-a {your-app-name}` to the end of the command, no braces)
- See the config vars set by Heroku for you: `heroku config`. Copy paste the value for DATABASE_URL
- Create a `.env` file and add set our var DATABASE\_URL. Run `touch .env && echo "DATABASE_URL='copy-paste-database-url-here'" > .env`
2. In the terminal, run `python` to open up an interactive session. Let's initialize a new database in it using SQLAlchemy functions. Type in these Python lines one by one:
```
>> from app import db
>> import models
>> db.create_all()
```
- Note that if you don't do this, it can cause an issue with connecting to the DB, and can freeze up the game.

#### Sign up for a Heroku Account (Not needed if you want to run locally only)
1. You can sign up for a free Heroku account on their website here: [https://signup.heroku.com/login](https://signup.heroku.com/login).
2. Heroku is used to host the web app.

## Run Application
1. Run command in terminal (in your project directory): `python app.py`
2. Run command in another terminal, `cd` into the project directory, and run `npm run start`
3. Preview web page in browser `'/'`

## Deploy to Heroku
1. Create a Heroku app (if you haven't already): `heroku create --buildpack heroku/python`
2. Add the nodejs buildpack: `heroku buildpacks:add --index 1 heroku/nodejs`
3. Push to Heroku: `git push heroku main`


## Known Problems / Future Features to Implement
1. One known problem is that when a user disconnects (closes tab, window, etc.) the player list and 
spectators list will not remove them. This can cause a mjaor issue if one of the players disconnect,
causing the game to be stuck waiting for a player who left to make a move. For the sake of milestone 1, we
assumed no one leaves the game and that everyone connects before the first move is made, but this is still
a ploblem that I have to acknowledge. One solution could be the use of pinging each client. Every minute or so,
the server could send out a ping to check if the user is still connected, and if they leave, the player/spectator array 
could be updated. If a player client doesn't respond to the ping, we could restart the game and have the first spectator 
take over as a player.

2. Another known problem is that in order to create the db in the first place, you need to run:
```
$ python
>> from app import db
>> import models
>> db.create_all()
```
inside the command line first. The DB doesn't automatically create itself otherwise for some reason. I don't have any potential fix for this, so I recommend 
doing this when creating a new DB.

3. One future feature I'd like to implement is a timer condition. After making a move, each player should have a minute or so to 
respond with a move of their own. If the player does not respond within the time limit, they automatically forfeit. This could be done
on the server side, with the back end checking the passage of time between moves, and emitting a forefit response to the client 
should time be up.

4. One other feature I would like to implement is a password field. This adds a level of security to the user account. We can have a
password field in the Database and upon login, if the user exists, it would check the passwords and then confirm logging in. Currently, a 
user can log in as any created username and mess with their rankings. With the addition of the password field, it would no longer be possible. 

5. Another feature I would like to implement is a match history field in the database. It would track the users past 5 games with a string
of W's, L's, and even D's (Wins, Losses, Draws). For example, WLLDW. Upon the game ending, the oldest part of the string would get dropped and the latest match history 
would be added. 

## Technical Issues Faced
1. An issue I faced was that when a player logged in, their username wouldn't be put into the local players array until another user joined in after them.
I believe this issue was caused becuase when the user logs in, the local players array wouldn't update until another `login` was emitted from the server.
I needed to be ablt to emit the message to all clients including the one who logged in. I was able to fix this issue by looking over Stack Overflow. I found 
someone who had a similar issue and discovered the problem was in my python code, I had `include_self = False` when I was emitting. By changing the `False` to 
a `True`, I was able to update the players' array right away, without the need for another user to login.

2. In my previous version of the code, if someone logged in with the same username as a player, they were able to make a move on the board
when it came to be that player's turn. After this occured, I decided to only have unique usernames logged in at once. In order to do this, I 
decided to run a check during login. On the client side, it emits `login` when entering a username, and sends it
to the server, and the server checks both players and spectators. If it finds a duplicate, it emits back a `deny`. If it isn't a duplicate,
it emits back a `confirm`. Inside the `useEffect` function, I was using the state `username` as a comparision checker, but it didn't seem to work.
After attempting to rewrite the function again, I found that the `username` state was undefined. I asked my friend Mervyn for help and he told me 
to use `useRef`s as references for the state variables. He encountered a similar issue and it was apparently due to how `useEffect` deals with state variables.
With that change in my code, I was able to get it working.

3. When I was trying to update the database for points, it wasn't commiting the changes. Initially my code was using `models.Player.query...` as the query string. 
I tried looking at stackOverflow and the documentation for SQLAlchemy, but that didn't help either. I tried askign one of my friends Philip and he ended up finding 
the issue with my code. Since I was using `models.Player.query...` as my query string, I was actually making a copy of the current db session. None of my changes were 
actually being done, they were only being printed out locally. I had to do `db.session.query...` in order to actually work with the database. 

4. When I was trying to send data from the backend to the front, I was initially using a dictionary for the usernames and their points. in the backend, all of the entries
were ordered by points, but when I sent it to the front end, they were in alphabetical order by usernames. I initially assumed there was a problem with sending the data, but 
after I rewrote the functions, it was still arranging them wrong in the front end. I went to Stack Overflow, and I foudn that the issue was that in 
JS, apparently dictionaries were objects and that the keys can get rearranged when passing them from back to front. Due to this, I decided to use two lists instead of a dictioanry.


## Extra Features I Implmented:
1. The way I structured the program, I prevent two users from having the same username in the session. 
2. The restart game button works with a vote system. Both players have to hit the button to restart the game.
3. After the first player logs in, they're taken to a waiting screen until the second player joins.