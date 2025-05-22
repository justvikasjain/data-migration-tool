const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migrationController');

// Home page
router.get('/', migrationController.getHome);

// API routes
router.post('/api/test-connection', migrationController.testConnection);
router.post('/api/get-tables', migrationController.getTables);
router.post('/api/get-table-structure', migrationController.getTableStructure);
router.post('/api/migrate-table', migrationController.migrateTable);

module.exports = router;
