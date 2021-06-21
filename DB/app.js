const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

AWS.config.update({
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

// リクエストのbodyをパースする設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

// Get all Quotes
app.get('/quotes', (req, res) => {
  const params = {
    TableName: 'Quotes',
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data.Items);
    }
  });
});

// Get a quote
app.get('/quotes/:quoteId', (req, res) => {
  const id = req.params.quoteId;
  const timestamp = parseInt(id.slice(4));
  const params = {
    TableName: 'Quotes',
    Key: { id, timestamp },
  };

  docClient.get(params, (err, data) => {
    if (!data.Item) {
      console.log(err);
    } else {
      res.json(data.Item);
    }
  });
});

// Post new quotes
app.post('/quotes', (req, res) => {
  const { author, text } = req.body;
  const date = new Date();
  const dateNum = date.getTime();
  const id = 'data' + dateNum;
  const timestamp = dateNum;

  const params = {
    TableName: 'Quotes',
    Item: { id, author, text, timestamp },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

// Get all comments
app.get('/comments/:quoteId', (req, res) => {
  const quoteId = req.params.quoteId;
  const params = {
    TableName: 'Comments',
    KeyConditionExpression: '#qid = :q_id',
    ExpressionAttributeNames: { '#qid': 'quoteId' },
    ExpressionAttributeValues: { ':q_id': quoteId },
    ScanIndexForward: true,
  };

  docClient.query(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data.Items);
    }
  });
});

// Post new comments
app.post('/comments/:quoteId', (req, res) => {
  const quoteId = req.params.quoteId;
  const date = new Date();
  const dateNum = date.getTime();
  const name = 'name' + dateNum;
  const text = req.body.text;
  const timestamp = dateNum;

  const params = {
    TableName: 'Comments',
    Item: { quoteId, name, text, timestamp },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

// Start the localhost
const port = process.env.PORT || 5000;
app.listen(port);
console.log('Listen on port:' + port);
