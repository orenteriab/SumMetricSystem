import { EXPIRE_TIME } from './config';
import { MetricModel, metricsData } from './model';

/**
 * Expire a `metric` once we receive the event.
 * This is the listener method of `expire` event.
 * @param {MetricModel} The metric to expire
 */
const expireMetric = ({ key, uuid }) => {
  delete metricsData[key][uuid];
};

/**
 * Expires a metric based on the EXPIRE_TIME env value.
 *
 * @param {MetricModel} metric The metric that will expire after the timeout.
 */
const setExpireTimeout = (metric) => {
  setTimeout(() => expireMetric(metric), EXPIRE_TIME);
};

/**
 * It creates or append a metric into the `metrics` collection.
 *
 * @param {string} key The name of the metric to add.
 * @param {string} incomingValue The value for that metric.
 */
export const addMetric = (key, incomingValue) => {
  if (isNaN(incomingValue)) {
    throw new TypeError('The "value" property in the request must to be a number.');
  }

  const floatIncomingValue = parseFloat(incomingValue);
  const value = Math.round(floatIncomingValue);
  const metric = Object.freeze(new MetricModel(key, value));

  if (!(key in metricsData)) {
    metricsData[key] = {};
  }

  metricsData[key][metric.uuid] = metric;

  setExpireTimeout(metric);
};

/**
 * It returns the sum of all the metrics by the specified key.
 * @param {string} key The name of the metric to lookup.
 */
export const sumMetricValues = (key) => {
  const metricDict = metricsData[key] || {};
  return Object.values(metricDict).reduce((acc, met) => met.value + acc, 0);
};
