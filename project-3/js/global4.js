console.log("airtable practice");

//load airtable lib

var Airtable = require('airtable');
var base = new Airtable({apiKey: 'keyLDUimLxPjXCkcF'}).base('appqjTjKVd77BifP9');

base('World').select({
    // Selecting the first 3 records in Grid view:
    
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        console.log('Retrieved', record.get('Name'));
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});


// Extra 

base('World').select({}).eachPage(gotPageOfRecords, gotAllRecords);

const maps = [];

function gotPageOfRecords(records, fetchNextPage) {
    // console.log("gotPageOfRecords");
    maps.push(...records);
    fetchNextPage();
}

function gotAllRecords(err) {
    // console.log("gotAllRecords");
    if(err) {
        console.log("error loading maps");
        console.error(err);
        return;
    }
    

    consoleLogRecords();
    showData();
}

function consoleLogRecords() {
    // console.log("consoleLogRecords()");
    maps.forEach((map) => {
        console.log("map:", map);
    }

    );
}

function showData() {
    // console.log("showData()");
    maps.forEach((map) => {
        var mapContainer = document.createElement("div");
        mapContainer.classList.add("map-container");
        document.querySelector(".container").append(mapContainer);

        var location = document.createElement('h2');
        location.innerText = map.fields.Location;
        mapContainer.appendChild(location);

        var year = document.createElement('p');
        year.innerText = map.fields.Year;
        mapContainer.appendChild(year);

        var scale = document.createElement('p');
        scale.innerText = map.fields.Scale;
        mapContainer.appendChild(scale);

        var functions = document.createElement('p');
        functions.innerText = map.fields.Functions;
        mapContainer.appendChild(functions);

        var image = document.createElement('img');
        image.src = map.fields.Images[0].url;
        mapContainer.append(image);
    });

}


