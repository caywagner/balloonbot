# Install Instructions

This document will guide you through setting up a virtual environment, downloading and installing ngrock, and launching balloonbot locally.

The following commands are for Unix machines. Adjustments may have to be made for Windows.

## Setting up your Virtual Environments

We will set up a virtual environment for your Python and Node.js libraries separately.

Navigate to your (empty) directory of choice and set up your python virtual environment.

```bash
$ cd <dir>
$ python3 -m venv env  # linux
$ /usr/local/bin/python3 -m venv env  # mac with previously installed Anaconda distribution, use full path
```

Activate python virtual environment.

```bash
$ which python  # verify full path
<full path>
$ source env/bin/activate
$ which python  # verify local path
<local path>
```

Update pip.

```bash
$ pip install --upgrade pip
```

Install and activate nodenv to manage Javascript virutal environment.
Note: All dependancies will be installed in this directory. You have to activate the virtual environment to access these depancies in each new terminal you plan to use them in.

```bash
$ pip install nodeenv
$ nodeenv --python-virtualenv
$ deactivate  # restart virtual environment to include nodeenv changes
$ source env/bin/activate
$ which python  # verify local paths
<local path>
$ which node
<local path>
$ which npm
<local path>
```

Clone balloonbot.

```bash
$ git clone https://github.com/caywagner/balloonbot.git
$ mv balloonbot/* .
$ rm -rf balloonbot
```

Install dependancies as specified by `package.json`.

```bash
$ npm install .
```

## Installing ngrok

Make an account with ngrok and follow the [install instructions](https://dashboard.ngrok.com/get-started). Make sure you unzip to balloonbot's directoy.

After ngrok is installed, see available features with

```bash
$ ./ngrok help
```

or start an HTTP tunnel with

```bash
$ ./ngrok http <port>
```

View a log of sent messages on [http://localhost:4040/] when an ngrok tunnel is active. 

## Launch a Node.js server

Launch a Node.js server with

```bash
$ node server
Listening for events on <port>
```

You can kill this server at any time with `Ctrl+c`.

In a separate terminal, you can start an ngrok tunnel with

```bash
$ ./ngrok http <port>
```
