var Alexa = require('alexa-sdk');
var request = require('request-promise');
var moment = require('moment');
var bioFile = require('./bios');

var SKILL_NAME = 'nessie';

var APP_ID = 'amzn1.ask.skill.dacb1f33-9c68-461b-a5dd-14f2b3cf857a';

var SKILL_NAME = "nessie";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var getInfo = function () {
    var options = {
        uri: 'http://api.reimaginebanking.com/accounts/59381836a73e4942cdafd790?key=02447e7f8a31ba4c42dcad1e15fe3d06',
        json: true
    }
    var that = this;
    request(options)
    .then(function (response) {
        var accountName = response.nickname;
        var rewards = response.rewards;
        var balance = response.balance;
        spoken = "The account's nickname is " + accountName + " The account has " + rewards + " dollars in rewards and a balance of " + balance + " dollars.";
        that.emit(':tell', spoken);
    }).catch(function (error) {
        that.emit(':tell', "error");
    });
};

var getBills = function () {
    var options = {
        uri: 'http://api.reimaginebanking.com/accounts/59381836a73e4942cdafd790/bills?key=02447e7f8a31ba4c42dcad1e15fe3d06',
        json: true
    }
    var that = this;
    request(options)
    .then(function (response) {
        if (response.length == 0) {
            that.emit(':tell', "You have no upcoming bills. Good job.");
        } else {
            var date = response[0].payment_date;
            date = moment(date).format('MMMM Do');
            var amount = response[0].payment_amount;
            that.emit(':tell', "Your next bill is due on " + date + " and is of the amount " + amount + " dollars");
        }
    }).catch(function (error) {
        that.emit(':tell', error);
    });
}

var canAffordLamborghini = function () {
    var options = {
        uri: 'http://api.reimaginebanking.com/accounts/59381836a73e4942cdafd790?key=02447e7f8a31ba4c42dcad1e15fe3d06',
        json: true
    }
    var that = this;
    request(options)
    .then(function (response) {
        var balance = response.balance;
        if (balance < 150000.0) {
            balance = 150000 - balance;
            balance = balance.toString();
            spoken = "Sorry, but you are " + balance + " dollars short of affording a lamborghini gallardo";
            that.emit(':tell', spoken);
        } else {
            balance = balance.toString();
            that.emit(':tell', "Yes, you have a bank balance of " + balance + " so you can afford a lamborghini");
        }
    }).catch(function (error) {
        that.emit(':tell', error);
    });
}

var funFact = function () {
    var name = this.event.request.intent.slots.name.value;
    var pertinent = bioFile.bios.data.filter(function(data) {
        return data["First Name"] == name;
    });
    if (pertinent.length >= 1) {
        var funFact = pertinent[0]["Fun Fact"];
        this.emit(':tell', name + "'s interesting fact is quote " + funFact);
    } else {
        this.emit(':tell', "I couldn't find anyone with that name.");
    }
}

var university = function () {
    var name = this.event.request.intent.slots.name.value;
    var pertinent = bioFile.bios.data.filter(function(data) {
        return data["First Name"] == name;
    });
    if (pertinent.length >= 1) {
        var college = pertinent[0]["School"];
        this.emit(':tell', name + " attends " + college);
    } else {
        this.emit(':tell', "I couldn't find anyone with that name.");
    }
};

var handlers = {
    'accountInformation': getInfo,
    'upcomingBills': getBills,
    'canAffordLamborghini': canAffordLamborghini,
    'funFact': funFact,
    'university': university,
    'AMAZON.HelpIntent': function () {
        this.emit(':tell', "Nessie can give you information about Capital One customers.");
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Cancelling.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Stopping.");
    }
};