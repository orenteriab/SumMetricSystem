import { metricsData } from './model';
import { deleteMetric, addMetric, sumMetricValues } from './service';

describe('Service', () => {
  beforeEach(() => Object.assign(metricsData, {}));

  test('Delete metric', () => {
    const metricKey = 'visitors';

    [14, 20, 2].forEach(v => addMetric(metricKey, v));

    const firstKey = Object.keys(metricsData[metricKey])[0];
    const first = metricsData[metricKey][firstKey];

    deleteMetric(first);

    expect(Object.keys(metricsData[metricKey])).toHaveLength(2);
    expect(metricsData[metricKey][first.uuid]).toBeUndefined();
    expect(sumMetricValues(metricKey)).toBe(22);
  });

  test('Add metric', () => {
    const metricKey = 'minutes-spent';
    addMetric(metricKey, '20');

    expect(Object.keys(metricsData[metricKey])).toHaveLength(1);

    const customerViewsMetric = 'customer-views';
    addMetric(customerViewsMetric, '12');
    addMetric(customerViewsMetric, '800');

    expect(Object.keys(metricsData[customerViewsMetric])).toHaveLength(2);

    expect(sumMetricValues(customerViewsMetric)).toBe(812);
    expect(sumMetricValues(metricKey)).toBe(20);
  });

  test('Sum metrics', () => {
    const metricKey = 'times-hit';
    [14, 20, 2, 90].forEach(v => addMetric(metricKey, v));
    expect(sumMetricValues(metricKey)).toBe(126);
  });

  test('Checking timeout expires', () => {
    jest.useFakeTimers();
    const metricKey = 'sales';
    addMetric(metricKey, 33);
    expect(sumMetricValues(metricKey)).toBe(33);
    jest.runOnlyPendingTimers();

    expect(sumMetricValues(metricKey)).toBe(0);
    jest.useRealTimers();
  });
});
