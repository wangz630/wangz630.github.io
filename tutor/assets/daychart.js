fetch('assets/hourofday.json')
  .then(response => response.json())
//   .then(console.log(response))
    // pass the data to the function!
    .then(data => playWithData(data))


// QUERY, MANIPULATE, VISUALIZE THE DATASET
const playWithData = data => {
    
    console.log(data);
    // how many per hour?
    const data1 = parseInt(data.hourofday[0].number.replace(',', '')); 
    const data2 = parseInt(data.hourofday[1].number.replace(',', ''));
    const data3 = parseInt(data.hourofday[2].number.replace(',', ''));
    const data4 = parseInt(data.hourofday[3].number.replace(',', ''));
    const data5 = parseInt(data.hourofday[4].number.replace(',', ''));
    const data6 = parseInt(data.hourofday[5].number.replace(',', ''));
    const data7 = parseInt(data.hourofday[6].number.replace(',', ''));
    const data8 = parseInt(data.hourofday[7].number.replace(',', ''));
    const data9 = parseInt(data.hourofday[8].number.replace(',', ''));
    const data10 = parseInt(data.hourofday[9].number.replace(',', ''));
    const data11 = parseInt(data.hourofday[10].number.replace(',', ''));
    const data12 = parseInt(data.hourofday[11].number.replace(',', ''));
	  const data13 = parseInt(data.hourofday[12].number.replace(',', '')); 
    const data14 = parseInt(data.hourofday[13].number.replace(',', ''));
    const data15 = parseInt(data.hourofday[14].number.replace(',', ''));
    const data16 = parseInt(data.hourofday[15].number.replace(',', ''));
    const data17 = parseInt(data.hourofday[16].number.replace(',', ''));
    const data18 = parseInt(data.hourofday[17].number.replace(',', ''));
    const data19 = parseInt(data.hourofday[18].number.replace(',', ''));
    const data20 = parseInt(data.hourofday[19].number.replace(',', ''));
    const data21 = parseInt(data.hourofday[20].number.replace(',', ''));
    const data22 = parseInt(data.hourofday[21].number.replace(',', ''));
    const data23 = parseInt(data.hourofday[22].number.replace(',', ''));
    const data24 = parseInt(data.hourofday[23].number.replace(',', ''));

    const dataLabels = ['data1','data2','data3','data4','data5','data6','data7','data8','data9','data10','data11','data12','data13','data14','data15','data16','data17','data18','data19','data20','data21','data22','data23','data24'];
    const dataValues = [data1,data2,data3,data4,data5,data6,data7,data8,data9,data10,data11,data12,data13.data14,data15,data16,data17,data18,data19,data20,data21,data22,data23,data24];


    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
			labels: ['12','1', '2', '3', '4', '5', '6', '7', '8','9','10','11','12','1', '2', '3', '4', '5', '6', '7', '8','9','10','11',],
          datasets: [
            {
              label: '# of Complaints by Hour',
              data: [data1,data2,data3,data4,data5,data6,data7,data8,data9,data10,data11,data12,data13,data14,data15,data16,data17,data18,data19,data20,data21,data22,data23,data24],
			  borderColor: '#000000',
			  backgroundColor: ['rgb(255, 255, 255)'],
			  borderWidth: 2
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 250 // set the maximum value for the y-axis scale
            }
          }
        }
      });
      

}