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

  expirationAware () {
    setTimeout(
      () => metricExpireEmmiter.emit('expire', this),
      EXPIRE_TIME
    );
  }
}

const app = express();

/**
 * Simulates a simple authorization middleware.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const authMiddleware = (req, res, next) => {
  if (req.headers.authorization !== AUTH_KEY) {
    return res.status(401).json({ error: 'You are not authorized to perform this action.' });
  }
  next();
};

app.use(authMiddleware, bodyParser.json());

app.post('/metric/:key', (req, res) => {
  const incomingValue = req.body.value;

  if (isNaN(incomingValue)) {
    return res.status(422).send({ error: 'The "value" property in the request must to be a number.' });
  }

  const floatIncomingValue = parseFloat(incomingValue);
  const value = Math.round(floatIncomingValue);
  const key = req.params.key;
  const metric = Object.freeze(new MetricModel(key, value));
  const metricDict = metrics[key] || {};
  const metricsReplacement = Object.freeze({
    ...metrics,
    [key]: {
      ...metricDict,
      [metric.uuid]: metric
    }
  });

  Object.assign(metrics, metricsReplacement);
  metric.expirationAware();
  res.json({});
});

app.get('/metric/:key/sum', (req, res) => {
  const key = req.params.key;
  const metricDict = metrics[key] || {};

  const value = Object
    .values(metricDict)
    .reduce((acc, met) => acc + met.value, 0);

  res.json({ value });
});

app.listen(PORT, () => {
  console.log(`Sum metric system is running at port ${PORT}.`);
});
