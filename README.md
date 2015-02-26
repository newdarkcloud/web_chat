# socketio-hello-world

This sets up a simple node server which emits and responds to events from a client connection.

## Node js

Node is a stand-in for apache on the server.  You write a "server" script and run it, while it is running it will handle HTTP requests.

After a while your script will probably shut down.  You can use *forever* a nice node module for keeping the server up.  Otherwise

    node server.js

This is your first time needing to think about ports.  Normal HTTP traffic is done on port 80, SSH on port 22, e-mail has a few ports roped off, DNS gets 53.

Custom apps usually need to run on high port numbers (1025 to 65536) and mask them.  If you are on Cloud9 then your port number is 
held in the variable 

    process.env.PORT

If you are on your own server then you might have some work to do or your urls might need :9839 after the top level domain (or whatever port you are using).

There are other websockets libraries through other servers, but socketio is a good excuse to start picking up node.

Just like before you'll need to spend some time just getting configured.  Once you are then start playing with the real app.
