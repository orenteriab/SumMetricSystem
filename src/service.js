import { EXPIRE_TIME } from './config';
import { MetricModel, metricsData } from './model';

/**
 * Deletes a specific `metric` from the `metricsData` collection.
 * @param {MetricModel} metric
 */
export const deleteMetric = ({ key, uuid }) => {
  delete metricsData[key][uuid];
};

/**
 * It creates or append a `metric` into the `metricsData` collection.
 * After it's pushed into the `metricsData` collection, a timeout is
 * set to get rid of that `metric` after the `EXPIRE_TIME` comes down.
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
  setTimeout(
    () => deleteMetric(metric),
    EXPIRE_TIME
  );
};

/**
 * It returns the sum of all the metrics by the specified key.
 * @param {string} key The name of the metric to lookup.
 */
export const sumMetricValues = (key) => {
  const metricDict = metricsData[key] || {};
  return Object.values(metricDict).reduce((acc, met) => met.value + acc, 0);
};
