fetch("./ferrydata.json")
.then(function (response) {
  return response.json();
})
.then( data => {
    const images = data.img;
    displayImages(images, 'all');

    const filterButtons = document.querySelector('.filters');

    filterButtons.forEach(button =>{
        button.addEventListener('click', () =>{
            // const filter = button.da
            displayImages(item, filter);
        });
    })
})


function displayImages(item, filter){
    const filteredImages = filter === 'all' ? images : images.filter(image => image.category === filter);

    const imageContainer = document.querySelector('.showItem');
    imageContainer.innerHTML = '';

    filteredImages.forEach( item => {
        const imgElement = document.createElement('img');
        imgElement.src = item.img;
        imageContainer.appendChild(imgElement);

    })
}



