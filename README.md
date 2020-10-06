# Soundbot Discord
A bot that do sound effect with short audio clip during voice or video call.

## Features
- Uses a queue system to handle multiple playback commands at once
- Allow sound clip uploading in Discord
- Quick play back in several ways
  1. Play command with clip id or name \
  `.play haiya` \
  `.play 1`
  2. Message with exact clip name \
  `hello darkness`
  3. Clip name or id after prefix \
  `.nani` \
  `.11`
  4. Multiple clip name in brackets \
  `[surprise] [it's me mario]`
- Customizable server prefix
- Assign a dedicated channel for commands

## Requirements
1. Discord Bot's Token
   > You can get this Token by  from the [Discord developer docs]
2. `node` [Version 12.0.0 or higher][nodejs]
3. `git` [command line][git download] (Not Required but Recommended)

## Setup
1. Clone the repository from your command prompt with the following command
   ```bash
   git clone git@github.com:kaixiang1212/SoundBot-Discord.git
   ```
   or [download it here][repo download] and unzip
   
2. Navigate into the repository in the command prompt by typing
   ```bash
   cd SoundBot-Discord
   ```
3. Install dependencies by running the following command
   ```bash
   npm install
   ```
4. Copy and paste your bot token to the end of first line in your [.env][env file loc] file as following
   ```javascript
   DISCORDJS_BOT_TOKEN=Token Here
   ```
5. Simply run the following command from your command prompt
   ``` bash
   npm run start
   ```

## Planned Features
- Greet someone with a playback whenever someone joins the voice channel
- Option to hide your uploadings from the public
- Assignable shortcut shared by the whole server
- Publication to [top.gg] so it is more accessible to everyone

## License
Copyright (C) 2020  Kai Xiang Yong

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

[repo download]: https://github.com/kaixiang1212/SoundBot-Discord/archive/main.zip
[env file loc]: https://github.com/kaixiang1212/SoundBot-Discord/blob/main/.env
[top.gg]: https://top.gg/
[Discord developer docs]:https://discordapp.com/developers/applications/me
[nodejs]: https://nodejs.org/
[git download]: https://git-scm.com/downloads
