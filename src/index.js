import bodyParser from 'body-parser';
import dotEnv from 'dotenv';
import EventEmitter from 'events';
import express from 'express';
import { v1 as uuidv1 } from 'uuid';

dotEnv.config();
const {
  env: {
    PORT,
    AUTH_KEY,
    EXPIRE_TIME
  }
} = process;

/**
 * @type {Object<string, Object<string, MetricModel>>}
 */
const metrics = {};

/**
 * Handle the events when a metric expires
 * @param {MetricModel} metric
 */
const expireListener = ({ key, uuid }) => {
  delete metrics[key][uuid];

  if (Object.keys(metrics[key]).length === 0) {
    delete metrics[key];
  }
};

class MetricExpireEmitter extends EventEmitter { }
const metricExpireEmmiter = new MetricExpireEmitter();
metricExpireEmmiter.on('expire', expireListener);

class MetricModel {
  /**
    * Constructor for modeling metric
    * instances.
    * @param {string} key
    * @param {number} value
    */
  constructor (key, value) {
    this.uuid = uuidv1();
    this.key = key;
    this.value = value;
  }
}

const app = express();

/**
 * Simulates a simple authorization middleware.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const authMiddleware = ({ headers: { authorization } }, res, next) => {
  if (authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'You are not authorized to perform this action.' });
  }
  next();
};

app.use(authMiddleware, bodyParser.json());

app.post('/metric/:key', ({ params: { key }, body: { value: incomingValue } }, res) => {
  if (isNaN(incomingValue)) {
    return res.status(422).send({ error: 'The "value" property in the request must to be a number.' });
  }

  const floatIncomingValue = parseFloat(incomingValue);
  const value = Math.round(floatIncomingValue);
  const metricModel = Object.freeze(new MetricModel(key, value));
  const { [key]: keyDict = {} } = metrics;
  const metricsReplacement = Object.freeze({
    ...metrics,
    [key]: {
      ...keyDict,
      [metricModel.uuid]: metricModel
    }
  });

  Object.assign(metrics, metricsReplacement);
  setTimeout(() => metricExpireEmmiter.emit('expire', metricModel), EXPIRE_TIME);
  res.json({});
});

app.get('/metric/:key/sum', ({ params: { key } }, res) => {
  if (!(key in metrics)) {
    return res.status(404).json({ error: 'The metric could not be found.' });
  }

  const { [key]: keyDict = {} } = metrics;
  const value = Object.values(keyDict).reduce((acc, met) => acc + met.value, 0);
  res.json({ value });
});

app.listen(PORT, () => {
  console.log(`Sum metric system is running at port ${PORT}.`);
});
