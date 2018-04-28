import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { GeoJSONSource } from 'mapbox-gl/dist/mapbox-gl';
import { DataService } from '../services/data.service';
import * as turf from '@turf/turf';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() teamData;
  // @Input() currentData;
  @Input() routeData;
  currentData: any;
  map: mapboxgl.Map;
  layer: mapboxgl.Layer;
  source: any;
  offices: any;
  plane: any;
  style = 'mapbox://styles/mapbox/light-v9';
  lat = 39.828404;
  lng = -98.579490;
  framesPerSecond = 30;
  multiplier = 1;
  opacity = .1;
  radius = 40;
  running = false;
  arc = [];
  lineDistance: number;
  mapLayers = { routes: { test: {}}};
  milequistData: any;
  bikes: any;

  constructor(private dataService: DataService) { }

  ngOnInit() {

    // initialize map
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 4,
      minZoom: 0,
      maxZoom: 19,
      center: [this.lng, this.lat]
    });


    // add nav controls
    const nav = new mapboxgl.NavigationControl();
    this.map.addControl(nav, 'top-left');

    // on map load, add the point layers
    this.map.on('load', layer => {

      this.map.addSource('cities', {type: 'geojson',
                                    data: {type: 'FeatureCollection', features: []} });

      // Add a source and layer displaying a point which will be animated in a circle.
      this.map.addSource('route', {type: 'geojson', data: {type: 'FeatureCollection', features: []} });

       // Add a source and layer displaying a point which will be animated in a circle.
       this.map.addSource('plane', {type: 'geojson', data: {type: 'FeatureCollection', features: []} });


      this.map.addLayer({
        id: 'route-layer',
        source: 'route',
        type: 'line',
        paint: {
            'line-width': 1,
            'line-color': 'grey',
            'line-dasharray': [10, 5]
        }
      });

      this.map.addLayer({
        id: 'office-layer',
        source: 'cities',
        type: 'symbol',
        layout: {
            'icon-image': 'marker-15',
            'text-field': '{title}',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-offset': [0, 0.6],
            'text-anchor': 'top',
        },
        'paint': {
          'icon-color': '#D22D7D'
        }
      });

      this.map.addLayer({
        id: 'bikes-layer',
        source: 'plane',
        type: 'circle',
        paint: {
          'circle-radius': 3,
          'circle-color': '#fcb400',
          'circle-opacity': 0.6,
          'circle-stroke-width': 0.2,
          'circle-stroke-color': '#fcb400',
          'circle-stroke-opacity': 0.6
        }
      });

      this.mapLayers.routes['office'] = {
        id: 'office' ,
        source: this.map.getSource('cities'),
        layer: this.map.getLayer('office-layer')
      };

      this.mapLayers.routes['route'] = {
        id: 'route' ,
        source: this.map.getSource('route'),
        layer: this.map.getLayer('route-layer')
      };

      this.mapLayers.routes['plane'] = {
        id: 'plane' ,
        source: this.map.getSource('plane'),
        layer: this.map.getLayer('point')
      };

    this.dataService.getOffices().subscribe((offices: Array<any>) => {
      this.mapLayers.routes['office']['source'].setData(offices);
    });

    this.dataService.getRoutes().subscribe((routes: Array<any>) => {
      this.routeData = routes;
      this.mapLayers.routes['route']['source'].setData(routes);
    });

    // this.dataService.getPlane().subscribe((plane: Array<any>) => {
    //   this.plane = plane;
    //   this.mapLayers.routes['plane']['source'].setData(plane);
    // });

    this.dataService.getCurrentData().subscribe((data: Array<any>) => {
      this.currentData = data;
      console.log('hello', this.currentData);
      this.getExtras();
      // this.mapLayers.routes['plane']['source'].setData(data);
    });

    console.log(this.routeData, this.currentData);


    this.routeData.features = this.routeData.features.map((d) => {
      d.properties.lineDistance = turf.lineDistance(d, { units : 'miles'});

      const arc = [];

      const steps = 100;

      for (let i = 0; i < d.properties.lineDistance; i += d.properties.lineDistance / steps) {
        const segment = turf.along(d, i, {units: 'miles'});
        arc.push(segment.geometry.coordinates);
      }

      d.geometry.coordinates = arc;

      return d;
    });



    // Calculate the distance in kilometers between route start/end point.
    // this.lineDistance = turf.lineDistance(this.routeData.features[0], { units : 'kilometers'});

    // const arc = [];

    // Draw an arc between the `origin` & `destination` of the two points
    // for (let i = 0; i < this.lineDistance; i++) {
    //     const segment = turf.along(this.routeData.features[0], i / 1000 * this.lineDistance, {units: 'kilometers'});
    //     arc.push(segment.geometry.coordinates);
    // }

    // Update the route with calculated arc coordinates
    // this.routeData.features[0].geometry.coordinates = arc;
    console.log('protein bar', this.routeData);
    this.mapLayers.routes['route']['source'].setData(this.routeData);

      // Used to increment the value of the point measurement against the route.
    const counter = 2000;

     // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    // console.log('loner boogie boy', this.plane)
    // this.plane.features[0].geometry.coordinates = this.routeData.features[0].geometry.coordinates[counter];

    // // Update the source with this new data.
    // this.mapLayers['plane']['source'].setData(this.plane);


    // Start the animation.
    // this.animate(counter);
    // this.getExtras();

    });



  }

  animate(counter) {
    // Update point geometry to a new position based on counter denoting
    // the index to access the arc.
    this.plane.features[0].geometry.coordinates = this.routeData.features[0].geometry.coordinates[counter];

    // Update the source with this new data.
    this.mapLayers['plane']['source'].setData(this.plane);

    // Request the next frame of animation so long as destination has not
    // been reached.
    if (this.plane.features[0].geometry.coordinates[0] !== -74.008235) {
        requestAnimationFrame(this.animate);
    }

    counter = counter + 1;

  }

  getExtras() {
      console.log('CHECKS', this.currentData, this.teamData, this.routeData);
      if (this.currentData && this.teamData && this.routeData) {
        this.milequistData = this.dataService.calcMilequists(this.currentData, this.teamData, this.routeData);

        console.log(this.milequistData);

        this.bikes = {type: 'geojson', data: {type: 'FeatureCollection', features: []} };

        this.milequistData.map((d) => {
            console.log(this.routeData);
            if (d.routes) {

            const currentRoute = d.routes.filter((j) => {
              return j.current && !j.complete;
            });

            const currentRouteData = this.routeData.features.filter( (k) => {
              // console.log(k.properties, currentRoute[0]);
              return k.properties.route_name === currentRoute[0].route_name;
            })[0];

            const currentProportion = Math.round((d.milequist / currentRouteData.properties.milequist) * 100);
            // console.log(d.name, currentProportion, currentRouteData.geometry.coordinates);

            const currentCoords = currentRouteData.geometry.coordinates[currentProportion];

            const currentFeature = { 'type': 'Feature',
              'geometry': {
                  'type': 'Point',
                  'coordinates': currentCoords
              },
              'properties': {
                'team': d.name,
                'color': '#D22D7D'
              }
            };

            this.bikes.data.features.push(currentFeature);
          }
        });

        console.log('bikes', this.bikes);

        if (this.mapLayers.routes['plane']) {
          this.mapLayers.routes['plane']['source'].setData(this.bikes);
        }


      }

  }

}
