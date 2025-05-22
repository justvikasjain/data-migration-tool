/**
 * Migration tool JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Source Database
  const sourceHost = document.getElementById('sourceHost');
  const sourcePort = document.getElementById('sourcePort');
  const sourceUsername = document.getElementById('sourceUsername');
  const sourcePassword = document.getElementById('sourcePassword');
  const sourceDatabase = document.getElementById('sourceDatabase');
  const sourceTestConnection = document.getElementById('sourceTestConnection');
  const sourceGetTables = document.getElementById('sourceGetTables');

  // DOM Elements - Target Database
  const targetHost = document.getElementById('targetHost');
  const targetPort = document.getElementById('targetPort');
  const targetUsername = document.getElementById('targetUsername');
  const targetPassword = document.getElementById('targetPassword');
  const targetDatabase = document.getElementById('targetDatabase');
  const targetTestConnection = document.getElementById('targetTestConnection');

  // DOM Elements - Tables
  const tableSearch = document.getElementById('tableSearch');
  const selectAllTables = document.getElementById('selectAllTables');
  const tablesList = document.getElementById('tablesList');
  const selectedTablesList = document.getElementById('selectedTablesList');
  const addTableBtn = document.getElementById('addTableBtn');
  const noTablesMessage = document.getElementById('noTablesMessage');
  const tablesContainer = document.getElementById('tablesContainer');
  const noSelectedTablesMessage = document.getElementById('noSelectedTablesMessage');
  const selectedTablesContainer = document.getElementById('selectedTablesContainer');
  const includeData = document.getElementById('includeData');

  // DOM Elements - Migration
  const startMigrationBtn = document.getElementById('startMigrationBtn');
  const migrationResults = document.getElementById('migrationResults');
  const noMigrationResults = document.getElementById('noMigrationResults');
  const migrationResultsBody = document.getElementById('migrationResultsBody');

  // State variables
  let tables = [];
  let selectedTables = [];
  let sourceConnected = false;
  let targetConnected = false;

  // Event Listeners
  sourceTestConnection.addEventListener('click', testSourceConnection);
  targetTestConnection.addEventListener('click', testTargetConnection);
  sourceGetTables.addEventListener('click', getSourceTables);
  addTableBtn.addEventListener('click', addSelectedTables);
  selectAllTables.addEventListener('click', selectAllAvailableTables);
  tableSearch.addEventListener('input', filterTables);
  startMigrationBtn.addEventListener('click', startMigration);

  /**
   * Test connection to source database
   */
  async function testSourceConnection() {
    const connectionData = {
      host: sourceHost.value,
      port: sourcePort.value,
      username: sourceUsername.value,
      password: sourcePassword.value,
      database: sourceDatabase.value
    };

    if (!validateConnectionData(connectionData)) {
      return;
    }

    try {
      disableButton(sourceTestConnection, 'Testing...');

      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      });

      const result = await response.json();

      if (result.success) {
        toastr.success('Connection successful!');
        sourceConnected = true;
        sourceGetTables.disabled = false;
      } else {
        toastr.error('Connection failed. Please check your details.');
        sourceConnected = false;
        sourceGetTables.disabled = true;
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toastr.error('Connection test failed: ' + error.message);
    } finally {
      enableButton(sourceTestConnection, 'Test Connection');
    }
  }

  /**
   * Test connection to target database
   */
  async function testTargetConnection() {
    const connectionData = {
      host: targetHost.value,
      port: targetPort.value,
      username: targetUsername.value,
      password: targetPassword.value,
      database: targetDatabase.value
    };

    if (!validateConnectionData(connectionData)) {
      return;
    }

    try {
      disableButton(targetTestConnection, 'Testing...');

      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      });

      const result = await response.json();

      if (result.success) {
        toastr.success('Connection successful!');
        targetConnected = true;
        updateMigrationButtonState();
      } else {
        toastr.error('Connection failed. Please check your details.');
        targetConnected = false;
        updateMigrationButtonState();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toastr.error('Connection test failed: ' + error.message);
    } finally {
      enableButton(targetTestConnection, 'Test Connection');
    }
  }

  /**
   * Get tables from source database
   */
  async function getSourceTables() {
    const connectionData = {
      host: sourceHost.value,
      port: sourcePort.value,
      username: sourceUsername.value,
      password: sourcePassword.value,
      database: sourceDatabase.value
    };

    if (!validateConnectionData(connectionData)) {
      return;
    }

    try {
      disableButton(sourceGetTables, 'Loading...');

      const response = await fetch('/api/get-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectionData)
      });

      const result = await response.json();

      if (result.success && result.tables) {
        tables = result.tables;
        renderTables();
        
        if (tables.length > 0) {
          noTablesMessage.classList.add('d-none');
          tablesContainer.classList.remove('d-none');
          addTableBtn.disabled = false;
        } else {
          noTablesMessage.textContent = 'No tables found in the database';
          noTablesMessage.classList.remove('d-none');
          tablesContainer.classList.add('d-none');
          addTableBtn.disabled = true;
        }
      } else {
        toastr.error('Failed to fetch tables.');
        noTablesMessage.textContent = 'Failed to load tables';
        noTablesMessage.classList.remove('d-none');
        tablesContainer.classList.add('d-none');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toastr.error('Failed to fetch tables: ' + error.message);
    } finally {
      enableButton(sourceGetTables, 'Get Tables');
    }
  }

  /**
   * Render tables in the available tables list
   */
  function renderTables() {
    tablesList.innerHTML = '';
    
    if (tables.length === 0) {
      return;
    }

    tables.forEach(table => {
      // Skip tables that are already selected
      if (selectedTables.some(t => t.name === table.name)) {
        return;
      }

      const item = document.createElement('a');
      item.href = '#';
      item.className = 'list-group-item list-group-item-action';
      item.textContent = table.name;
      item.dataset.name = table.name;
      
      item.addEventListener('click', function(e) {
        e.preventDefault();
        this.classList.toggle('active');
        updateAddButtonState();
      });
      
      tablesList.appendChild(item);
    });
  }

  /**
   * Filter tables based on search input
   */
  function filterTables() {
    const searchTerm = tableSearch.value.toLowerCase();
    const tableItems = tablesList.querySelectorAll('.list-group-item');
    
    tableItems.forEach(item => {
      const tableName = item.textContent.toLowerCase();
      if (tableName.includes(searchTerm)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  /**
   * Select all available tables
   */
  function selectAllAvailableTables() {
    const tableItems = tablesList.querySelectorAll('.list-group-item');
    const displayedItems = Array.from(tableItems).filter(item => item.style.display !== 'none');
    
    const anyNotSelected = displayedItems.some(item => !item.classList.contains('active'));
    
    displayedItems.forEach(item => {
      if (anyNotSelected) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    updateAddButtonState();
  }

  /**
   * Add selected tables to migration list
   */
  function addSelectedTables() {
    const selectedItems = tablesList.querySelectorAll('.list-group-item.active');
    
    if (selectedItems.length === 0) {
      toastr.warning('No tables selected.');
      return;
    }
    
    selectedItems.forEach(item => {
      const tableName = item.dataset.name;
      
      // Add to selected tables
      selectedTables.push({ 
        name: tableName
      });
      
      // Remove from available list
      item.remove();
    });
    
    renderSelectedTables();
    updateAddButtonState();
    updateMigrationButtonState();
  }

  /**
   * Render selected tables
   */
  function renderSelectedTables() {
    selectedTablesList.innerHTML = '';
    
    if (selectedTables.length === 0) {
      noSelectedTablesMessage.classList.remove('d-none');
      selectedTablesContainer.classList.add('d-none');
      return;
    }
    
    noSelectedTablesMessage.classList.add('d-none');
    selectedTablesContainer.classList.remove('d-none');
    
    selectedTables.forEach((table, index) => {
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-center';
      
      const tableNameEl = document.createElement('span');
      tableNameEl.textContent = table.name;
      item.appendChild(tableNameEl);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-sm btn-danger';
      removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
      removeBtn.addEventListener('click', () => removeSelectedTable(index));
      
      item.appendChild(removeBtn);
      selectedTablesList.appendChild(item);
    });
  }

  /**
   * Remove selected table
   */
  function removeSelectedTable(index) {
    const removedTable = selectedTables.splice(index, 1)[0];
    
    // Add back to available tables list
    renderTables();
    
    // Update selected tables list
    renderSelectedTables();
    updateMigrationButtonState();
  }

  /**
   * Start the migration process
   */
  async function startMigration() {
    if (selectedTables.length === 0) {
      toastr.warning('No tables selected for migration.');
      return;
    }
    
    if (!sourceConnected || !targetConnected) {
      toastr.error('Please test both database connections before migrating.');
      return;
    }
    
    try {
      disableButton(startMigrationBtn, 'Migrating...');
      
      // Show migration results section
      noMigrationResults.classList.add('d-none');
      migrationResults.classList.remove('d-none');
      migrationResultsBody.innerHTML = '';
      
      const sourceConfig = {
        sourceHost: sourceHost.value,
        sourcePort: sourcePort.value,
        sourceUsername: sourceUsername.value,
        sourcePassword: sourcePassword.value,
        sourceDatabase: sourceDatabase.value
      };
      
      const targetConfig = {
        targetHost: targetHost.value,
        targetPort: targetPort.value,
        targetUsername: targetUsername.value,
        targetPassword: targetPassword.value,
        targetDatabase: targetDatabase.value
      };
      
      const includeDataValue = includeData.checked;
      
      // Migrate each table sequentially
      for (const table of selectedTables) {
        // Add row to results table
        const resultRow = document.createElement('tr');
        resultRow.innerHTML = `
          <td>${table.name}</td>
          <td><span class="status-in-progress"><i class="bi bi-arrow-repeat loading-spinner"></i> In progress</span></td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        `;
        migrationResultsBody.appendChild(resultRow);
        
        try {
          const startTime = new Date();
          
          // Make API call to migrate table
          const response = await fetch('/api/migrate-table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...sourceConfig,
              ...targetConfig,
              tableName: table.name,
              includeData: includeDataValue
            })
          });
          
          const result = await response.json();
          const endTime = new Date();
          const duration = ((endTime - startTime) / 1000).toFixed(2);
          
          // Update result row
          if (result.success) {
            resultRow.innerHTML = `
              <td>${table.name}</td>
              <td><span class="status-success"><i class="bi bi-check-circle"></i> Success</span></td>
              <td>${result.result.rowsImported}</td>
              <td>${duration}s</td>
              <td>${result.message || '-'}</td>
            `;
          } else {
            resultRow.innerHTML = `
              <td>${table.name}</td>
              <td><span class="status-error"><i class="bi bi-x-circle"></i> Failed</span></td>
              <td>0</td>
              <td>${duration}s</td>
              <td>${result.message || 'Unknown error'}</td>
            `;
          }
        } catch (error) {
          console.error(`Error migrating table ${table.name}:`, error);
          resultRow.innerHTML = `
            <td>${table.name}</td>
            <td><span class="status-error"><i class="bi bi-x-circle"></i> Error</span></td>
            <td>0</td>
            <td>-</td>
            <td>${error.message || 'Unknown error'}</td>
          `;
        }
      }
      
      toastr.success('Migration process completed.');
      
    } catch (error) {
      console.error('Migration error:', error);
      toastr.error('Migration failed: ' + error.message);
    } finally {
      enableButton(startMigrationBtn, 'Start Migration');
    }
  }

  /**
   * Update the state of the add button
   */
  function updateAddButtonState() {
    const selectedItems = tablesList.querySelectorAll('.list-group-item.active');
    addTableBtn.disabled = selectedItems.length === 0;
  }

  /**
   * Update the state of the migration button
   */
  function updateMigrationButtonState() {
    startMigrationBtn.disabled = selectedTables.length === 0 || !targetConnected;
  }

  /**
   * Validate connection data
   */
  function validateConnectionData(data) {
    if (!data.host) {
      toastr.error('Host is required');
      return false;
    }
    
    if (!data.username) {
      toastr.error('Username is required');
      return false;
    }
    
    if (!data.database) {
      toastr.error('Database name is required');
      return false;
    }
    
    return true;
  }

  /**
   * Disable a button with loading text
   */
  function disableButton(button, loadingText) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
  }

  /**
   * Enable a button with original text
   */
  function enableButton(button, originalText) {
    button.disabled = false;
    button.textContent = originalText || button.dataset.originalText;
  }
});
