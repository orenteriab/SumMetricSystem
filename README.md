# SumMetricSystem
A metric logging and reporting service that sums metrics by time window for the most recent hour.

## Specification

This service has two endpoints:
- An endpoint to add metric values:
```
Request:
POST /metric/{key}
{
"value": 30
}

Response: (200)
{}
```
- Another one to sum the metric values in the last 60 minutes:
```
Request:
GET /metric/{key}/sum

Response:
{
  "value": 400
}
```

*Some _important_ things:*
- Every value added must to be deleted after 60 minutes.
- Every value added must to be rounded to the nearest integer.
- No database/store system is needed, a basic datastructure or file is enough.

## Development

This service was developed using node 12.16.x.
You need `node` and `npm` to make it work.

It was coded using Babel, to support modules and some features of ES6/7 at development time. It has a pretty basic configuration, though. The code can be found at `./src` directory.

*Note:* As AWS Elastic BeanStack is the target to deploy, all scripts in `./package.json` were written to work in a *NIX system. So, if you are using Windows 10, you may want to install a Windows Subsystem for Linux (Ubuntu is the most popular).

Also, to make easier the configuration of some variables, the service depends on dotEnv. To tweak the configuration you may edit `./env.dev` for development use, or `./env.prod` for production.

### Start the service

To start the service in order to test it functionally, you just need to run the command: `npm run start:dev`; and that's it, this command will run the linter, transpile the code, and configure the environment as is needed for development. This `start:dev` script works on top of `nodemon`, so every change in the `./src` directory will be reloaded automatically.

Once the server is ready to listen, you can use your favorite REST client to hit the URLs:
```
# To add a metric value
curl \
  -H 'Authorization: Bearer ishallpass' \
  -d '{"value": 123}' \
  -v \ # This flag is completely optional, but you know, it helps some times.
  'http://localhost:3000/metric/visitors'
```

```
# To check the sum of values of a specific metric
curl \
  -H 'Authorization: Bearer ishallpass' \
  -v \ # This flag is completely optional, but you know, it helps some times.
  'http://localhost:3000/metric/visitors/sum'
```

### Service structure

The service has a pretty simple structure:
- `./src/.eslintrc.json`: Some basic configurations to have some codestyling.
- `./src/auth.js`: A simple authorization-simulator middleware.
- `./src/babel.config.json`: The babel configuration.
- `./src/index.js`: Is the controller file, this handle the http requests.
- `./src/model.js`: It's a representation of a "data store", and the entity that is "persisted" (A.K.A. the metric).
- `./src/service.js`: Here you can find the business logic.


## Deployment

The deployment process is pretty simple thanks to AWS CodePipeline. Currently is set to listen on commits/push signals on master branch. So, every push signal into master branch will result as a build on AWS CodePipeline that will impact the Elastic BeanStack environment.
