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

  // Check if Quotes table exists
  dynamodb.describeTable(params, (err, data) => {
    if (err) {
      const params = {
        TableName: 'Quotes',
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      dynamodb.createTable(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Create Quotes table');
          res.json({});
        }
      });
    } else {
      docClient.scan(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.json(data.Items);
        }
      });
    }
  });
});

// Get a quote
app.get('/quotes/:quoteId', (req, res) => {
  const id = req.params.quoteId;
  const params = {
    TableName: 'Quotes',
    Key: { id },
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
  const params = {
    TableName: 'Quotes',
    Item: { id, author, text },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

// Get all comments
app.get('/comments/:quoteId', (req, res) => {
  const params = {
    TableName: 'Comments',
  };
  // Check if  Comment table exists
  dynamodb.describeTable(params, (err, data) => {
    if (err) {
      const params = {
        TableName: 'Comments',
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
          {
            AttributeName: 'quoteId',
            AttributeType: 'S',
          },
        ],
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'quoteId',
            KeyType: 'RANGE',
          },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      dynamodb.createTable(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Create Comments table');
          res.json();
        }
      });
    } else {
      const quoteId = req.params.quoteId;
      const params = {
        TableName: 'Comments',
        ScanFilter: {
          quoteId: {
            ComparisonOperator: 'CONTAINS',
            AttributeValueList: [`${quoteId}`],
          },
        },
      };

      docClient.scan(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.json(data.Items);
        }
      });
    }
  });
});

// Post new comments
app.post('/comments/:quoteId', (req, res) => {
  const date = new Date();
  const dateNum = date.getTime();
  const id = 'id' + dateNum;
  const quoteId = req.params.quoteId;
  const name = 'name' + dateNum;
  const text = req.body.text;

  const params = {
    TableName: 'Comments',
    Item: { id, quoteId, name, text },
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
