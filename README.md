# Severless framework course

Contains some exercises using Serverless Framework


## Intallation && Setup

Install serverless CLI
```
npm install -g serverless
```

Setup serverless
```
serverless config credentials --provider aws --profile $AWS_USER_PROFILE --key $AWS_KEY_ID --secret $AWS_SECRET
```

## First project

Create project selecting a template. [See docs](https://www.serverless.com/framework/docs/providers/aws/cli-reference/create/).
```
serverless create --template aws-nodejs --name firstProject --path firstProject
```

Deploy function
```
cd firstProject
serverless deploy
```

## Get Pizzas project

Create project
```
serverless create --template aws-nodejs --name getPizzas --path getPizzas
npm init -y
npm install uuid --save
```

Deploy function
```
cd getPizzas
serverless deploy
```

Watch function logs
```
cd getPizzas
serverless logs -f makeOrder
```

## Permissions

Permissions should be configured using IAM.

* Users
* Groups
* Roles
* Access politics


## Environment Vars

