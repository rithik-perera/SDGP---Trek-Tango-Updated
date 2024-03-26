const axios = require('axios');
const apiKey = process.env.apiKey;


const destinationOrderCurrLoc = async(req, res) => {
    try {
    
        const originLat = req.body.originLat; 
        const originLng = req.body.originLng; 
        var destinationList = req.body.destinationList; 
        const numberOfDestinations = destinationList.length;
        var firstDestination = destinationList[0];
    
        for(let i = 1; i < numberOfDestinations; i++ ){
            let distanceOriginToFirstDestination = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=
                                                     ${originLat},${originLng}&destinations=place_id:${firstDestination.place_id}&key=${apiKey}`);
    
            let distanceOriginToOtherDestination = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=
                                                     ${originLat},${originLng}&destinations=place_id:${destinationList[i].place_id}&key=${apiKey}`);
    
            if (distanceOriginToFirstDestination.data.rows[0].elements[0].distance.value > distanceOriginToOtherDestination.data.rows[0].elements[0].distance.value){
              firstDestination = destinationList[i];
            }
            
        }
        
      
        destinationList.splice((destinationList.indexOf(firstDestination)),1);
    
        
        
        for(let j = 0; j < destinationList.length; j++){
          for(let k = 1; k < destinationList.length; k++){
            let distanceFirstToDestination1 = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:${firstDestination.place_id}&destinations=place_id:${destinationList[j].place_id}&key=${apiKey}`);
            
            let distanceFirstToDestination2 = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:${firstDestination.place_id}&destinations=place_id:${destinationList[k].place_id}&key=${apiKey}`);  
                                                        
            if (distanceFirstToDestination1.data.rows[0].elements[0].distance.value > distanceFirstToDestination2.data.rows[0].elements[0].distance.value){
              let temp = destinationList[j];
              destinationList[j] = destinationList[k];
              destinationList[k] = temp;
            }
            
          }
                
        }
        destinationList.unshift(firstDestination);
        console.log("The places are ordered");
        res.json(destinationList);
        
    
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
}


const destinationOrderListPlace = async(req, res) => {
    try {
        var destinationList = req.body.destinationList; //List of Place IDs of destinations
        var firstDestinationPlaceId = destinationList[0].place_id;
    
            
        for(let j = 1; j < destinationList.length; j++){
          for(let k = 2; k < destinationList.length; k++){
            let distanceFirstToDestination1 = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:${firstDestinationPlaceId}&destinations=place_id:${destinationList[j].place_id}&key=${apiKey}`);
            
            let distanceFirstToDestination2 = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=place_id:${firstDestinationPlaceId}&destinations=place_id:${destinationList[k].place_id}&key=${apiKey}`);  
                                                        
            if (distanceFirstToDestination1.data.rows[0].elements[0].distance.value > distanceFirstToDestination2.data.rows[0].elements[0].distance.value){
              let temp = destinationList[j];
              destinationList[j] = destinationList[k];
              destinationList[k] = temp;
            }
            
          }
                
        }
        console.log("Places are ordered");
        res.json(destinationList);
        
    
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
}

module.exports = {destinationOrderCurrLoc, destinationOrderListPlace};
