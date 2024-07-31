import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';

async function bootstrap() {
  const server = express();
  const port = process.env.API_PORT;
  if (!port) throw new Error('No API_PORT is defined in the environmental variables')
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.use(cors());

  app.use(
    morgan('dev'),
  );
  const config = new DocumentBuilder()
    .setTitle('ABH API')
    .setDescription('ABH API with CRUD functionality')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.API_PORT).then(() => {
    console.log('Application Running On Port ', process.env.API_PORT)
  });
}
bootstrap();
