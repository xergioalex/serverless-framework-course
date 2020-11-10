'use strict'

const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient()

/*
 order : {
  orderId: String,
  name: String,
  address: String,
  pizzas: Array of Strings,
  delivery_status: READY_FOR_DELIVERY / DELIVERED
  timestamp: timestamp
}
*/

export const saveCompletedOrder = order => {
	console.log('Save order')

	order.delivery_status = 'READY_FOR_DELIVERY'

	const params = {
		TableName: process.env.COMPLETED_ORDER_TABLE,
		Item: order
	}

	return dynamo.put(params).promise()
}

export const deliverOrder = orderId => {
	console.log('Order called')

	const params = {
		TableName: process.env.COMPLETED_ORDER_TABLE,
		Key: {
			orderId
		},
		ConditionExpression: 'attribute_exists(orderId)',
		UpdateExpression: 'set delivery_status = :v',
		ExpressionAttributeValues: {
			':v': 'DELIVERED'
		},
		ReturnValues: 'ALL_NEW'
	}

	return dynamo
		.update(params)
		.promise()
		.then(response => {
			console.log('order delivered')
			return response.Attributes
		})
}

export const getOrder = orderId => {
	console.log(`Get order: ${orderId}`);

	const params = {
		TableName: process.env.COMPLETED_ORDER_TABLE,
		Key: {
      orderId: orderId,
    }
	}

	return dynamo.get(params).promise()
}