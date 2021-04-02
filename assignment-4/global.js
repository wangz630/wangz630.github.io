console.log("airtable practice");

//load airtable lib

var Airtable = require('airtable');
console.log(Airtable);

//connect to airtable database using apiKey

var base = new Airtable({apiKey: 'keyLDUimLxPjXCkcF'}).base('appO9cOXG6u4fhh5n');
//get the "Music" table from the base
base('Music').select({
    // Selecting the first 3 records in Grid view:
    maxRecords: 3,
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        console.log( record.get('album_title'));
        console.log( record.get('album_artwork'));
        console.log( record.get('artist'));
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});

// Extra 

base('Music').select({
    maxRecords: 3,
    view: "Grid view"
}).eachPage(gotPageOfRecords, gotAllRecords);

const albums = [];

function gotPageOfRecords(records, fetchNextPage) {
    // console.log("gotPageOfRecords");
    albums.push(...records);
    fetchNextPage();
}

function gotAllRecords(err) {
    // console.log("gotAllRecords");
    if(err) {
        console.log("error loading music");
        console.error(err);
        return;
    }
    

    consoleLogRecords();
    showData();
}

function consoleLogRecords() {
    // console.log("consoleLogRecords()");
    albums.forEach((album) => {
        console.log("music:", album);
    }

    );
}

function showData() {
    // console.log("showData()");
    albums.forEach((album) => {
        var albumContainer = document.createElement("div");
        albumContainer.classList.add("album-container");
        document.querySelector(".container").append(albumContainer);

        var title = document.createElement('h2');
        title.innerText = album.fields.album_title;
        albumContainer.appendChild(title);

        var artist = document.createElement('p');
        artist.innerText = album.fields.artist;
        albumContainer.appendChild(artist);

        var image = document.createElement('img');
        image.src = album.fields.album_artwork[0].url;
        albumContainer.append(image);
    });

}


