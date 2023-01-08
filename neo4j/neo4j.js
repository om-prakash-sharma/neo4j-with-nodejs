'use strict';

import * as dotenv from 'dotenv';
dotenv.config();

import neo4j from 'neo4j-driver';
const { NEO4J_CONNECTION, NEO4J_USER, NEO4J_PASS } = process.env;

let neo4jInstance = null;

class Neo4J {

    constructor() {
        this.driver = null;
        this.connect();
    }

    async connect() {
        const authToken = neo4j.auth.basic(NEO4J_USER, NEO4J_PASS);
        this.driver = neo4j.driver(NEO4J_CONNECTION, authToken);
        await this.driver.verifyConnectivity();
        console.log('Neo4J connected successfully ...')
        return this.driver;
    }

    async executeQuery(query) {
        try {
            const session = this.driver.session();
            const result = await session.executeRead(tx => tx.run(query))
            return result.records.map(e => {
                if (e._fields?.[0]?.properties) {
                    return e._fields?.[0]?.properties;
                }
                const data = {};
                const { keys, _fields } = e;
                for (let i = 0; i < keys.length; i++) {
                    data[keys[i]] = _fields[i];
                }
                return data;
            });
        } catch (e) {
            return Promise.reject(e.message);
        }
    }

    static getInstance() {
        if (!neo4jInstance) {
            neo4jInstance = new Neo4J();
        }
        return neo4jInstance;
    }

    static close() {
        if (neo4jInstance) {
            neo4jInstance.close();
            neo4jInstance = null;
        }
    }
}

export default Neo4J;