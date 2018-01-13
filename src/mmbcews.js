/**
 * Bankin Challenge Engineering : Web Scrapping
 * https://blog.bankin.com/challenge-engineering-web-scrapping-dc5839543117
 * 
 * Author : Mehdi MASROUR (mehdi@masrour.fr)
 *
 * Date : 2018-01-13
 *
 * Usage : casperjs mmbcews.js [--outputFile=result.json]
 */


/**
 * GLOBAL VARIABLES
 */
 
// Casper the Friendly Ghost that will get me an iPhone X
var casper = require('casper').create();

// URL to scrap
var baseURL = 'https://web.bankin.com/challenge/index.html';

// The page used for the challenge can take a really long time to load...
var maxTimeout = 60000;

// If they want the json in a file
var outputFile = null;
if (casper.cli.has('outputFile')) outputFile = casper.cli.get('outputFile');

// Global array variable for our transactions
var jsonArray = [];


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


/**
 * MAIN FUNCTION
 * Browses through transactions pages, evaluates html data and echoes or writes result JSON
 */
function browse(){
    // We wait until the "Next" text is available.
    casper.waitForSelector(nextSelector, function(){
        // If "Something went wrong" we have the generate button and have to click it 
        if (casper.visible(btnSelector)) casper.click(btnSelector);
    });
   
    casper.then(function(){
        // Now we wait for the transactions to be available on the page
        casper.waitForSelector(contentReadySelector, function(){}, function(){}, maxTimeout);
    });
   
    casper.then(function(){
        // The table in the "div#dvTable" is always here but not always used
        // If Transactions are in "table mode" we have at least one line
        // XPath selector not working here !
        if (casper.exists("div#dvTable table tr")){
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
                casper.exit();
            } else {
                // Our last item isn't empty so it should contain a Transaction ID :
                var lastTransaction = jsonArray[jsonArray.length-1]['Transaction'];
                // We open the next page "manually" because the "Next" button is fake
                casper.thenOpen(baseURL+'?start='+lastTransaction);
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
                // We capture both sides around the amount because some currencies are on the left, some on the right
                var matchArray = amount.match(/([^0-9]*)(\d+)([^0-9]*)/);
                tmpJSON["Currency"] = (matchArray[1] != "") ? matchArray[1] : matchArray[3];
                // The amount is always the third element of the match and we put it in float
                tmpJSON[headerCells[i].textContent] = parseFloat(matchArray[2]);
            } else if (headerCells[i].textContent == "Transaction"){
                // We extract the transaction number and put it in int
                tmpJSON[headerCells[i].textContent] = parseInt(row.cells[i].textContent.match(/\d+/g)[0]);
            } else {
                tmpJSON[headerCells[i].textContent] = row.cells[i].textContent;
            }
        }
        return tmpJSON;
    });
}

// Starts Casper, then opens the provided url, callback to "browse" function
casper.start(baseURL, browse);

// Casper run
casper.run();
