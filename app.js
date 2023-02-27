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
        const query = generateQueryToEexecute(req.body);
        const result = await Neo4J.getInstance().executeQuery(query);
        const headerList = getHeaders(result || [])
        if (result.length) {
            result.forEach(row => {
                headerList.map(e => {
                    // handle empty values
                    if (!row[e]) {
                        row[e] = '';
                    }
                    // handle integer value
                    if (row[e].constructor.name == 'Integer') {
                        row[e] = row[e].toString();
                    }
                })
            })
        }
        return res.status(200).send({ result, headerList })
    } catch (error) {
        return res.status(500).send({ msg: error.message })
    }
})

function generateQueryToEexecute(payload = {}) {
    const { search = null, model = 'Customer', filter = {}, limit = 10 } = payload;

    // if we have query in body then return
    if (search && typeof search === 'string') {
        return search;
    }

    const filterQuery = Object.keys(filter).reduce((result, ele) => {
        result = (result != '' ? `${result} AND ` : '') + (` e.${ele} = '${filter[ele]}'`);
        return result;
    }, '');

    const queryStr = `MATCH (e:${model}) ${filterQuery != '' ? ` WHERE ${filterQuery}` : ''} RETURN e LIMIT ${limit}`;
    return queryStr;
}

function getHeaders(list = []) {
    return [...list.reduce((res, e) => {
        res = new Set([...res, ...Object.keys(e)])
        return res;
    }, [])]
}

export default app;