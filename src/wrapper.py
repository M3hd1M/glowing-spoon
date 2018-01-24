#!/usr/bin/python
#####################################################################################
# Python wrapper for Bankin Challenge Engineering : Web Scrapping                   #
# Allows to run the main casperJS script in parallel                                #
#                                                                                   #
# Author : Mehdi MASROUR (mehdi@masrour.fr)                                         #
#                                                                                   #
# Usage :                                                                           #
#                                                                                   #
# python wrapper.py -t10 -s50 -ccasperjs -xmmbcews.js [-oresult.json]               #
#                                                                                   #
# -t10 : Number of threads                                                          #
# -s50 : Number of transaction by page                                              #
# -ccasperjs : Full path to casperjs executable                                     #
# -xmmbcews.js : Full path to my awesome script                                     #
# -oresult.json : If you want the result json written in a file                     #
#                                                                                   #
#                                                                                   #
# Github Repo : https://github.com/M3hd1M/glowing-spoon                             #
#                                                                                   #
#####################################################################################

from threading import Thread, RLock, current_thread
from subprocess import check_output, CalledProcessError
import json, sys, getopt, traceback


# Global variables
threadList = []
jsonResult = []
casperEx = "casperjs"
scriptEx = "mmbcews.js"
outputFile = None
threads = 0
steps = 0
rounds = 0
found = False
# Concurrency
lock = RLock()


# Threading class
class ScrapRunner(Thread):

    def __init__(self, startIdx):
        Thread.__init__(self)
        self.startIdx = startIdx

    def run(self):
        global jsonResult, lock, found, casperEx, scriptEx
        tmpJson = []
        output = ""
        try:
            output = check_output([casperEx, scriptEx, "--start="+str(self.startIdx), "--unit"]).decode("utf-8")
            # The returned json is always on one line
            output = output.split("\n")[0].strip()
            tmpJson = json.loads(output)
        except CalledProcessError as e:
            # If the casperjs script did not find any transaction 
            # it will exit with a special code (99)
            if e.returncode == 99:
                found = True
            else:
                print(e.output)
        except:
            print(traceback.format_exc())
        finally:
            with lock:
                # Append returned json to global
                jsonResult = jsonResult + tmpJson


# Command line arguments parsing                
arguments, junk = getopt.getopt(sys.argv[1:],"t:s:c:x:o:",["threads=", "steps=", "casper=","script=","outputFile="])                

for opt, arg in arguments:
    if opt in ("--threads","-t"):
        threads = int(arg)
    if opt in ("--steps","-s"):
        steps = int(arg)
    if opt in ("--casper","-c"):
        casperEx = arg
    if opt in ("--script","-x"):
        scriptEx = arg
    if opt in ("--outputFile","-o"):
        outputFile = arg        

# While casperjs found transactions
while not found:
    for i in range(0, int(threads)):
        start = (steps*i)+(rounds*steps*threads) # Simple maths :)
        myThread = ScrapRunner(start)
        myThread.start()
        threadList.append(myThread)
    for myThread in threadList:
        myThread.join()
    del threadList[:]
    rounds = rounds+1

# Since we are in parallel, we need to sort the transactions by Id
# Ensure ascii is false to get the Euro symbol
if outputFile:
    with open(outputFile,'w') as f:
        f.write(json.dumps(sorted(jsonResult, key=lambda j: j['Id']), ensure_ascii=False).encode("utf-8"))
else:
    print(json.dumps(sorted(jsonResult, key=lambda j: j['Id']), ensure_ascii=False))
