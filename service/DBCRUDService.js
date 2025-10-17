const db = require('./shared/database');

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

module.exports = DBCRUDService;
