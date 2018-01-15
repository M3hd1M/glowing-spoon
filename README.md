# glowing-spoon

This script is an answer to Bankin's Engineering Challenge (https://blog.bankin.com/challenge-engineering-web-scrapping-dc5839543117).

It **only** uses [CasperJS](https://github.com/casperjs/casperjs) + [PhantomJS](https://github.com/ariya/phantomjs/) :ghost:.

To run the script (assuming you already have casperjs+phantomjs installed) :

`casperjs mmbcews.js [--url=https://web.bankin.com/challenge/index.html] [--outputFile=result.json] [--start=0] [--follow]`

You can use the following optionnal arguments :

- **url** : URL to scrape (default https://web.bankin.com/challenge/index.html, target URL should have the same behaviour/layout of course)
- **outputFile** : If you want the JSON in a file (default outputs to the console)
- **start** : If you want to begin the process at a specific transaction (defaults to 0)
- **follow** : If you **REALLY** want to use the fake "Next" link...


The script will scrape the url argument and print (or save) a json with the following format :
```
[{"Account":"Checking","Amount":73,"Currency":"€","Transaction":1},
...
{"Account":"Checking","Amount":54,"Currency":"€","Transaction":2}]
```

## Note

We are asked to retrieve ***EVERY available*** transaction. 

- Does this mean we have to follow the fake "Next" button even if it's skipping some (every :satisfied:) transactions ? 
- Does this mean we have to retrieve transactions with a negative ID which are not directly available ?

Since I'm a helpful guy, my script has arguments that will let you choose what you want... If you want negative transactions, just pass a negative value to the *start* argument... If you want to follow the fake "Next" link instead of using the transaction number, use the *follow* argument !


I Hope you will like my work and get this iPhone X :iphone:

### Author 
**Mehdi M** (https://twitter.com/MehdiMasrour)
