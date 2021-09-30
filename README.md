# Web Scraper
---
This is a simple web scraper to help get items that are being taken by "entrepreneurs". You don't have to change anything in the code, but you do have to update the environment variable. See the .env.example.

## Basic Usage
After you have your docker container hosted on Heroku, visit the url given by heroku, followed by '/scraper'. This page updates every few minutes until it finds something. If it finds something, it will open a youtube link to alert you :P

http://herkou.example_url.com/scraper

## Hosting on Heroku
Copy the '.env.example' file and rename it to '.env'. If you want Discord Bot integration, read below. Otherwise, the env is ready to go.

## Adding a Discord Bot
This bot is discord ready. You will need your bot token and channel id to use this functionality. You copy these values to BOT_TOKEN and CHANNEL_ID respectively. Please use the tutorials below to get started (note: the bot tutorial goes through permissions. Please just copy the permissions from the tutorial)

[https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/](https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/) - Please stop at 'How to Code a Basic Discord Bot with the discord.js Library'
[https://www.remote.tools/remote-work/how-to-find-discord-id](https://www.remote.tools/remote-work/how-to-find-discord-id)

## Final Thoughts
You can add/change urls and the checks that are used to find items in the .env. This is a simple bot that just checks if part of a string is present in the html. I do not recommend editing th