# Titan Command

Titan Command is a standalone browser defense game inspired by Missile Command.

## Features

- 3 bases to defend, each with 1 HP
- Incoming enemy projectiles from the top of the screen
- Mouse aim with missile slot limits
- Keyboard aim with adjustable reticle speed
- Explosion-based interception
- Score and level progression
- Enemy variants and power ups
- Start, replay, quit-to-menu, and stop-session flows
- Imported Team Titan art, projectile sprites, explosion art, and soundtrack

## Run locally

Because this repo is plain HTML, CSS, and JavaScript, you can serve it with any static file server.

### Python

```bash
cd titan-game
python3 -m http.server 4173
```

Then open:

`http://127.0.0.1:4173`

## Controls

### Mouse mode

- Move mouse to aim
- Click to fire
- Limited to a few active missiles for balance

### Keyboard mode

- `WASD` or arrow keys move the reticle
- `Space` or `Enter` fires
- Reticle speed is adjustable from the menu

## Assets

This build uses the supplied Team Titan emblem, projectile sprites, fire sprite, and showdown theme.
