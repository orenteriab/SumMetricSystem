import { v1 as uuidv1 } from 'uuid';

export class MetricModel {
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

/**
 * @type {{[metric: string]: {[uuid:string]: MetricModel}}}}
 */
export const metricsData = {};
