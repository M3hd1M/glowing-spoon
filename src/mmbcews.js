/**
 * Bankin Challenge Engineering : Web Scrapping
 * https://blog.bankin.com/challenge-engineering-web-scrapping-dc5839543117
 * 
 * Author : Mehdi MASROUR (mehdi@masrour.fr)
 *
 * Date : 2018-01-13
 *
 * Usage : casperjs mmbcews.js [--outputFile=result.json] [--url=https://web.bankin.com/challenge/index.html] [--start=0] [--follow] [--groupByAccount]
 *
 * Github Repo : https://github.com/M3hd1M/glowing-spoon
 *
 */


/**
 * GLOBAL VARIABLES
 */
 
// Casper the Friendly Ghost that will get me an iPhone X
var casper = require('casper').create();

// URL to scrap
var baseURL = 'https://web.bankin.com/challenge/index.html';
if (casper.cli.has('url')) baseURL = casper.cli.get('url');

// The page used for the challenge can take a really long time to load...
var maxTimeout = 60000;

// If they want the json in a file
var outputFile = null;
if (casper.cli.has('outputFile')) outputFile = casper.cli.get('outputFile');

// Global array variable for our transactions
var jsonArray = [];

// If they want to start at a specific transaction
var start = 0;
if (casper.cli.has('start') && !isNaN(casper.cli.get('start'))) start = casper.cli.get('start');

// Easy config if the GET parameter is changed
var pageParameter = '?start=';

// If they really want to follow the fake "Next" link...
var follow = false;
if (casper.cli.has('follow')) follow = true;

// If they want a really nice JSON grouped by Account
var groupByAccount = false;
if (casper.cli.has('groupByAccount')) groupByAccount = true;

// Index of the current group key, used in the group function
var currentIdx = -1;

/**
 * XPATH SELECTORS
 */
 
// The "Next" button is always here
nextSelector = {
    type: 'xpath',
    path: '//a[text()="Next -->"]'
};
// If "Something went wrong" we have a button to click in order to generate transactions
btnSelector = {
    type: 'xpath',
    path: '//input[@id="btnGenerate"]'
};
// Transactions are either in an iframe #fm or a table in the #dvTable div
contentReadySelector = {
    type: 'xpath',
    path: '//iframe[@id="fm"]|//div[@id="dvTable"]/table'
};
// When transactions are in table mode we have at least one line (tr)
tableSelector = {
    type: 'xpath',
    path: '//div[@id="dvTable"]/table//tr'
};


/**
 * MAIN FUNCTION
 * Browses through transactions pages, evaluates html data and prints or writes result JSON
 */
function browse(){
    // We wait until the "Next" text is available.
    casper.waitForSelector(nextSelector, function(){
        // If "Something went wrong" we have the generate button and have to click it 
        if (casper.exists(btnSelector)) casper.click(btnSelector);
    });
   
    casper.then(function(){
        // Now we wait for the transactions to be available on the page
        casper.waitForSelector(contentReadySelector, function(){}, function(){}, maxTimeout);
    });
   
    casper.then(function(){
        // The table is always here but not always used
        // If Transactions are in "table mode" we have at least one line
        if (casper.exists(tableSelector)){
            jsonArray = jsonArray.concat(casper.evaluate(evaluateTable));
        } else {
            // Else Transactions are in "iframe mode" so we change the current frame
            casper.withFrame(0, function(){
                jsonArray = jsonArray.concat(casper.evaluate(evaluateTable));
            });
        }
        casper.then(function(){
            if (jsonArray[jsonArray.length-1] == ""){
                // If the last json we added to our array is empty we didn't find any line in our last evaluation so we are done
                // Removing the last empy item
                jsonArray.splice(-1);
                casper.exit();
            } else {
                if (follow){
                    // They really want to follow that fake "Next" text...
                    var nextLink = casper.getElementAttribute(nextSelector,"href");
                    // So we check if we are really going to change the page...
                    if (baseURL+nextLink == casper.getCurrentUrl()){
                        casper.exit();
                    } else {
                        casper.click(nextSelector);
                    }    
                } else {
                    // Our last item isn't empty so it should contain a Transaction ID :
                    var lastTransaction = jsonArray[jsonArray.length-1]['Id'];
                    // We open the next page "manually" because the "Next" button is fake
                    casper.thenOpen(baseURL+pageParameter+lastTransaction);
                }
                // When the page is loaded we repeat the browse process
                casper.then(browse);
            }
        });
    });
}

