# Project 2: Milestone 1

## Requirements
Install these in the environment if you don't have them already.
1. `npm install`
2. `pip install Flask`
3. `pip install -r requirements.txt`
4. `pip install flask-socketio`
5. `pip install flask-cors`
6. `npm install -g heroku` (Not needed if you only want to run locally)

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

#### Sign up for a Heroku Account (Not needed if you want to run locally only)
1. You can sign up for a free Heroku account on their website here: [https://signup.heroku.com/login](https://signup.heroku.com/login).
2. Heroku is used to host the web app.

## Run Application
1. Run command in terminal (in your project directory): `python app.py`
2. Run command in another terminal, `cd` into the project directory, and run `npm run start`
3. Preview web page in browser `'/'`

## Deploy to Heroku
##### Not needed if you want to run locally.
1. Create a Heroku app: `heroku create --buildpack heroku/python`
2. Add nodejs buildpack: `heroku buildpacks:add --index 1 heroku/nodejs`
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
2. One future feature I'd like to implement is a timer condition. After making a move, each player should have a minute or so to 
respond with a move of their own. If the player does not respond within the time limit, they automatically forfeit. This could be done
on the server side, with the back end checking the passage of time between moves, and emitting a forefit response to the client 
should time be up.

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


## Extra Features I Implmented:
1. The way I structured the program, I prevent two users from having the same username in the session. 
2. The restart game button works with a vote system. Both players have to hit the button to restart the game.
3. After the first player logs in, they're taken to a waiting screen until the second player joins.