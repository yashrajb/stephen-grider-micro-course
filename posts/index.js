const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const EVENT_BUS_CLUSTER_IP = "http://event-bus-srv:4005"

const posts = {};

app.get('/posts', (req, res) => {
  return res.send(posts);
});

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  await axios.post(`${EVENT_BUS_CLUSTER_IP}/events`, {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });

  return res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
  console.log('Event Received', req.body.type);

  return res.send({});
});

app.listen(4000, () => {
  console.log("some changes");
  console.log('Listening on 4000');
});