/**
 * EVALUATE FUNCTION
 * Parses every table line (tr) from the current document 
 * and returns the content as a "json-ready" array
 */
function evaluateTable(){
    var rows = document.getElementsByTagName("tr");
    // If we only have 1 row it means we only have the header and we are done
    if (rows.length == 1) return null;
    // We get the headers just in case titles (or their order) are changed accross pages...
    var headerCells = rows[0].cells;
    // Mapping all the rows except first one (headers)
    return Array.prototype.map.call(Array.prototype.slice.call(rows,1), function(row) {
        var tmpJSON = {};
        // Now we fill the Account and Transaction
        for(i=0; i<headerCells.length; i++){
            if (headerCells[i].textContent == "Amount"){
                var amount = row.cells[i].textContent;
                // We capture everything that is not a number to get the currency
                var matchArray = amount.match(/([^0-9]+)/);
                tmpJSON["Currency"] = matchArray[1];
                // The amount is always the third element of the match and we put it in float
                tmpJSON[headerCells[i].textContent] = parseFloat(matchArray[2]);
            } else if (headerCells[i].textContent == "Transaction"){
                // We extract the transaction number and put it in int
                tmpJSON["Id"] = parseInt(row.cells[i].textContent.match(/\d+/g)[0]);
            } else {
                tmpJSON[headerCells[i].textContent] = row.cells[i].textContent;
            }
        }
        return tmpJSON;
    });
}

/**
 * GROUP FUNCTION
 * Allows to group an array using one of its properties (Account for example...)
 */
function groupBy(array, key) {
    return array.reduce(function(accumulator, val) {
        // Grouping key will be plural
        var plural = key+'s';
        // Initialize the array
        accumulator[plural] = accumulator[plural] || [];
        // If the current account type does not exist yet
        if (accumulator[plural].filter(function(e) { return e["Type"] === val[key]; }).length < 1){ 
            var tmp = {"Type": val[key], "Transactions": []};
            currentIdx = (accumulator[plural].push(tmp))-1;
        }
        // Temp object containing the current transaction
        var tmpObj = {};
        for (var k in val){
            // Don't need to add the grouping key itself
            if (k != key) tmpObj[k] = val[k];
        }
        accumulator[plural][currentIdx]["Transactions"].push(tmpObj);     
        return accumulator;
  }, {});
};


// waitFor timeout "handling"
casper.on('waitFor.timeout', function(timeout, details){
    casper.echo("Selector "+details.selector.path+" didn't show in time ("+timeout+"ms)...", "ERROR");
});

// Error "handling"
casper.on('error', function(msg, backtrace){
    casper.echo("Something went wrong : "+msg, "ERROR"); 
});

// On exit, we print or write the json
casper.on('exit', function(status){
    if (groupByAccount) jsonArray = groupBy(jsonArray, "Account");
    var json = JSON.stringify(jsonArray);
    // If not mentionned, we output json to the console
    if (outputFile == null){
        casper.echo(json);
    } else {
        try{
            // Else we try to write the json to the provided outputFile
            var fs = require('fs');
            fs.write(outputFile, json, 'w');
        } catch(e){
            // If we have any error trying to write the json to the file 
            // we print the error and the json
            casper.echo(e,'ERROR');
            casper.echo(json);
        }
    }
});

// Starts Casper, then opens the provided url, callback to "browse" function
casper.start(baseURL+pageParameter+start, browse);

// Casper run
casper.run();
