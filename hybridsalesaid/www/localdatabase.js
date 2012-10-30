


var mydb=false;

// initialise the database
initDB = function() {
    
    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            var shortName = 'salesbinderdb';
            var version = '1.0';
            var displayName = 'Sales Binder Database';
            var maxSize = 65536; // in bytes
            mydb = openDatabase(shortName, version, displayName, maxSize);
            alert('createTables');
            this.createTables();
            
        }
    } catch(e) {
        // Error handling code goes here.
        if (e == INVALID_STATE_ERR) {
            // Version number mismatch.
            alert("Invalid database version.");
        } else {
            alert("Unknown error "+e+".");
        }
        return;
    }
}
    
// db error handler - prevents the rest of the transaction going ahead on failure
errorHandler = function (transaction, error) {
    alert(error);
    // returns true to rollback the transaction
    return true;
    
}

// null db data handler
nullDataHandler = function (transaction, results) { }


// create tables for the database
createTables = function() {
    
    try {
        
        mydb.transaction(function(transaction) {
                         alert('db');
                         var sql = "CREATE TABLE contacts(iD uniqueidentifier NOT NULL PRIMARY KEY," +
                         "Name TEXT NOT NULL DEFAULT ";
                         transaction.executeSql(sql, nullDataHandler, errorHandler);
                         alert('db');
                         transaction.executeSql('insert into contacts (id,name) VALUES (1,"Kylie Minogue");', [], nullDataHandler, errorHandler);
                         //transaction.executeSql('insert into celebs (id,name) VALUES (2,"Keira Knightley");', [], nullDataHandler, errorHandler);
                         this.loadContacts();
                         });
        
    } catch(e) {
        //alert(e.message);
        return;
    }
}


// callback function to retrieve the data from the prefs table
contactsDataHandler=function(transaction, results) {
    // Handle the results
    var html = "<ul>";
    for (var i=0; i<results.rows.length; i++) {
        var row = results.rows.item(i);
        html += '<li>'+row['name']+'</li>\n';
    }
    html +='</ul>';
    alert(html);
}


// load the currently selected icons
loadContacts = function() {
    try {
        
        mydb.transaction(
                         function(transaction) {
                         transaction.executeSql('SELECT * FROM contacts ORDER BY name',[], contactsDataHandler, errorHandler);
                         });
        
    } catch(e) {
        alert(e.message);
    }
    
}