'use strict'

import { saveCompletedOrder, deliverOrder, getOrder } from './orderMetadataManager'

const { v4: uuidv4 } = require('uuid')
const AWS = require('aws-sdk')

// const orderMetadataManager = require('./orderMetadataManager');

let sqs = new AWS.SQS({ region: process.env.REGION })
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE

module.exports.makeOrder = (event, context, callback) => {
  console.log('Request arrived...')
  const orderId: string = uuidv4()

  const body = JSON.parse(event.body)

  const order = {
		orderId: orderId,
		name: body.name,
		address: body.address,
		pizzas: body.pizzas,
		timestamp: Date.now()
  }

  console.log(order)

  const params = {
    MessageBody: JSON.stringify(order),
    QueueUrl: QUEUE_URL,
  }

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      sendResponse(500, err, callback)
    } else {
      const message = {
				order: order,
				messageId: data.MessageId
			}
      sendResponse(200, message, callback)
    }
  })
}

module.exports.parseOrder = (event, context, callback) => {
  console.log('Preparing order...')
  console.log(event.Records[0].body)

  const order = JSON.parse(event.Records[0].body);

	saveCompletedOrder(order)
		.then(data => {
			callback();
		})
		.catch(error => {
			callback(error);
		});

  callback()
}

module.exports.sendOrder = (event, context, callback) => {
	console.log('Send orders called');

	const record = event.Records[0];
	if (record.eventName === 'INSERT') {
		console.log('deliverOrder');

		const orderId = record.dynamodb.Keys.orderId.S;

		deliverOrder(orderId)
			.then(data => {
				console.log(data);
				callback();
			})
			.catch(error => {
				callback(error);
			});
	} else {
		console.log('is not a new record');
		callback();
	}
};

module.exports.checkOrderState = (event, context, callback) => {
  console.log('CheckOrderState request arrived...')

  const orderId = event.pathParameters.orderId

  if (!orderId) {
    let message = {
      detail: 'orderId is required'
    }
    console.log('Error:', message)
    sendResponse(400, message, callback)
  }

  getOrder(orderId)
    .then(data => {
      console.log('Order data...')
      console.log(data)
      sendResponse(200, data, callback)
    })
    .catch(error => {
      sendResponse(500, error, callback)
    });
}

function sendResponse(statusCode, message, callback) {
  if (statusCode === 500) {
    callback(message)
  }

  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message),
  }
  callback(null, response)
}
