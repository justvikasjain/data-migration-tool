const mysql = require('mysql2/promise');

/**
 * Create a database connection
 * @param {Object} config - Database configuration
 * @returns {Promise<Connection>} MySQL connection
 */
async function createConnection(config) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      user: config.username,
      password: config.password,
      database: config.database
    });
    
    return connection;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

/**
 * Test if a database connection is valid
 * @param {Object} config - Database configuration
 * @returns {Promise<boolean>} True if connection is valid
 */
async function testConnection(config) {
  try {
    const connection = await createConnection(config);
    await connection.ping();
    await connection.end();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error.message);
    return false;
  }
}

/**
 * Get all tables in a database
 * @param {Object} config - Database configuration
 * @returns {Promise<Array>} List of tables
 */
async function getTables(config) {
  try {
    const connection = await createConnection(config);
    const [rows] = await connection.query(`
      SELECT table_name AS name
      FROM information_schema.tables
      WHERE table_schema = ?
      ORDER BY table_name
    `, [config.database]);
    
    await connection.end();
    return rows;
  } catch (error) {
    console.error('Get tables error:', error.message);
    throw new Error(`Failed to get tables: ${error.message}`);
  }
}

/**
 * Get table structure
 * @param {Object} config - Database configuration
 * @param {string} tableName - Table name
 * @returns {Promise<Object>} Table structure
 */
async function getTableStructure(config, tableName) {
  try {
    const connection = await createConnection(config);
    
    // Get columns
    const [columns] = await connection.query(`
      SELECT 
        column_name AS name, 
        data_type AS type,
        column_type AS column_type,
        is_nullable AS nullable,
        column_key AS 'key',
        column_default AS 'default',
        extra
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ?
      ORDER BY ordinal_position
    `, [config.database, tableName]);
    
    // Get primary keys
    const [primaryKeys] = await connection.query(`
      SELECT 
        column_name AS name
      FROM information_schema.key_column_usage
      WHERE table_schema = ? 
        AND table_name = ?
        AND constraint_name = 'PRIMARY'
      ORDER BY ordinal_position
    `, [config.database, tableName]);
    
    // Get indexes
    const [indexes] = await connection.query(`
      SELECT
        index_name AS name,
        GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns,
        non_unique
      FROM information_schema.statistics
      WHERE table_schema = ? AND table_name = ?
      GROUP BY index_name, non_unique
      ORDER BY index_name
    `, [config.database, tableName]);
    
    // Get create table statement
    const [createTable] = await connection.query(`SHOW CREATE TABLE ${mysql.escapeId(config.database)}.${mysql.escapeId(tableName)}`);
    
    await connection.end();
    
    return {
      name: tableName,
      columns,
      primaryKeys: primaryKeys.map(pk => pk.name),
      indexes,
      createStatement: createTable[0]['Create Table']
    };
  } catch (error) {
    console.error('Get table structure error:', error.message);
    throw new Error(`Failed to get table structure: ${error.message}`);
  }
}

/**
 * Migrate table structure and data
 * @param {Object} sourceConfig - Source database configuration
 * @param {Object} targetConfig - Target database configuration
 * @param {string} tableName - Table name
 * @param {boolean} includeData - Whether to include data
 * @returns {Promise<Object>} Migration result
 */
async function migrateTable(sourceConfig, targetConfig, tableName, includeData = true) {
  try {
    // Get source table structure
    const tableStructure = await getTableStructure(sourceConfig, tableName);
    
    // Connect to source and target databases
    const sourceConnection = await createConnection(sourceConfig);
    const targetConnection = await createConnection(targetConfig);
    
    // Create table in target database
    // We modify the create statement to use the target database
    let createStatement = tableStructure.createStatement.replace(
      new RegExp(`\`${sourceConfig.database}\`\.`, 'g'), 
      `\`${targetConfig.database}\`.`
    );
    
    try {
      // Check if table already exists in target
      const [existingTables] = await targetConnection.query(`
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = ? AND table_name = ?
      `, [targetConfig.database, tableName]);
      
      if (existingTables.length > 0) {
        // Drop the table if it exists
        await targetConnection.query(`DROP TABLE IF EXISTS ${mysql.escapeId(targetConfig.database)}.${mysql.escapeId(tableName)}`);
      }
      
      // Create the table
      await targetConnection.query(createStatement);
      
    } catch (error) {
      throw new Error(`Failed to create table structure: ${error.message}`);
    }
    
    // Migrate data if required
    let rowCount = 0;
    
    if (includeData) {
      try {
        // Get column names for insert
        const columnNames = tableStructure.columns.map(col => col.name).join(', ');
        const placeholders = tableStructure.columns.map(() => '?').join(', ');
        
        // Get data from source
        const [rows] = await sourceConnection.query(`SELECT * FROM ${mysql.escapeId(sourceConfig.database)}.${mysql.escapeId(tableName)}`);
        
        // If there's data to migrate
        if (rows.length > 0) {
          // Insert data in batches to avoid memory issues
          const batchSize = 1000;
          
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const values = batch.map(row => Object.values(row));
            
            // Insert batch
            await targetConnection.query(`
              INSERT INTO ${mysql.escapeId(targetConfig.database)}.${mysql.escapeId(tableName)} 
              (${columnNames}) VALUES ?
            `, [values]);
          }
          
          rowCount = rows.length;
        }
      } catch (error) {
        throw new Error(`Failed to migrate data: ${error.message}`);
      }
    }
    
    // Close connections
    await sourceConnection.end();
    await targetConnection.end();
    
    return {
      success: true,
      table: tableName,
      rowsImported: rowCount
    };
  } catch (error) {
    console.error('Table migration error:', error);
    throw new Error(`Failed to migrate table: ${error.message}`);
  }
}

module.exports = {
  createConnection,
  testConnection,
  getTables,
  getTableStructure,
  migrateTable
};
