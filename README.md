# glowing-spoon

This script is an answer to Bankin's Engineering Challenge (https://blog.bankin.com/challenge-engineering-web-scrapping-dc5839543117).

It **only** uses [CasperJS](https://github.com/casperjs/casperjs) + [PhantomJS](https://github.com/ariya/phantomjs/) :ghost:.
(Tested with casperjs-1.1.0 + phantomjs-2.1.1)

To run the script (assuming you already have casperjs+phantomjs installed) :

`casperjs mmbcews.js [--url=https://web.bankin.com/challenge/index.html] [--outputFile=result.json] [--start=0] [--follow] [--groupByAccount] [--unit]`

You can use the following optionnal arguments :

- **url** : URL to scrape (default https://web.bankin.com/challenge/index.html, target URL should have the same behaviour/layout of course)
- **outputFile** : If you want the JSON in a file (default outputs to the console)
- **start** : If you want to begin the process at a specific transaction (default 0)
- **follow** : If you **REALLY** want to use the fake "Next" link... (default not following)
- **groupByAccount** : If you want a nice JSON with transactions grouped by Account type  (default not grouped)
- **unit** : If you only want to scrap one page, not following, not browsing


The script will scrape the url argument and print (or save) a json with the following format :
```
[{
		"Account": "Checking",
		"Amount": 73,
		"Currency": "€",
		"Id": 1
	},
	{
		"Account": "Checking",
		"Amount": 54,
		"Currency": "€",
		"Id": 2
	}
]
```

or the following format if you use the **--groupByAccount** argument :
```
{
	"Accounts": [{
		"Type": "Checking",
		"Transactions": [{
			"Amount": 73,
			"Currency": "€",
			"Id": 1
		}, {
			"Amount": 54,
			"Currency": "€",
			"Id": 2
		}]
	}, {
		"Type": "Savings",
		"Transactions": [{
			"Amount": 122,
			"Currency": "€",
			"Id": 450
		}, {
			"Amount": 37,
			"Currency": "€",
			"Id": 451
		}]
	}]
}
```
Please check Note #2 if you want to run multiple threads of my script.

## Note

We are asked to retrieve ***EVERY available*** transaction. 

- Does this mean we have to follow the fake "Next" button even if it's skipping some (every :satisfied:) transactions ? 
- Does this mean we have to retrieve transactions with a negative ID which are not directly available and infinite because of the generation script ? Example below (and you can put **any** negative value in the url...)

![Example of negative transactions](https://i.imgur.com/yx5648A.png)

Since I'm a helpful guy, my script has arguments that will let you choose what you want... If you want negative transactions, just pass a negative value to the *start* argument... If you want to follow the fake "Next" link instead of using the transaction number, use the *follow* argument !


## Note #2

Parallelism...

You may ask why I didn't implement any parallelism/thread mechanic on the script when half the notation is based on speed ?

The answer is simple : Quality > Speed

Some people may think that multiple threads is a good idea to get results faster but in our case, the start argument in the URL is a transaction number, not a page number. How can you guess which is the first un-retrieved transaction if you haven't parsed the current page yet :question: Also, if you want to use multiple threads, this means you know how many transactions each page is going to give you (and you hardcode the famous 50 :sweat_smile:).

Another thing is that this example is pretty simple because we can imagine we are browsing transactions from a single account and every transaction id follow each other. What if they didn't and you browse blindly each page only incrementing by 50 the start argument ? Well you will have a lot of duplicates and a lot of pages browsed for nothing !

That's why at first I didn't want to implement any parallelism mechanic.
Anyway, as I am really a nice guy (and I really want to have R. calling me again but on my brand new iPhone X this time...) I will again give you the choice to use threads if you really want to.

You will find in the src folder a python script `wrapper.py`

This script is only a wrapper to run casperjs with the number of threads you want !

Run it this way :

`python wrapper.py -t10 -s50 -ccasperjs -xmmbcews.js [-oresult.json]`

**-tX** : Number of threads to run (example 10)
**-sY** : Number of transaction by page (example 50)
**-cCASPERJS** : Full path to casperjs executable (casperjs if it's in your path)
**-xSCRIPT** : Full path to my awesome script (mmbcews.js)
**-oOUTPUTFILE** : If you want the result json written in a file

---

I Hope you will like my work and get this iPhone X :iphone:

### Author 
**Mehdi M** (https://twitter.com/MehdiMasrour)
