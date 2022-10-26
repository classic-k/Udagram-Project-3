import cors from 'cors';
import express from 'express';
import {sequelize} from './sequelize';

import {IndexRouter} from './controllers/v0/index.router';
import {logger} from "./controllers/v0/feed/routes/feed.router"

import bodyParser from 'body-parser';
import {config} from './config/config';
import {V0_FEED_MODELS} from './controllers/v0/model.index';


(async () => {
    try {
      //  await sequelize.authenticate();
        await sequelize.addModels(V0_FEED_MODELS);

  //console.debug("Initialize database connection...");
  await sequelize.sync();
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
        console.debug(error)
      }
  

  const app = express();
  const port = process.env.PORT || 8080;

  app.use(bodyParser.json());

  // We set the CORS origin to * so that we don't need to
  // worry about the complexities of CORS this lesson. It's
  // something that will be covered in the next course.
  app.use(cors({
    allowedHeaders: [
      'Origin', 'X-Requested-With',
      'Content-Type', 'Accept',
      'X-Access-Token', 'Authorization',
    ],
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    origin: '*',
  }));
  app.use(logger)
  app.use('/api/v0/', IndexRouter);

  // Root URI call
  app.get( '/', async ( req, res ) => {
    res.send( '/api/v0/' );
  } );

 
  // 404 and 500's default page
  app.use((req: Request, res: Response, next: () => any) => {
    res.status(404).send({ message: "Route not found", status: 404 });
  });
  app.use((err: Error, req: Request, res: Response, next: () => any) => {
    res.status(500).send({ mesaage: "An error occur", status: 500 });
  });

  // Start the Server
  app.listen( port, () => {
    console.log( `server running ${config.url}` );
    console.log( `press CTRL+C to stop server` );
  } );
})();
