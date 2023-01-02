'use strict';

// load .env variables  
import * as dotenv from 'dotenv';
dotenv.config();

import http from "http";
import app from "./app.js";

const PORT = process.env.PORT || 2000;

http.createServer(app).listen(PORT, () => {
    console.log('> Server listen on %s ⚡', PORT);
})
