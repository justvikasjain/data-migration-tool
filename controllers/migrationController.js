const dbModel = require('../models/database');

/**
 * Render the home page
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getHome = (req, res) => {
  res.render('home', { title: 'DB Migration Tool' });
};

/**
 * Test database connection
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.testConnection = async (req, res, next) => {
  try {
    const config = {
      host: req.body.host,
      port: req.body.port || 3306,
      username: req.body.username,
      password: req.body.password,
      database: req.body.database
    };
    
    const isConnected = await dbModel.testConnection(config);
    
    res.json({ success: isConnected });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tables in a database
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.getTables = async (req, res, next) => {
  try {
    const config = {
      host: req.body.host,
      port: req.body.port || 3306,
      username: req.body.username,
      password: req.body.password,
      database: req.body.database
    };
    
    const tables = await dbModel.getTables(config);
    
    res.json({ success: true, tables });
  } catch (error) {
    next(error);
  }
};

/**
 * Get table structure
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.getTableStructure = async (req, res, next) => {
  try {
    const config = {
      host: req.body.host,
      port: req.body.port || 3306,
      username: req.body.username,
      password: req.body.password,
      database: req.body.database
    };
    
    const tableName = req.body.tableName;
    
    const structure = await dbModel.getTableStructure(config, tableName);
    
    res.json({ success: true, structure });
  } catch (error) {
    next(error);
  }
};

/**
 * Migrate table structure and data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
exports.migrateTable = async (req, res, next) => {
  try {
    const sourceConfig = {
      host: req.body.sourceHost,
      port: req.body.sourcePort || 3306,
      username: req.body.sourceUsername,
      password: req.body.sourcePassword,
      database: req.body.sourceDatabase
    };
    
    const targetConfig = {
      host: req.body.targetHost,
      port: req.body.targetPort || 3306,
      username: req.body.targetUsername,
      password: req.body.targetPassword,
      database: req.body.targetDatabase
    };
    
    const tableName = req.body.tableName;
    const includeData = req.body.includeData === true || req.body.includeData === 'true';
    
    const result = await dbModel.migrateTable(sourceConfig, targetConfig, tableName, includeData);
    
    res.json({ 
      success: true, 
      message: `Successfully migrated table ${tableName}`,
      result 
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to migrate table'
    });
  }
};
