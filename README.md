Material lighthouse controls
============================

This project contains the [Angular](https://angular.io/) and [Angular Material](https://material.angular.io/guide/getting-started) resources that accompany my [MicroPython lighthouse controls](https://github.com/george-hawkins/micropython-lighthouse-controls) project.

<img height="512" src="screenshot.png">

To serve and open in a new browser tab:

    $ ng serve --open

To build and commit to the `gh-pages` branch:

    $ source ./update-gh-pages.sh

I tried out various lighthouse icons. For more about this process, see [`lighthouses-icons/README.md`](lighthouses-icons/README.md).

Websocket server
----------------

In production, the code in [`data.service.ts`](src/app/data.service.ts) creates a websocket connection back to the host that served out the containing page. However, during development, it connects to fixed test device specified as `wsEndpoint` in [`environments.ts`](src/environments/environment.ts).
