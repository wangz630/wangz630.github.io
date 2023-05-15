// HOW TO FETCH DATA ACROSS THE WEB
// const url = 'https://data.cityofnewyork.us/resource/vfnx-vebw.json?$limit=50000';
// noise data link = https://data.cityofnewyork.us/resource/be8n-q3nj.json?$limit=50000

fetch('assets/year.json')
  .then(response => response.json())
//   .then(console.log(response))
	// pass the data to the function!
	.then(data => playWithData(data))


// QUERY, MANIPULATE, VISUALIZE THE DATASET
const playWithData = data => {
	

	console.log(data);
	// how many instances were QUAA-ING?
	const data1 = parseInt(data.year[0].number.replace(',', '')); 
	const data2 = parseInt(data.year[1].number.replace(',', ''));
	const data3 = parseInt(data.year[2].number.replace(',', ''));
	const data4 = parseInt(data.year[3].number.replace(',', ''));
	const data5 = parseInt(data.year[4].number.replace(',', ''));
	const data6 = parseInt(data.year[5].number.replace(',', ''));
	const data7 = parseInt(data.year[6].number.replace(',', ''));
	const data8 = parseInt(data.year[7].number.replace(',', ''));
	const data9 = parseInt(data.year[8].number.replace(',', ''));
	const data10 = parseInt(data.year[9].number.replace(',', ''));
	const data11 = parseInt(data.year[10].number.replace(',', ''));
	const data12 = parseInt(data.year[11].number.replace(',', ''));


	
	

	const dataLabels = ['data1', 'data2','data3','data4','data5','data6','data7','data8','data9','data10','data11','data12'];
	const dataValues = [data1, data2,data3,data4,data5,data6,data7,data8,data9,data10,data11,data12,];


	const ctx = document.getElementById('myChart');
	new Chart(ctx, {
		type: 'line',
		data: {
		  labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
		  datasets: [
			{
			  label: '# of Noise Complaints',
			  data: [data1, data2,data3,data4,data5,data6,data7,data8,data9,data10,data11,data12,],
			  borderColor: '#000000',
			  backgroundColor: ['rgb(255, 255, 255)'],
			  borderWidth: 3
			}
		  ]
		},
		options: {
		  scales: {
			y: {
			  beginAtZero: true,
			  suggestedMax: 50000 // set the maximum value for the y-axis scale
			}
		  }
		}
	  });
	  

}




  