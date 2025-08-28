import { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();
const serverlessHandler = serverless(app);

export const handler: Handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return await serverlessHandler(event, context);
};
