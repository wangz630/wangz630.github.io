// Function to render your items
const renderItems = (collection) => {
	// The `ul` where the items will be inserted
	const collectionList = document.getElementById('collection')


	// Loop through each item in the collection array
	collection.forEach(item => {
		const listItem = document.createElement('li') // Make the `li`

		// listItem.style.gridRow = `span ${item.rows}`


		const itemImage = document.createElement('img') // And an image
		itemImage.src = item.image // Set the `src` attribute from the JSON
		listItem.appendChild(itemImage) // And add that too

				// // You can make each element inside of that…
				// const itemTitle = document.createElement('h2') // Make an `h2`
				// itemTitle.innerHTML = item.title // Put the JSON title inside
				// listItem.appendChild(itemTitle) // And add it to the `li`!
		listItem.id = item.id;

		// This can get annoying, so we can use “template literals” instead
		const itemDetails =
			`
			<div class="words">
			<div id="jsontitle"><p><em>${item.type}<em></p> </div>
			<div id="year"><p><em>${item.number}</em></p> </div>
			</div>
			
			`
		listItem.insertAdjacentHTML('beforeend', itemDetails) // Which can we then insert

		// You can build logic from your data, too
		if (!item.alsoWriter) { // If this is `false`
			listItem.classList.add('faded') // Add this class to the whole `li`
		}

		collectionList.appendChild(listItem) // Then add the whole `li` into the `ul`
	})
}

// add an event listener to add list items for when they are clicked
// when it is clicked, look up the stickernumber in the json file
// filter the json file for that exact number
// create an html string with that number/item's properties (whatever you want to go in the lightbox)
// insert it into the document
// const creatLightbox = listItem => {
// 	// listItem is what you click on
// 	// do stuff with listItem variable
// }


// Fetch gets your JSON file…
fetch('assets/complaints.json')
	.then(response => response.json())
	.then(collection => {
		// And passes the data to the function, above!
		renderItems(collection) // or reverse for In reverse order
	})