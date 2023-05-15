

//first, get all the elements we need from html

//container: hold all restaurant data we got from API
const container = document.querySelector("#container");
//three filter button
let uptownButton = document.querySelector("#uptownButton");
let midtownButton = document.querySelector("#midtownButton");
let downtownButton = document.querySelector("#downtownButton");

//declaring new variables and assigning them the value of the string <ol>, which stands for "ordered list" in html; good to have that! easier for us to do the formatting
let restaurantsList = "<ol>";
let uptownList = "<ol>";
let midtownList = "<ol>";
let downtownList = "<ol>";

// Construct the URL that we need to make requests
//Awesome! Just noticed that this link has already narrowed our dataset down to only Manhattan section;))
const url = `https://data.cityofnewyork.us/resource/43nn-pn8j.json?$query=SELECT%0A%20%20%60camis%60%2C%0A%20%20%60dba%60%2C%0A%20%20%60boro%60%2C%0A%20%20%60building%60%2C%0A%20%20%60street%60%2C%0A%20%20%60zipcode%60%2C%0A%20%20%60phone%60%2C%0A%20%20%60cuisine_description%60%2C%0A%20%20%60inspection_date%60%2C%0A%20%20%60action%60%2C%0A%20%20%60violation_code%60%2C%0A%20%20%60violation_description%60%2C%0A%20%20%60critical_flag%60%2C%0A%20%20%60score%60%2C%0A%20%20%60grade%60%2C%0A%20%20%60grade_date%60%2C%0A%20%20%60record_date%60%2C%0A%20%20%60inspection_type%60%2C%0A%20%20%60latitude%60%2C%0A%20%20%60longitude%60%2C%0A%20%20%60community_board%60%2C%0A%20%20%60council_district%60%2C%0A%20%20%60census_tract%60%2C%0A%20%20%60bin%60%2C%0A%20%20%60bbl%60%2C%0A%20%20%60nta%60%2C%0A%20%20%60location_point1%60%2C%0A%20%20%60%3A%40computed_region_efsh_h5xi%60%2C%0A%20%20%60%3A%40computed_region_f5dn_yrer%60%2C%0A%20%20%60%3A%40computed_region_yeji_bk3q%60%2C%0A%20%20%60%3A%40computed_region_92fq_4b7q%60%2C%0A%20%20%60%3A%40computed_region_sbqj_enih%60%0AWHERE%0A%20%20(%60boro%60%20%3D%20%22Manhattan%22)%0A%20%20AND%20((%60cuisine_description%60%20%3D%20%22Japanese%22)%20AND%20(%60grade%60%20%3D%20%22A%22))`;

//check if the link is working
console.log(`Fetching url - ${url}`);

//create an array for each category(uptown, midtown, downtown), and then just do some manual jobs to input all zipcode we need between brackets. Great we can avoid using Airtable!
let uptownZip = ["10034","10040","10033","10032","10031","10039","10030","10115","10027","10026","10037","10025","10024","10023","10069","10029"];

let midtownZip = ["10011","10010","10016","10001","10119","10199","10018","10036","10017","10022","10103","10036","10112","10111","10152","10154","10171","10172","10169","10173","10110","10165","10174","10170","10168"];

let downtownZip = ["10014","10003","10009","10012","10013","10282","10278","10279","10038","10271","10006","10005","10280"];


//Fetch API and get all data
fetch(url)
  .then(response => response.json())
  .then(restaurants => {
    //console.log to see if we successfully get all data or not
    console.log(restaurants);

    //NOTE: if you don't want to limit the number of restaurants showing on your page, just ignore and delete the following two lines!(const filteredRestaurants = restaurants.slice(0, 100); & console.log(filteredRestaurants) )

    //Filtered data -> only pull first 0 - 100 data from the whole database. you can change the number here to whatever you want! ex. if you want restaurants number 100 - 500 in the list to show on your page, simply write "(100,500)"
    const filteredRestaurants = restaurants.slice(0, 100);
    //check again
    console.log(filteredRestaurants);

    //ALL DATA

    //when others first enter the page without choosing any uptown/downtown categories, we show all Manhattan restaurants we had on page, 
    //again, if you do not want to use filtered data, simply replace "filteredRestaurants" with "restaurants", then it'll show you all data
     // ""=>" is a shorthand way of writing function(){}
    filteredRestaurants.forEach((restaurant) => {
      //adding values to variable " restaurantsList", <ol>; what we get here is a pretty long string but would not show on anywhere
      restaurantsList += `<div class="box" class="allRestaurant"><p>${restaurant.zipcode}</p><p>${restaurant.dba}</p><p>${restaurant.street}</p><p>${restaurant.grade}</p></div>`;
    })
    //Show data:now we can add content to html. After this line executes, the container element will contain the restaurant list HTML code we wrote above, which will be rendered as a list of restaurants in the browser.
    container.innerHTML = restaurantsList;
   
    
    //ONLY UPTOWN RESTAURANT DATA

    //adds a click event listener to the uptownButton element, so that when the button is clicked, the showUptownRestaurant function is called.
    uptownButton.addEventListener("click", showUptownRestaurant);

    //function "showUptownRestaurant"
    function showUptownRestaurant(){
      //remove previous content inside container, set innerHTML blank 
      container.innerHTML = "";
      //for loop: go through each zipcode we wrote in uptownZip array and see if it matched with any data in our API database
      for(let i=0;i<uptownZip.length;i++){
        //go through each filtered restaurant data
        filteredRestaurants.forEach(function(restaurant) {
        //if its zipcode in API the same as one of the zipcode we type in uptownZip array, then pull all the information of that restaurant
         if (restaurant.zipcode === uptownZip[i]){
           uptownList += `<div class="box" class="uptownRestaurant"><p>${restaurant.zipcode}</p><p>${restaurant.dba}</p><p>${restaurant.street}</p><p>${restaurant.grade}</p></div>`;
         }

       
       });
       //finally, add "uptownList", a string of long list of restaurants we filtered out in the matching process, to html
       container.innerHTML = uptownList;
     }

    };


      //ONLY MIDTOWN RESTAURANT DATA

     //repeate the code we had for uptown and replace all "uptown" elements to "midtown"
     midtownButton.addEventListener("click", showMidtownRestaurant);

     function showMidtownRestaurant(){

       container.innerHTML = "";

       for(let i=0;i<midtownZip.length;i++){
 
         filteredRestaurants.forEach(function(restaurant) {
  
          if (restaurant.zipcode === midtownZip[i]){
            midtownList += `<div class="box" class="midtownRestaurant"><p>${restaurant.zipcode}</p><p>${restaurant.dba}</p><p>${restaurant.street}</p><p>${restaurant.grade}</p></div>`;
          }
 
        
        });
        container.innerHTML = midtownList;
      }
 
     };

    
     //ONLY MIDTOWN RESTAURANT DATA

     //repeate and replace
    downtownButton.addEventListener("click", showDowntownRestaurant);

    function showDowntownRestaurant(){
      container.innerHTML = "";
      for(let i=0;i<downtownZip.length;i++){

        filteredRestaurants.forEach(function(restaurant) {
 
         if (restaurant.zipcode === downtownZip[i]){
           downtownList += `<div class="box" class="downtownRestaurant"><p>${restaurant.zipcode}</p><p>${restaurant.dba}</p><p>${restaurant.street}</p><p>${restaurant.grade}</p></div>`;
         }

       
       });
       container.innerHTML = downtownList;
     }

    };
    





    })
      








