const express = require("express");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();
const app = require("express")();
const auth = require("./auth");
const routes = require("./routes");
const instmsgRoutes = require("./messagingRoutes");
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);

const PORT = process.env.PORT || 3000;
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../client/dist")));

app.post("/login", auth.login);
app.post("/signup", auth.signup);

// routes that require authentication use auth.requireAuth middleware
app.get("/sample-route", auth.requireAuth, routes.sampleRoute);

app.get("/conversations", routes.getConversations);

app.get("*", routes.catchAll);
/** ************************************************
 *          routes of instant messaging
 * ********************************************** */
app.post("/instmsg-api/conversations", instmsgRoutes.newConversation);
app.get(
  "/instmsg-api/conversations/:userID",
  instmsgRoutes.getConversationByUser
);
app.get("/instmsg-api/conversations/:userID/:friendID", instmsgRoutes.getChats);
app.post("/instmsg-api/messages/addmsg", instmsgRoutes.addMessage);
app.get("/instmsg-api/messages/:conversationId", instmsgRoutes.getMessages);
app.get("/users-api/:userID", instmsgRoutes.getUser);

app.get("*", routes.catchAll);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${PORT}`);
});


