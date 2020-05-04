import { app, server } from './index';
import { AUTH_KEY } from './config';
import request from 'supertest';

const authKey = AUTH_KEY.substring(7);

describe('Api tests', () => {
  const requestBuilder = request(app);
  const requestMethodsBuilder = {
    /**
     * @typedef {import('supertest').Request} Test
     * @param {string} url
     * @returns {Test}
     */
    post: (url) => requestBuilder.post(url),
    /**
     * @param {string} url
     * @returns {Test}
     */
    get: (url) => requestBuilder.get(url)
  };

  describe('Unauthorized', () => {
    const testBuilder = async (url, method, payload = {}) => {
      const response = await requestMethodsBuilder[method](url).send(payload);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    };

    test('Index URL', async () => {
      await testBuilder('/', 'get');
    });

    test('Add metric URL', async () => {
      await testBuilder('/', 'post', { value: 25 });
    });

    test('Sum metrics URL', async () => {
      await testBuilder('/metric/tst-mtrc/sum', 'get');
    });
  });

  describe('Authorized', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
    });

    test('Add happy path', async () => {
      const response = await requestMethodsBuilder.post('/metric/visitors')
        .auth(authKey, { type: 'bearer' })
        .send({ value: 35 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    test('Add not so happy path', async () => {
      const response = await requestMethodsBuilder.post('/metric/visitors')
        .auth(authKey, { type: 'bearer' })
        .send({ value: 'I think a string is a good idea' });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'The "value" property in the request must to be a number.'
      });
    });
  });

  describe('Authorized timer', () => {
    test('Add and sum', async () => {
      jest.useRealTimers();

      const firstAddResponse = await requestMethodsBuilder.post('/metric/visitors')
        .auth(authKey, { type: 'bearer' })
        .send({ value: 30 });

      expect(firstAddResponse.status).toBe(200);
      expect(firstAddResponse.body).toEqual({});

      const firstSumResponse = await requestMethodsBuilder.get('/metric/visitors/sum')
        .auth(authKey, { type: 'bearer' })
        .send();

      expect(firstSumResponse.status).toBe(200);
      expect(firstSumResponse.body).toHaveProperty('value');
      expect(firstSumResponse.body.value).toBe(30);

      await new Promise(resolve => setTimeout(resolve, 100));

      const secondAddResponse = await requestMethodsBuilder.post('/metric/visitors')
        .auth(authKey, { type: 'bearer' })
        .send({ value: 15 });

      expect(secondAddResponse.status).toBe(200);
      expect(secondAddResponse.body).toEqual({});

      const secondSumResponse = await requestMethodsBuilder.get('/metric/visitors/sum')
        .auth(authKey, { type: 'bearer' })
        .send();

      expect(secondSumResponse.status).toBe(200);
      expect(secondSumResponse.body).toHaveProperty('value');
      expect(secondSumResponse.body.value).toBe(45);

      await new Promise(resolve => setTimeout(resolve, 100));

      const thirdSumResponse = await requestMethodsBuilder.get('/metric/visitors/sum')
        .auth(authKey, { type: 'bearer' })
        .send();

      expect(thirdSumResponse.status).toBe(200);
      expect(thirdSumResponse.body).toHaveProperty('value');
      expect(thirdSumResponse.body.value).toBe(15);

      await new Promise(resolve => setTimeout(resolve, 100));

      const fourthSumResponse = await requestMethodsBuilder.get('/metric/visitors/sum')
        .auth(authKey, { type: 'bearer' })
        .send();

      expect(fourthSumResponse.status).toBe(200);
      expect(fourthSumResponse.body).toHaveProperty('value');
      expect(fourthSumResponse.body.value).toBe(0);
    });
  });

  afterAll(() => server.close());
});
