dao =  {

    syncURL: "../api/employees",

    initialize: function(callback) {
        var self = this;
        this.db = window.openDatabase("salesbinder", "1.0", "Sales Binder DB", 200000);

        // Testing if the table exists is not needed and is here for logging purpose only. We can invoke createTable
        // no matter what. The 'IF NOT EXISTS' clause will make sure the CREATE statement is issued only if the table
        // does not already exist.
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='employee'", this.txErrorHandler,
                    function(tx, results) {
                        if (results.rows.length == 1) {
                            logToConsole('Using existing Employee table in local SQLite database');
                        }
                        else
                        {
                            logToConsole('Employee table does not exist in local SQLite database');
                            self.createTable(callback);
                        }
                    });
            }
        )

    },
        
    createTable: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS employee ( " +
                    "id GUID PRIMARY KEY, " +
                    "firstName VARCHAR(50), " +
                    "lastName VARCHAR(50), " +
                    "title VARCHAR(50), " +
                    "officePhone VARCHAR(50), " +
                    "deleted INTEGER, " +
                    "lastModified VARCHAR(50))";
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function() {
                logToConsole('Table employee successfully CREATED in local SQLite database');
                callback();
            }
        );
        //CREATE Accounts Table
        this.db.transaction(
            function(tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS Accounts ( " +
                    "id GUID PRIMARY KEY, " +
                    "firstName VARCHAR(50), " +
                    "lastName VARCHAR(50), " +
                    "title VARCHAR(50), " +
                    "officePhone VARCHAR(50), " +
                    "deleted INTEGER, " +
                    "lastModified VARCHAR(50))";
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function() {
                logToConsole('Table employee successfully CREATED in local SQLite database');
                callback();
            }
        );
        //CREATE Content Table
        this.db.transaction(
            function(tx) {
                var sql =
                "CREATE TABLE IF NOT EXISTS Content ( " +
                "id GUID PRIMARY KEY, " +
                "title VARCHAR(765), " +
                "publishStatus VARCHAR(50), " +
                "title VARCHAR(50), " +
                "createdlDate VARCHAR(50), " +
                "deleted INTEGER, " +
                "lastModified VARCHAR(50))";
                tx.executeSql(sql);
                },
                this.txErrorHandler,
                function() {
                logToConsole('Table content successfully CREATED in local SQLite database');
                callback();
            }
        );


    },

    dropTable: function(callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql('DROP TABLE IF EXISTS employee');
            },
            this.txErrorHandler,
            function() {
                logToConsole('Table employee successfully DROPPED in local SQLite database');
                callback();
            }
        );
    },

    findAll: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM EMPLOYEE";
                logToConsole('Local SQLite database: "SELECT * FROM EMPLOYEE"');
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var len = results.rows.length,
                            employees = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            employees[i] = results.rows.item(i);
                        }
                        logToConsole(len + ' rows found');
                        callback(employees);
                    }
                );
            }
        );
    },

    getLastSync: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT MAX(lastModified) as lastSync FROM employee";
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var lastSync = results.rows.item(0).lastSync;
                        logToConsole('Last local timestamp is ' + lastSync);
                        callback(lastSync);
                    }
                );
            }
        );
    },

    sync: function(callback) {

        var self = this;
        logToConsole('Starting synchronization...');
        this.getLastSync(function(lastSync){
            self.getChanges(self.syncURL, lastSync,
                function (changes) {
                logToConsole(changes.totalSize);
                    if (changes.totalSize > 0) {
                        self.applyChanges(changes, callback);
                    } else {
                        log('Nothing to synchronize');
                        callback();
                    }
                }
            );
        });

    },

    getChanges: function(syncURL, modifiedSince, callback) {
        
        forcetkClient.query("SELECT Id, FirstName, LastName, Title, IsDeleted, LastModifiedDate FROM Contact", function(response) {
                            callback(response);}, function(response) {
                            logtoConsole('error sync');})
        
        /*$.ajax({
            url: syncURL,
            data: {modifiedSince: modifiedSince},
            dataType:"json",
            success:function (data) {
                log("The server returned " + data.length + " changes that occurred after " + modifiedSince);
                callback(data);
            },
            error: function(model, response) {
                alert(response.responseText);
            }
        });*/

    },

    applyChanges: function(response, callback) {
        
        this.db.transaction(
            function(tx) {
                
                var l = response.totalSize;
                var sql =
                    "INSERT OR REPLACE INTO employee (id, firstName, lastName, title, deleted, lastModified) " +
                    "VALUES (?, ?, ?, ?, ?, ?)";
                logToConsole('Inserting or Updating in local database:');
                
                var $j = jQuery.noConflict();
                cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcContacts: to write " + response.totalSize + " contacts");
                //var e;
                $j.each(response.records, function(i, contact) {
                        
                    logToConsole(contact.Id + ' ' + contact.FirstName + ' ' + contact.LastName + ' ' + contact.Title + ' ' + contact.IsDeleted + ' ' + contact.LastModifiedDate);
                        var params = [ contact.Id, contact.FirstName, contact.LastName, contact.Title, contact.IsDeleted, contact.LastModifiedDate ];
                        logToConsole('update');
                        tx.executeSql(sql, params,nullDataHandler,errorTransaction);
                });
                callback(response);
                //for (var i = 0; i < l; i++) {
                 //           e = employees[i];
                 //           logToConsole(l);
                 //   logToConsole(e.Id + ' ' + e.FirstName + ' ' + e.LastName + ' ' + e.Title + ' ' + e.Phone + ' ' + e.IsDeleted + ' ' + e.LastModifiedDate);
                 //   var params = [e.Id, e.FirstName, e.LastName, e.Title, e.Phone, e.IsDeleted, e.LastModifiedDate];
                 //   tx.executeSql(sql, params);
                //}
                //logtoConsole('Synchronization complete (' + l + ' items synchronized)');
                
            },
            this.txErrorHandler,
            function(tx) {
                callback();
            }
        );
    },

    txErrorHandler: function(tx) {
        alert(tx.message);
    }
};


dao.initialize(function() {
    logToConsole('database initialized');
});

function nullDataHandler(transaction, results)   {
}

/* This is the error handler */
function  errorTransaction(transaction, error) {
    alert(transaction);
}
