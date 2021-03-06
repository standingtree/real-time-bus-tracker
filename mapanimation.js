// get elements from the DOM

body = document.body
const bostonLngLat = [-71.10110, 42.35173]
let timer
let locationData
let currentMarkers = []


let makeOrderedList = (items) => {
  // create an ordered list and add as a child node to the body
  div = document.createElement('div')
  ol = document.createElement('ol')

  items.forEach((item, index) => {
    // create a DOM object for the content
    li = document.createElement('li')
    a = document.createElement('a')
    a.href = item
    content = document.createTextNode(item.toString())
    a.appendChild(content)
    li.appendChild(a)
    ol.appendChild(li)

  })

  body.appendChild(ol)

}

async function run(){
  // clear the current markers if any
  currentMarkers.forEach((marker) => {
    marker.remove();
  })


  // update the button state to on
  const runButton = document.getElementById("run");
  runButton.classList.add('on')

  // update the pause button state to on
  const pauseButton = document.getElementById("pause");
  pauseButton.classList.remove('on')

  // clear the console
  console.clear();

  // get the location data
  locationData = await getBusLocationData();
  console.log(new Date());
  console.log(locationData);

  // create the geoJSON object
  var geojson = {
    type: 'FeatureCollection',
    features: [],
  };

  // add the bus information to the geoJSON features
  for (const busIndex in locationData) {
    bus = locationData[busIndex].attributes
    lngLat = [bus.longitude, bus.latitude];

    _feature = {
      "type": 'Feature',
      "geometry": {
        "type": 'Point',
        "coordinates": lngLat,
      },
      "properties": {
        "title": bus.label,
        "description": " // Current Stop: "+bus.current_stop_sequence+" // Occupancy: "+bus.occupancy_status
      }
    }
    geojson.features.push(_feature);
  }

  console.log(geojson.features);

  // active bus info
  let activeBuses = []

  // add markers to map
  geojson.features.forEach((marker) => {
    // create a HTML element for each feature
    var el = document.createElement('div');
    el.className = 'marker';

    // make a pop-up for bus label
    let popup = new mapboxgl.Popup({closeOnClick: false})
        .setText(marker.properties.title)
        .addTo(map);

    // make a marker for each feature and add to the map
    let thisMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.geometry.coordinates)
        .addTo(map)
        .setPopup(popup);

    currentMarkers.push(thisMarker);
    activeBuses.push(marker.properties.title+marker.properties.description)

  });

  // update the bus info box
  const infobox = document.getElementById("infobox");

  html = '<h3>Currently Active Buses: '+activeBuses.length+'</h3>'
  activeBuses.forEach((bus) => {
    html += '<li>' + bus + '</li>'
  })

  html += '</ul>'

  infobox.innerHTML = html

  // timer
  timer = setTimeout(run, 10000);
}


async function pause(){
  // remove the run button state
  const runButton = document.getElementById("run");
  runButton.classList.remove('on')

  // update the pause button state to on
  const pauseButton = document.getElementById("pause");
  pauseButton.classList.add('on')

  console.log("Updates paused.")
  clearTimeout(timer);
}

async function getBusLocationData(){
  // // reach out to MBTA with URL for bus data for route 1
  const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';

  const response = await fetch(url);
  const json = await response.json();
  return json.data;

}





