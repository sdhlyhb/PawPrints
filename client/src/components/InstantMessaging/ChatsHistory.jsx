/* eslint-disable no-underscore-dangle */
import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SocketContext from "../../contexts/SocketContext";

import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import { blue, yellow } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import axios from "axios";
import FriendMessage from "./FriendMessage.jsx";
import OwnerMessage from "./OwnerMessage.jsx";

import useAuthContext from "../../hooks/useAuthContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  maxWidth: 400,
  color: theme.palette.text.primary,
}));

function ChatsHistory() {
  const location = useLocation();
  const conversationID = location.state.conversationId;
  const friend = {
    _id: location.state.friendId,
    profileImage: location.state.profileImage,
    username: location.state.username,
  };
  const { user } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [newArrivalMsg, setNewArrivalMsg] = useState(null);
  let socket = useContext(SocketContext);

  const navigate = useNavigate();
  const scrollRef = useRef();

  const getMessages = async () => {
    try {
      const response = await axios.get(
        "/instmsg-api/messages/" + conversationID
      );
      console.log("this is message data:", response.data);
      setMessages(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const emitReadEvent = () => {
    const emitData = {
      conversationId: conversationID,
      receiverId: user._id,
      readAt: new Date(),
    }
    socket.emit("read", emitData);
  }

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  useEffect(() => {
    socket.emit("add-user", user?._id);

    // emit read event whenever user enters instant message page
    emitReadEvent();

    socket.on("get-msg", (data) => {
      console.log("get msg at client side:", data);

      if (data) {
        setNewArrivalMsg({
          senderID: data.senderId,
          text: data.message,
          createdAt: Date.now(),
        });

        // emite read event if user stays in instant message page and got a new message from current friend
        emitReadEvent();
      } else {
        console.log("detect event get-msg with force")
        getMessages();
      }


    });

    return () => {
      socket.off("get-msg");
      socket.emit("remove-user", user._id);
    }
  }, []);

  // useEffect(() => {
  //   socket.emit("add-user", user?._id);
  // }, [user]);

  useEffect(() => {
    getMessages();
  }, [conversationID, newArrivalMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const textMessage = {
      conversationID,
      senderID: user?._id,
      text: newMessageText,
    };

    socket.emit("send-msg", {
      senderId: user?._id,
      receiverId: friend?._id,
      message: newMessageText,
    });

    try {
      const response = await axios.post(
        "/instmsg-api/messages/addmsg",
        textMessage
      );
      setMessages([...messages, response.data]);
      setNewMessageText("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendImageButtonClick = (event) => {
    event.preventDefault();
    navigate("/send-image", { state: { conversationId: conversationID, friendId: friend._id } });
  };

  return (
    <div className="chats">
      <Box
        sx={{
          width: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/chat">
          <IconButton
            color="primary"
            aria-label="back-to-messagelist"
            component="label"
            sx={{ "&:hover": { backgroundColor: blue[100] } }}
          >
            <ArrowBackOutlinedIcon
              sx={{
                fontSize: 40,
              }}
            />
          </IconButton>
        </Link>

        <div>
          {user && friend && (
            <h3>
              {" "}
              DM with {friend.username} as {user.username}{" "}
            </h3>
          )}
        </div>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          height: 500,
          maxWidth: 500,
          overflowY: "scroll",
          px: 3,
        }}
      >
        {messages?.map((m, index) => (
          <div key={index}>
            {m.senderID === user?._id ? (
              <OwnerMessage
                ownername={user?.username}
                avatarImg={user?.profileImage}
                message={m.text}
                photo={m.photoUrl}
              />
            ) : (
              <FriendMessage
                friendname={friend?.username}
                avatarImg={friend?.profileImage}
                message={m.text}
                photo={m.photoUrl}
              />
            )}
          </div>
        ))}
        <span ref={scrollRef}></span>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
        position="relative"
        bottom="0px"
        left="10px"
      >
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          sx={{ "&:hover": { backgroundColor: blue[100] } }}
          onClick={handleSendImageButtonClick}
        >
          <AddPhotoAlternateIcon
            sx={{
              fontSize: 60,
            }}
          />
        </IconButton>

        <TextField
          sx={{
            width: 400,
          }}
          onChange={(e) => setNewMessageText(e.target.value)}
          value={newMessageText}
        />
        <IconButton
          color="primary"
          aria-label="send message"
          component="label"
          sx={{ "&:hover": { backgroundColor: blue[100] } }}
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          <SendIcon
            sx={{
              fontSize: 60,
            }}
          />
        </IconButton>
      </Box>
    </div>
  );
}

export default ChatsHistory;
