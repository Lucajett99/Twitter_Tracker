import os
import json

def geolocalized(dict):
    try:
        if dict['place'] != None:
            return 1
        else: return 0
    except Exception:
        return 0

def hasImage(dict):
    try:
        if dict['extended_entities'] != None:
            return 1
        else: return 0
    except Exception:
        return 0  

def count(jsonFile):
    geolocalizedTweets = 0
    tweetWhitImage = 0
    with open("sample/{}".format(jsonFile), 'r') as f:
      t = f.read()
    tweets = json.loads(t)
    for tweet in tweets:
        geolocalizedTweets += geolocalized(tweet)
        tweetWhitImage += hasImage(tweet)
    print("Totale Tweets : ", len(tweets))
    print("Tweets Geolocalizzati : ", geolocalizedTweets)
    print("Tweet con immagini", tweetWhitImage)
    print(" ")
    return [len(tweets),geolocalizedTweets,tweetWhitImage]

if __name__ == '__main__':
    countedTotale = 0
    geolocalizedTotale = 0
    tweetWhitImageTotale = 0
    for file in os.listdir("sample"):
        print(file)
        counted,geo, image = count(file)
        countedTotale = countedTotale + counted
        geolocalizedTotale = geolocalizedTotale + geo
        tweetWhitImageTotale += image
    print("Totale Tweet nella cartella Sample: ", countedTotale)
    print("Totale Tweet geolocalizzati nella cartella Sample: ", geolocalizedTotale)
    print("Totale Tweet Con immagini nella cartella Sample:", tweetWhitImageTotale)