import serverlessHttp from 'serverless-http';

import { server } from './index';

export const handler = serverlessHttp(server);
