// HOW TO FETCH DATA ACROSS THE WEB
const url = 'https://data.cityofnewyork.us/resource/be8n-q3nj.json?$limit=50000';
// noise data link = https://data.cityofnewyork.us/resource/be8n-q3nj.json?$limit=50000

fetch(url)
  .then(response => response.json())
	// pass the data to the function!
	.then(data => playWithData(data))


// QUERY, MANIPULATE, VISUALIZE THE DATASET
const playWithData = data => {

    	// get all of the dates
	// we reformat the date field within the dataset so that the Date() method can read it
	const created_date = data.map(item => {
		const date = (item.created_date).slice(0,10);
		const hour = (item.created_date)).slice(12,13);
        const minutes = (item.created_date)).slice(15,16;
        const seconds = (item.created_date)).slice(18,19);
		const formattedDate = `${date}/${hour}:${minutes}:{seconds}`;
		const date = new Date(formattedDate);
		return date;
	});
    

    // different sections
	console.log(data);
	// how many instances were QUAA-ING?
	const quaas = data.filter(item => item.quaas == true).length;
	const kuks = data.filter(item => item.kuks == true).length;
	const moans = data.filter(item => item.moans == true).length;
	const running = data.filter(item => item.running == true).length;
	const eating = data.filter(item => item.eating == true).length;
	const foraging = data.filter(item => item.foraging == true).length;
	const chasing = data.filter(item => item.chasing == true).length;
	const climbing = data.filter(item => item.climbing == true).length;

	const dataLabels = ['quaas', 'kuks', 'moans', 'running', 'eating', 'foraging', 'chasing', 'climbing'];
	const dataValues = [quaas, kuks, moans, running, eating, foraging, chasing, climbing];


	const ctx = document.getElementById('myChart');

	new Chart(ctx, {
	  type: 'bar',
	  data: {
		labels: ['quaas', 'kuks', 'moans', 'running', 'eating', 'foraging', 'chasing', 'climbing'],
		datasets: [
			{
				label: '# of Squirrels',
				data: [quaas, kuks, moans, running, eating, foraging, chasing, climbing],
				borderColor: '#000000',
				backgroundColor: ['rgb(255, 255, 255)'],
				borderWidth: 2
			}
		]
	  },
	  options: {
		scales: {
		  y: {
			beginAtZero: true
		  }
		}
	  }
	});

}