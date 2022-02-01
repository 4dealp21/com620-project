import '@ar-js-org/ar.js';
import 'aframe-look-at-component';
import 'aframe-osm-3d';
import 'aframe';
import { GoogleProjection } from 'jsfreemaplib';

AFRAME.registerComponent('entity-downloader',  {

    init: function () {

        this.camera = document.querySelector('a-camera');
        this.merc = new GoogleProjection();

        navigator.geolocation.getCurrentPosition( async(gpspos) => {

            console.log(`got gpspos: ${gpspos.coords.longitude} ${gpspos.coords.latitude}`);

            // Project the lat and lon into Web Mercator
            const [e,n] = this.merc.project(gpspos.coords.longitude, gpspos.coords.latitude);

            // Set the camera's position to the current world position
            // [camera] selects the entity with a 'camera' component, i.e.
            // the camera entity
            document.querySelector('[camera]').setAttribute('position', {
                x: e,
                y: 0,
                z: -n
            });
                
            // Get the pois
            const response = await fetch(`https://hikar.org/webapp/map/all?bbox=${gpspos.coords.longitude-0.055},${gpspos.coords.latitude-0.025},${gpspos.coords.longitude+0.055},${gpspos.coords.latitude+0.025}`);
            const json = await response.json();

            
                json.features.forEach ( feature => { 


                    // Project each pois's lat and lon into Web Mercator
                    const [e1,n1] = this.merc.project(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);

                    // Getting the length of the word
                    let poiName = feature.properties.name;
                    let length = poiName.length;

                    // Create the entities
                    const forkEntity = document.createElement('a-entity');
                    forkEntity.setAttribute('gltf-model', '#fork');
                    const mugEntity = document.createElement('a-entity');
                    mugEntity.setAttribute('gltf-model', '#mug');
                    const coneEntity = document.createElement("a-cone");
                    const textEntity = document.createElement("a-text");
                    const boxEntity = document.createElement("a-box");
                    const cylinderEntity = document.createElement("a-cylinder");
                    const sign = document.createElement("a-entity");

                    // Set the position of the cone
                    coneEntity.setAttribute('position', {
                        x: e1,
                        y: 0,
                        z: -n1
                    });
                    // Set cone apperance attributes
                    coneEntity.setAttribute('height', 15);
                    coneEntity.setAttribute('radius-bottom', 5);
                    coneEntity.setAttribute('material', {
                        color: '#50846e'
                    });
                    // Set the position of the text
                    textEntity.setAttribute('position', {
                        x: e1,
                        y: 10,
                        z: -n1
                    });
                    // Set the scale of the text
                    textEntity.setAttribute('scale',  {
                        x: 10,
                        y: 10,
                        z: 10
                    });
                    textEntity.setAttribute('color', 'white');
                    // Set the text to look at the camera, 
                    // align text to the center and give it a value
                    textEntity.setAttribute('look-at', '[gps-projected-camera]');
                    textEntity.setAttribute('align', 'center'); 
                    textEntity.setAttribute('value', feature.properties.name);


                    // Dynamically add the clicker component to the restaurant entity
                    // and pass in the name and elevation
                    forkEntity.setAttribute("clicker", {
                        name: feature.properties.name,
                        elevation: feature.properties.ele
                    });

                    forkEntity.setAttribute('position', {
                        x: e1,
                        y: -1,
                        z: -n1
                    });

                    forkEntity.setAttribute('scale', {
                        x:15,
                        y:15,
                        z:15
                    });
                    
                    // Dynamically add the clicker component to the coffee shop entity
                    // and pass in the name and elevation
                    mugEntity.setAttribute("clicker", {
                        name: feature.properties.name,
                        elevation: feature.properties.ele
                    });

                    mugEntity.setAttribute('position', {
                        x: e1,
                        y: -1,
                        z: -n1
                    });

                    mugEntity.setAttribute('scale', {
                        x:30,
                        y:30,
                        z:30
                    });
                    mugEntity.setAttribute('rotation', {
                        x:0,
                        y:90,
                        z:0
                    });

                    // Creating box for the sign
                    boxEntity.setAttribute('scale', {
                        x:length+4,
                        y:2.5,
                        z:0
                    });
                    boxEntity.setAttribute('position', {
                        x: e1,
                        y: 10,
                        z: -n1
                    });
                    boxEntity.setAttribute('material', {
                        color: '#50846e'
                    });

                    // Creating Cylinder to use as support for the sign
                    cylinderEntity.setAttribute('height', 12);
                    cylinderEntity.setAttribute('radius-bottom', 3);
                    cylinderEntity.setAttribute('radius-top', 3);
                    cylinderEntity.setAttribute('material', {
                        color: 'grey'
                    });
                    cylinderEntity.setAttribute('position', {
                        x: e1,
                        y: 3,
                        z: -n1-1
                    });

                    //Group box and cylinder together to create the sign
                    sign.appendChild(textEntity);
                    sign.appendChild(boxEntity);
                    sign.appendChild(cylinderEntity);

                    sign.setAttribute('position', {
                        x: 0,
                        y: 0,
                        z: -4
                    });

                    // Set the text to look at the camera, 
                    // align text to the center and give it a value
                    boxEntity.setAttribute('look-at', '[gps-projected-camera]');
                    boxEntity.setAttribute('align', 'center');

                    if (feature.properties.amenity == 'cafe') {
                        
                        this.el.sceneEl.appendChild(mugEntity);
                        // this.el.sceneEl.appendChild(coneEntity);
                        this.el.sceneEl.appendChild(sign);
                    };
                    if (feature.properties.amenity == 'restaurant') {
                        
                        this.el.sceneEl.appendChild(forkEntity);
                        // this.el.sceneEl.appendChild(coneEntity);
                        this.el.sceneEl.appendChild(sign);
                    }
                });  
        },

          error => { 
            alert(error); 
          }
        );
    }
});


// Clicker component
AFRAME.registerComponent('clicker', {
    // Schema - allowing name and elevation to be passed in 
    schema: {
        name: {
            type: 'string',
            default: '',
        },
        elevation: {
            type: 'number',
            default: 0
        }
    },
    init: function() {
        this.el.addEventListener('click', e=> {
            alert(`${this.data.name}, elevation ${this.data.elevation} metres`);
        });
    }
});
