var bioFile = require('./bios');

var university = function (name) {
    var pertinent = bioFile.bios.data.filter(function(data) {
        return data["First Name"] == name;
    });
    if (pertinent.length >= 1) {
        var college = pertinent[0]["School"];
        console.log(':tell', name + " attends " + college);
    } else {
        console.log(':tell', "I couldn't find anyone with that name.");
    }
};

university("Kyle");