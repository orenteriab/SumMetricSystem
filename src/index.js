import authMiddleware from './auth';
import bodyParser from 'body-parser';
import { PORT } from './config';
import express from 'express';
import { addMetric, sumMetricValues } from './service';

const app = express();

app.use(authMiddleware, bodyParser.json());

app.post('/metric/:key', (req, res) => {
  const key = req.params.key;
  /**
   * @type {number|string}
   */
  const value = req.body.value;
  /**
   * @type {number}
   */
  let status;
  /**
   * @type {({}|{error: string})}
   */
  let responseBody;

  try {
    addMetric(key, value);
    [status, responseBody] = [200, {}];
  } catch (err) {
    if (err instanceof TypeError) {
      [status, responseBody] = [422, { error: err.message }];
    } else {
      [status, responseBody] = [500, { error: 'An error occurred on the server. Please try again.' }];
      console.error(`[index][/metric/${key}]: Error encountered when adding metric.`, err);
    }
  }

  res.status(status).json(responseBody);
});

app.get('/metric/:key/sum', (req, res) => {
  const key = req.params.key;
  /**
   * @type {number}
   */
  let status;
  /**
   * @type {({value: number} | {error: string})}
   */
  let responseBody;

  try {
    const value = sumMetricValues(key);
    [status, responseBody] = [200, { value }];
  } catch (err) {
    console.error(`[index][/metric/${key}/sum]: Error encountered when adding metric.`, err);
    [status, responseBody] = [500, { error: 'An error occurred on the server. Please try again.' }];
  }

  res.status(status).json(responseBody);
});

app.listen(PORT, () => {
  console.log(`Sum metric system is running at port ${PORT}.`);
});
