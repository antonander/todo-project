import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodoForUser as getTodoForUser} from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // Write your code here
    const todoId = event.pathParameters.todoId
    const todo = await getTodoForUser(getUserId(event), todoId);

    if(todo){
      return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(todo)
      }
    }else{
      return {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: "An error ocurred, please review the logs for more information."
      }
    }

  }
)

handler.use(
  cors({
    credentials: true
  })
)
