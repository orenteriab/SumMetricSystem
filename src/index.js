import authMiddleware from './auth';
import bodyParser from 'body-parser';
import { PORT } from './config';
import express from 'express';
import { addMetric, sumMetricValues } from './service';

const app = express();

app.use(authMiddleware, bodyParser.json());

app.post('/metric/:key', (req, res) => {
  const key = req.params.key;
  const value = req.body.value;

  try {
    addMetric(key, value);
  } catch (err) {
    console.error(`[index][/metric/${key}]: Error encountered when adding metric.`, err);

    if (err instanceof TypeError) {
      return res.status(422).json({ error: err.message });
    }

    return res.status(500).send({ error: 'An error occurred on the server. Please try again.' });
  }

  res.json({});
});

app.get('/metric/:key/sum', (req, res) => {
  const key = req.params.key;

  try {
    const value = sumMetricValues(key);
    res.json({ value });
  } catch (err) {
    console.error(`[index][/metric/${key}/sum]: Error encountered when adding metric.`, err);
    res.status(500).send({ error: 'An error occurred on the server. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Sum metric system is running at port ${PORT}.`);
});
