<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Architecture

## Architecture

The code follows a typical layered architecture commonly used in NestJS applications:

- Controller: The `TransactionController` class handles incoming HTTP requests, interacts with the service layer, and returns HTTP responses.
- Service: The `TransactionService` class contains the business logic for handling transactions. It communicates with the database via the `TransactionRepository` to perform CRUD operations.
- Data Access Layer: The `TransactionRepository` is responsible for interacting with the database and performing database operations related to transactions.
- DTOs (Data Transfer Objects): The `CreateTransactionDto` and `UpdateTransactionDto` are used for data validation and to define the structure of the request payloads.
- Entity: The `Transaction` entity represents a transaction record in the database.

## Code Structure

The code follows the recommended structure for a NestJS application:

- Controllers: The controller classes are defined under the `controllers` directory. In this case, the `TransactionController` is responsible for handling transaction-related requests.
- Services: The service classes are defined under the `services` directory. Here, the `TransactionService` implements the business logic for transactions.
- DTOs: The DTO classes, `CreateTransactionDto` and `UpdateTransactionDto`, are defined under the `dto` directory. These DTOs help validate and structure the request payloads.
- Entities: The `Transaction` entity class is defined under the `entities` directory. It represents a transaction record in the database.
- Dependency Injection: NestJS leverages dependency injection, and the code demonstrates it by injecting the `TransactionService` and `TransactionRepository` into the controller and service classes.

## Design Decisions

- Validation: The `ValidationPipe` is applied as a global pipe for the `create` method in the `TransactionController`. It automatically validates the incoming request payload using the `CreateTransactionDto` schema.
- Caching: The `TransactionService` utilizes caching to improve performance. It uses the `CacheInterceptor` provided by the `@nestjs/cache` package to cache the `findAll` method's response. The cached data is stored using the specified `cacheKey`, and the cache is invalidated when a new transaction is created.
- Cache Manager: The `CACHE_MANAGER` token is injected into the `TransactionService` to interact with the cache. The `CacheInterceptor` and `Cache` interface are imported from the `@nestjs/cache-manager` and `cache-manager` packages, respectively.

Overall, the code follows best practices for creating a controller-service architecture in NestJS. It demonstrates the separation of concerns, validation using DTOs, database operations through a repository, and caching to improve performance.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
