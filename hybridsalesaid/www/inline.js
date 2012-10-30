//Sample code for Hybrid REST Explorer

function regLinkClickHandlers() {
    var $j = jQuery.noConflict();
    var logToConsole = cordova.require("salesforce/util/logger").logToConsole;
    $j('#link_fetch_device_contacts').click(function() {
                                           logToConsole("link_fetch_device_contacts clicked");
                                           var options = cordova.require("cordova/plugin/ContactFindOptions");
                                           options.filter = ""; // empty search string returns all contacts
                                           options.multiple = true;
                                           var fields = ["name"];
                                           var contactsObj = cordova.require("cordova/plugin/contacts");
                                           contactsObj.find(fields, onSuccessDevice, onErrorDevice, options);
                                           });
    
    $j('#link_fetch_sfdc_contacts').click(function() {
                                         logToConsole("link_fetch_sfdc_contacts clicked");
                                         forcetkClient.query("SELECT Name FROM Contact", onSuccessSfdcContacts, onErrorSfdc); 
                                         });
    
    $j('#link_fetch_sfdc_accounts').click(function() {
                                         logToConsole("link_fetch_sfdc_accounts clicked");
                                         forcetkClient.query("SELECT Name FROM Account", onSuccessSfdcAccounts, onErrorSfdc); 
                                         });
    
    $j('#link_fetch_sfdc_content').click(function() {
                                          logToConsole("link_fetch_sfdc_content clicked");
                                          forcetkClient.query("SELECT Id, CreatedById, CreatedDate, IsDeleted, LastModifiedById, LastModifiedDate, LatestPublishedVersionId, OwnerId, PublishStatus, SystemModstamp, Title FROM ContentDocument Where PublishStatus = 'P'", onSuccessSfdcContent, onErrorSfdc);
                                          });
    $j('#link_fetch_sfdc_contentid').click(function(){
                                           logToConsole("link_fetch_sfdc_contentid");
                                           forcetkClient.retrieve('ContentDocument','069U0000000Mp3SIAS',onSuccessSfdcContentId, onErrorSfdc)
                                           });
    $j('#link_fetch_sfdc_sync').click(function(){
                                           logToConsole("link_fetch_sfdc_sync");
                                           dao.sync(onSuccessSfdcSync);
                                           });
    $j('#render').click(function(){
                        logToConsole("render");
                        renderList();
                        });
    
    $j('#link_reset').click(function() {
       logToConsole("link_reset clicked");
       $j("#div_device_contact_list").html("")
       $j("#div_sfdc_contact_list").html("")
       $j("#div_sfdc_account_list").html("")
       $j("#console").html("")
       dao.dropTable(function() {
            dao.createTable();
        });
                            
   });
    
    $j('#link_logout').click(function() {
             logToConsole("link_logout clicked");
             var sfOAuthPlugin = cordova.require("salesforce/plugin/oauth");
             sfOAuthPlugin.logout();
             });
}

function onSuccessDevice(contacts) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessDevice: received " + contacts.length + " contacts");
    
    $j("#div_device_contact_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_device_contact_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Device Contacts: ' + contacts.length + '</li>'));
    $j.each(contacts, function(i, contact) {
           var formattedName = contact.name.formatted;
           if (formattedName) {
           var newLi = $j("<li><a href='#'>" + (i+1) + " - " + formattedName + "</a></li>");
           ul.append(newLi);
           }
           });
    
    $j("#div_device_contact_list").trigger( "create" )
}

function onErrorDevice(error) {
    cordova.require("salesforce/util/logger").logToConsole("onErrorDevice: " + JSON.stringify(error) );
    alert('Error getting device contacts!');
}

function onSuccessSfdcContacts(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcContacts: received " + response.totalSize + " contacts");
    
    $j("#div_sfdc_contact_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_contact_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Salesforce Contacts: ' + response.totalSize + '</li>'));
    
    $j.each(response.records, function(i, contact) {
            
           var newLi = $j("<li><a href='#'>" + (i+1) + " - " + contact.FirstName + "</a></li>");
            logToConsole('inlinecontacts');
           ul.append(newLi);
           });
    
    $j("#div_sfdc_contact_list").trigger( "create" )
}

function onSuccessSfdcSync(response) {
    var $j = jQuery.noConflict();
    
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcSync: received " + response.totalSize + " contacts");
    
    dao.findAll(function(employees) {
        $j("#div_sfdc_contact_list").html("")
        var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
        $j("#div_sfdc_contact_list").append(ul);
        var l = employees.length;
        ul.append($j('<li data-role="list-divider">Salesforce Contacts from DB: ' + l + '</li>'));
        
        logToConsole(l);
        for (var i = 0; i < l; i++) {
            var employee = employees[i];
            var newLi = $j("<li><a href='#'>" + (i+1) + " - " + employee.firstName + "</a></li>");
            ul.append(newLi);
        }
    });

    
    $j("#div_sfdc_contact_list").trigger( "create" )
}

function onSuccessSfdcAccounts(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcAccounts: received " + response.totalSize + " accounts");
    
    $j("#div_sfdc_account_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_account_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Salesforce Accounts: ' + response.totalSize + '</li>'));
    $j.each(response.records, function(i, record) {
           var newLi = $j("<li><a href='#'>" + (i+1) + " - " + record.Name + "</a></li>");
           ul.append(newLi);
           });
    
    $j("#div_sfdc_account_list").trigger( "create" )
}

function onSuccessSfdcContent(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcContent: received " + response.totalSize + " content");
    
    $j("#div_sfdc_content_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_content_list").append(ul);
    
    ul.append($j('<li data-role="list-divider">Salesforce Content: ' + response.totalSize + '</li>'));
    $j.each(response.records, function(i, record) {
            var newLi = $j("<li><a href='#'>" + (i+1) + " - " + record.Title + "</a></li>");
            ul.append(newLi);
            });
    
    $j("#div_sfdc_content_list").trigger( "create" )
}

function onSuccessSfdcContentId(response) {
    var $j = jQuery.noConflict();
    cordova.require("salesforce/util/logger").logToConsole("onSuccessSfdcContentId: received " + response.totalSize + " content");
        alert(response);

    $j("#div_sfdc_contentid_list").html("")
    var ul = $j('<ul data-role="listview" data-inset="true" data-theme="a" data-dividertheme="a"></ul>');
    $j("#div_sfdc_contentid_list").append(ul);

    ul.append($j('<li data-role="list-divider">Salesforce Content Id: ' + response.totalSize + '</li>'));
    $j.each(response.records, function(i, record) {
           var newLi = $j("<li><a href='#'>" + (i+1) + " - " + record.Title + "</a></li>");
           ul.append(newLi);
           });

    $j("#div_sfdc_contentid_list").trigger( "create" )
}

function onErrorSfdc(error) {
    cordova.require("salesforce/util/logger").logToConsole("onErrorSfdc: " + JSON.stringify(error));
    alert('Error getting sfdc contacts!');
}