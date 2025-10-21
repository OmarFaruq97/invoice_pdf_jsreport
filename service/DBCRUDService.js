const db = require('./shared/database');

class DBCRUDService {
    constructor(schema, procedureName) {
        this.schema = schema;
        this.procedureName = procedureName;
    }

    async executeStoredProcedure(params) {
        const client = await db.pool.connect();
        const notices = [];

        try {
            // Client level notice listener
            client.on('notice', (msg) => {
                notices.push(msg.message);
            });

            // Procedure call
            await client.query(`CALL ${this.schema}.${this.procedureName}($1)`, [JSON.stringify(params)]);

            // Get the last notice (which should be our JSON response)
            if (notices.length > 0) {
                const lastNotice = notices[notices.length - 1];
                try {
                    return JSON.parse(lastNotice);
                } catch (parseErr) {
                    // If parsing fails, return the raw notice
                    return { 
                        success: true, 
                        msg: lastNotice, 
                        data: null 
                    };
                }
            } else {
                return { 
                    success: true, 
                    msg: 'Procedure executed, but no notice returned', 
                    data: null 
                };
            }

        } catch (err) {
            throw new Error(`Failed to execute stored procedure: ${err.message}`);
        } finally {
            client.release();
        }
    }

    async create(params) {
        return await this.executeStoredProcedure({ 
            action: 'insert', 
            ...params 
        });
    }

    async update(params) {
        return await this.executeStoredProcedure({ 
            action: 'update', 
            ...params 
        });
    }

    async delete(params) {
        return await this.executeStoredProcedure({ 
            action: 'delete', 
            ...params 
        });
    }

    async getById(params) {
        return await this.executeStoredProcedure({ 
            action: 'getById', 
            ...params 
        });
    }

    async getList(params) {
        return await this.executeStoredProcedure({ 
            action: 'get', 
            ...params 
        });
    }
}

module.exports = DBCRUDService;




/*const db = require('./shared/database');

class DBCRUDService {
    constructor(schema, procedureName) {
        if (!schema || !procedureName) {
            throw new Error('Schema and procedure name are required');
        }
        this.schema = schema;
        this.procedureName = procedureName;
    }

    async executeStoredProcedure(params) {
        try {
            const query = `CALL ${this.schema}.${this.procedureName}($1::json, $2::json)`;
            const result = await db.pool.query(query, [JSON.stringify(params), null]);
            // console.log('SP result:', result.rows[0]?.result);
            return result.rows[0]?.result;
        } catch (error) {
            throw new Error(`Failed to execute stored procedure: ${error.message}`);
        }
    }

    async getById(params) {
        return await this.executeStoredProcedure({
            action_mode: 'getById',
            ...params
        });
    }

    async getList(params) {
        return await this.executeStoredProcedure({
            action_mode: 'getList',
            ...params
        });
    }

    async create(params) {
        return await this.executeStoredProcedure({
            action_mode: 'insert',
            ...params
        });
    }

    async update(params) {
        return await this.executeStoredProcedure({
            action_mode: 'update',
            ...params
        });
    }

    async delete(params) {
        return await this.executeStoredProcedure({
            action_mode: 'delete',
            ...params
        });
    }
}

module.exports = DBCRUDService;*/