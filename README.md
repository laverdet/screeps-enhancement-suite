# Screeps Enhancement Suite
Adds some features to Screeps. Very early beta version.

## Install
```
$ git clone https://github.com/laverdet/screeps-enhancement-suite.git
```

In Chrome:

* Window -> Extensions
* [X] Developer Mode
* [Load unpacked extension...]

Copy `ses.js` to your Screeps repo and then at the *end* of `main.js` do this:
`Memory.ses && Memory.ses.actions && require('ses').execute();`

## Notes
Sometimes the hooks to load the extension don't work. And they don't unhook. If you know more about AngularJS than I do and you feel like messing with that feel free to send a pull request.
