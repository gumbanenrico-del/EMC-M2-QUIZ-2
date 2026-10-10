// AMBIENT
const AMBIENT_LIGHT_INTENSITY = 0.08;

// SCREEN
const SCREEN_LIGHT_COLOR = 0x8fb4e8;
const SCREEN_SPOT_INTENSITY = 40;
const SCREEN_GLOW_INTENSITY = 0.7;

// CEILING SPOTLIGHT
const CEILING_SPOT_COLOR = 0xffd9a0;
const CEILING_SPOT_INTENSITY = 25;

const spotFixtureMaterial = new THREE.MeshStandardMaterial( { color: 0x222222, roughness: 0.3, metalness: 0.8 } );
const spotBulbMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: CEILING_SPOT_COLOR, emissiveIntensity: 2 } );

// FLOOR UPLIGHTS
const UPLIGHT_COLOR = 0xffb86b;
const UPLIGHT_INTENSITY = 20;
const UPLIGHT_ANGLE = Math.PI / 6;
const UPLIGHT_TARGET_HEIGHT = 3.5;

const uplightHousingMaterial = new THREE.MeshStandardMaterial( { color: 0x1a1a1a, roughness: 0.4, metalness: 0.8 } );
const uplightLensMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff, emissive: UPLIGHT_COLOR, emissiveIntensity: 3 } );

// TABLE LAMP
const LAMP_LIGHT_COLOR = 0xffc27a;
const LAMP_LIGHT_INTENSITY = 8;

const lampMetalMaterial = new THREE.MeshStandardMaterial( { color: 0x222222, roughness: 0.3, metalness: 0.9 } );
const lampShadeMaterial = new THREE.MeshStandardMaterial( {
  color: 0xffe2b0,
  emissive: LAMP_LIGHT_COLOR,
  emissiveIntensity: 1.2,
  roughness: 0.6,
  side: THREE.DoubleSide
} );

// PICTURE LIGHTS
const PICTURE_LIGHT_COLOR = 0xffe2b0;
const PICTURE_LIGHT_INTENSITY = 10;
const PICTURE_LIGHT_HEIGHT = 4.4;


function createAmbientLight( scene ) {
  const ambientLight = new THREE.AmbientLight( 0xffffff, AMBIENT_LIGHT_INTENSITY );
  scene.add( ambientLight );
  return ambientLight;
}

// The movie screen lguight
function createScreenLights( scene, roomDepth, screenCenterY ) {
  const spotLight = new THREE.SpotLight( SCREEN_LIGHT_COLOR, SCREEN_SPOT_INTENSITY, 25, Math.PI / 3, 0.8, 1.5 );
  spotLight.position.set( 0, screenCenterY, -roomDepth / 2 + 0.3 );
  spotLight.target.position.set( 0, 0.5, roomDepth / 2 );
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set( 1024, 1024 );
  spotLight.shadow.camera.near = 0.5;
  spotLight.shadow.camera.far = 25;
  scene.add( spotLight, spotLight.target );

  const glow = new THREE.PointLight( SCREEN_LIGHT_COLOR, SCREEN_GLOW_INTENSITY, 12 );
  glow.position.set( 0, screenCenterY, -roomDepth / 2 + 1.5 );
  scene.add( glow );

  return { spotLight, glow };
}

function createCeilingSpotlight( scene, roomHeight, positionX, positionZ ) {
  const spotLight = new THREE.SpotLight( CEILING_SPOT_COLOR, CEILING_SPOT_INTENSITY, 12, Math.PI / 6, 0.6, 1.5 );
  spotLight.position.set( positionX, roomHeight - 0.3, positionZ );
  spotLight.target.position.set( positionX, 0, positionZ );
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set( 1024, 1024 );
  scene.add( spotLight, spotLight.target );

  // visible lights ngl 
  const fixture = new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0.25, 0.3, 24 ), spotFixtureMaterial );
  fixture.position.set( positionX, roomHeight - 0.15, positionZ );
  scene.add( fixture );

  const bulb = new THREE.Mesh( new THREE.CircleGeometry( 0.17, 24 ), spotBulbMaterial );
  bulb.rotation.x = Math.PI / 2;   // faces down
  bulb.position.set( positionX, roomHeight - 0.31, positionZ );
  scene.add( bulb );

  return spotLight;
}

function createFloorUplight( scene, positionX, positionZ, targetX, targetZ ) {
  const uplight = new THREE.Group();

  const housing = new THREE.Mesh( new THREE.CylinderGeometry( 0.15, 0.18, 0.25, 24 ), uplightHousingMaterial );
  housing.position.y = 0.125;
  housing.castShadow = true;

  const lens = new THREE.Mesh( new THREE.CircleGeometry( 0.12, 24 ), uplightLensMaterial );
  lens.rotation.x = -Math.PI / 2;   // faces up
  lens.position.y = 0.252;

  uplight.add( housing, lens );
  uplight.position.set( positionX, 0, positionZ );
  scene.add( uplight );

  const spotLight = new THREE.SpotLight( UPLIGHT_COLOR, UPLIGHT_INTENSITY, 10, UPLIGHT_ANGLE, 0.8, 1.5 );
  spotLight.position.set( positionX, 0.3, positionZ );
  spotLight.target.position.set( targetX, UPLIGHT_TARGET_HEIGHT, targetZ );
  scene.add( spotLight, spotLight.target );

  return uplight;
}

function createTableLamp( scene, positionX, positionY, positionZ ) {
  const lamp = new THREE.Group();

  const lampBase = new THREE.Mesh( new THREE.CylinderGeometry( 0.12, 0.15, 0.06, 24 ), lampMetalMaterial );
  lampBase.position.y = 0.03;
  lampBase.castShadow = true;

  const lampStem = new THREE.Mesh( new THREE.CylinderGeometry( 0.02, 0.02, 0.4, 12 ), lampMetalMaterial );
  lampStem.position.y = 0.26;
  lampStem.castShadow = true;

  // Open-ended cone so the light shines out of the top and bottom
  const lampShade = new THREE.Mesh( new THREE.CylinderGeometry( 0.12, 0.2, 0.3, 24, 1, true ), lampShadeMaterial );
  lampShade.position.y = 0.55;

  const lampLight = new THREE.PointLight( LAMP_LIGHT_COLOR, LAMP_LIGHT_INTENSITY, 8, 2 );
  lampLight.position.y = 0.55;

  lamp.add( lampBase, lampStem, lampShade, lampLight );
  lamp.position.set( positionX, positionY, positionZ );
  scene.add( lamp );
  return lamp;
}

function createPosterLight( scene, positionX, positionZ, targetX, targetY, targetZ ) {
  const pictureLight = new THREE.SpotLight( PICTURE_LIGHT_COLOR, PICTURE_LIGHT_INTENSITY, 6, Math.PI / 8, 0.7, 1.5 );
  pictureLight.position.set( positionX, PICTURE_LIGHT_HEIGHT, positionZ );
  pictureLight.target.position.set( targetX, targetY, targetZ );
  scene.add( pictureLight, pictureLight.target );
  return pictureLight;
}