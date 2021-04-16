This project contains a React application created using `create-react-app` and
a Flask server which is configured to serve the react application's build
folder and provide REST endpoints for the react app to interact with.

## Installation

This project depends on having Node, Yarn and pipenv.

To install frontend dependencies, move to the frontend dir and run

`yarn`

To install server dependencies, move to the server dir and run

`pipenv sync -d`

## Development

To run frontend in development mode, move to the frontend dir and run

`yarn start`

to run server in development mode, move to server dir and run

`pipenv run flask run --reload --port 80`

## Production

### Build

There is a build script `build.sh` that builds the react application
and copies it into the Flask project in the correct place.

### Running

After running `build.sh`, the server can be run in production mode by
moving into the server folder and running

`python3 run.py`
