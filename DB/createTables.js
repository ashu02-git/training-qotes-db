const AWS = require('aws-sdk');
AWS.config.update({
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});
const dynamodb = new AWS.DynamoDB();

const paramsList = [
  {
    TableName: 'Quotes',
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: 'timestamp',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  },
  {
    TableName: 'Comments',
    AttributeDefinitions: [
      {
        AttributeName: 'quoteId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'timestamp',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'quoteId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  }
];

console.log(paramsList[0]);
for (const params in paramsList){
  dynamodb.createTable(paramsList[params], (err, data) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Create Quotes tables');
    }
  });
}
