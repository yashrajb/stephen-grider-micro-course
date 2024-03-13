const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const events = [];
const POST_CLUSTER_IP = "http://posts-clusterip-srv:4000";
const COMMENTS_CLUSTER_IP = "http://comments-srv:4001";
const MODERATION_CLUSTER_IP = "http://moderation-srv:4003"
const QUERY_CLUSTER_IP = "http://query-srv:4002";

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post(`${POST_CLUSTER_IP}/events`, event);
  axios.post(`${COMMENTS_CLUSTER_IP}/events`, event);
  axios.post(`${QUERY_CLUSTER_IP}/events`, event);
  axios.post(`${MODERATION_CLUSTER_IP}/events`, event);

  return res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Listening on 4005");
});
