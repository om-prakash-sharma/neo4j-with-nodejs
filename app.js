'use strict';

import express from "express";
import Neo4J from "./neo4j/neo4j.js";

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '1kb' }));
app.use(express.static('public'))

// create connection with Neo4J.
Neo4J.getInstance();

app.post('/api/search', async (req, res) => {
    try {
        const keyword = req.body.search;
        const result = await Neo4J.getInstance().executeQuery(keyword);
        return res.status(200).send({ result })
    } catch (error) {
        return res.status(500).send({ msg: error.message })
    }
})

export default app;