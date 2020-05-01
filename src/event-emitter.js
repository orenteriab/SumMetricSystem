import EventEmmiter from 'events';

export const EXPIRE_METRIC_EVENT = 'expire';

export default class ExpireMetricEmitter extends EventEmmiter {
  /**
   * Simple constructor to handle the expiration event
   * @param {Function} listener the function to execute
   */
  constructor (listener) {
    super();
    this.on(EXPIRE_METRIC_EVENT, listener);
  }
}
