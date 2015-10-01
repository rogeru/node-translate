// Translate english post to german. Send translated reply.
// Use Bunyan logger to send SDK logs to file. View: tail -f sdk.log | ./node_modules/.bin/bunyan
// Use unirest HTTP wrapper for easier query
// Example translate request: http://mymemory.translated.net/api/get?q=good%20afternoon&langpair=en|de

var Circuit = require('circuit');
var Logger = require('bunyan');
var unirest = require('unirest');

Circuit.setLogger(new Logger({
    name: 'sdk',
    streams: [{
        level: 'info',
        path: './sdk.log'
    }]
}));

var client = new Circuit.Client();

client.logon('<your Circuit email>', '<your password>').then(function (user) {
    console.log('logged on as ' + user.displayName);
    
    client.addEventListener('itemAdded', function (evt) {
        translateItem(evt.item);            
    });
});

function translateItem(item) {
    if (!item || !item.text || !item.text.content || item.parentItemId) {
        return;
    }
    var english = item.text.content;

    unirest.post('http://mymemory.translated.net/api/get')
    .query('q=' + encodeURIComponent(english))
    .query('langpair=en|de')
    .end(function (response) {
        var german = response.body.responseData.translatedText;
        console.log('english: ' + english + ', german: ' + german);
        client.addTextItem(item.convId, {parentId: item.itemId, content: german});
    });
}