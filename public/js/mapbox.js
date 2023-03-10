
export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hyZXlhc2gyNTAzIiwiYSI6ImNsZXRwanBjZzA2bnQzeG1rZWxsM2ozenYifQ.muMExorqWtNGdcuDaVoGEA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shreyash2503/cletveyv400e101p57schopd1',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Add marker
        const el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom' // => bottom of the pin at the given point
        }).setLngLat(loc.coordinates).addTo(map);
        new mapboxgl.Popup({
            offset: 30

        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map)
        bounds.extend(loc.coordinates);

    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });


}




