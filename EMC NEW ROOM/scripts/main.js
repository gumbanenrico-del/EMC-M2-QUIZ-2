// room
const ROOM_WIDTH = 12;   // x axis
const ROOM_DEPTH = 10;   // z axis
const ROOM_HEIGHT = 5;   // y axis

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x1b2a3a );

// CAMERA
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 2.5, ROOM_DEPTH / 2 - 0.5 );
camera.lookAt( 0, 2, -ROOM_DEPTH / 2 );

// RENDERER
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );


// HELPERS
function createBox( width, height, depth, material, positionX, positionY, positionZ ) {
  const boxGeometry = new THREE.BoxGeometry( width, height, depth );
  const box = new THREE.Mesh( boxGeometry, material );
  box.position.set( positionX, positionY, positionZ );
  box.castShadow = true;
  box.receiveShadow = true;
  return box;
}

function createWall( width, height, positionX, positionZ, rotationY, material ) {
  const wallGeometry = new THREE.PlaneGeometry( width, height );
  const wall = new THREE.Mesh( wallGeometry, material );
  wall.position.set( positionX, height / 2, positionZ );
  wall.rotation.y = rotationY;
  wall.receiveShadow = true;
  scene.add( wall );
  return wall;
}


// MATERIALS 
const { floorMaterial, backWallMaterial, sideWallMaterial, ceilingMaterial } =
  createRoomMaterials( ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT );


// AMBIENT LIGHT 
createAmbientLight( scene );


// FLOOR
const floorGeometry = new THREE.PlaneGeometry( ROOM_WIDTH, ROOM_DEPTH );
const floor = new THREE.Mesh( floorGeometry, floorMaterial );
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add( floor );

// CEILING
const ceilingGeometry = new THREE.PlaneGeometry( ROOM_WIDTH, ROOM_DEPTH );
const ceiling = new THREE.Mesh( ceilingGeometry, ceilingMaterial );
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = ROOM_HEIGHT;
scene.add( ceiling );

// WALLS
const backWall = createWall( ROOM_WIDTH, ROOM_HEIGHT, 0, -ROOM_DEPTH / 2, 0, backWallMaterial );
const leftWall = createWall( ROOM_DEPTH, ROOM_HEIGHT, -ROOM_WIDTH / 2, 0, Math.PI / 2, sideWallMaterial );
const rightWall = createWall( ROOM_DEPTH, ROOM_HEIGHT, ROOM_WIDTH / 2, 0, -Math.PI / 2, sideWallMaterial );


// SCREEN VIDEO
const screenVideo = document.createElement( "video" );
screenVideo.src = "videos/BATMAN2.mp4";
screenVideo.loop = true;
screenVideo.muted = true;
screenVideo.playsInline = true;
screenVideo.crossOrigin = "anonymous";
screenVideo.play().catch( () => {} );

const videoTexture = new THREE.VideoTexture( screenVideo );
videoTexture.colorSpace = THREE.SRGBColorSpace;

window.addEventListener( "click", () => {
  screenVideo.muted = false;
  screenVideo.play();
} );


// CINEMA SCREEN
const SCREEN_WIDTH = 6;
const SCREEN_HEIGHT = 3.375;
const SCREEN_CENTER_Y = 2.8;
const SCREEN_FRAME_THICKNESS = 0.15;
const SCREEN_FRAME_BORDER = 0.2;
const SCREEN_EMISSIVE_INTENSITY = 1;

const screenFrameMaterial = new THREE.MeshStandardMaterial( { color: 0x111111, roughness: 0.4, metalness: 0.5 } );
const screenFrameGeometry = new THREE.BoxGeometry(
  SCREEN_WIDTH + SCREEN_FRAME_BORDER * 2,
  SCREEN_HEIGHT + SCREEN_FRAME_BORDER * 2,
  SCREEN_FRAME_THICKNESS
);
const screenFrame = new THREE.Mesh( screenFrameGeometry, screenFrameMaterial );
screenFrame.position.set( 0, SCREEN_CENTER_Y, -ROOM_DEPTH / 2 + SCREEN_FRAME_THICKNESS / 2 );
screenFrame.castShadow = true;
scene.add( screenFrame );

// Glowing display 
const cinemaScreenMaterial = new THREE.MeshStandardMaterial( {
  color: 0x000000,
  emissive: 0xffffff,
  emissiveMap: videoTexture,
  emissiveIntensity: SCREEN_EMISSIVE_INTENSITY,
  roughness: 0.3
} );
const cinemaScreenGeometry = new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );
const cinemaScreen = new THREE.Mesh( cinemaScreenGeometry, cinemaScreenMaterial );
cinemaScreen.position.set( 0, SCREEN_CENTER_Y, -ROOM_DEPTH / 2 + SCREEN_FRAME_THICKNESS + 0.01 );
scene.add( cinemaScreen );


// SCREEN LIGHT 
const screenLights = createScreenLights( scene, ROOM_DEPTH, SCREEN_CENTER_Y );


// SOFA
const SOFA_WIDTH = 4;
const SOFA_DEPTH = 1.4;
const SOFA_BASE_HEIGHT = 0.45;
const SOFA_BACK_HEIGHT = 1.2;
const SOFA_BACK_THICKNESS = 0.35;
const SOFA_ARM_WIDTH = 0.35;
const SOFA_ARM_HEIGHT = 0.8;
const SOFA_CUSHION_HEIGHT = 0.2;

// Fabric i tried 
const sofaFabricMaterial = new THREE.MeshPhysicalMaterial( {
  color: 0x6b2d3a,
  roughness: 1,
  metalness: 0,
  sheen: 1,
  sheenRoughness: 0.5,
  sheenColor: new THREE.Color( 0xff8fa3 )
} );
const sofaCushionMaterial = new THREE.MeshPhysicalMaterial( {
  color: 0x8a3b4c,
  roughness: 1,
  metalness: 0,
  sheen: 1,
  sheenRoughness: 0.5,
  sheenColor: new THREE.Color( 0xff9fb0 )
} );

function createSofa( positionX, positionZ ) {
  const sofa = new THREE.Group();
  const innerWidth = SOFA_WIDTH - SOFA_ARM_WIDTH * 2;
  const cushionWidth = innerWidth / 2;
  const seatTop = SOFA_BASE_HEIGHT + SOFA_CUSHION_HEIGHT;

  // Base
  sofa.add( createBox( SOFA_WIDTH, SOFA_BASE_HEIGHT, SOFA_DEPTH, sofaFabricMaterial,
    0, SOFA_BASE_HEIGHT / 2, 0 ) );

  // Backrest
  sofa.add( createBox( SOFA_WIDTH, SOFA_BACK_HEIGHT, SOFA_BACK_THICKNESS, sofaFabricMaterial,
    0, SOFA_BACK_HEIGHT / 2, SOFA_DEPTH / 2 - SOFA_BACK_THICKNESS / 2 ) );

  // Arms
  const armOffsetX = SOFA_WIDTH / 2 - SOFA_ARM_WIDTH / 2;
  sofa.add( createBox( SOFA_ARM_WIDTH, SOFA_ARM_HEIGHT, SOFA_DEPTH, sofaFabricMaterial,
    -armOffsetX, SOFA_ARM_HEIGHT / 2, 0 ) );
  sofa.add( createBox( SOFA_ARM_WIDTH, SOFA_ARM_HEIGHT, SOFA_DEPTH, sofaFabricMaterial,
    armOffsetX, SOFA_ARM_HEIGHT / 2, 0 ) );

  // Seat cushions
  const seatDepth = SOFA_DEPTH - SOFA_BACK_THICKNESS;
  [ -1, 1 ].forEach( ( side ) => {
    sofa.add( createBox( cushionWidth - 0.04, SOFA_CUSHION_HEIGHT, seatDepth, sofaCushionMaterial,
      side * cushionWidth / 2, SOFA_BASE_HEIGHT + SOFA_CUSHION_HEIGHT / 2, -SOFA_BACK_THICKNESS / 2 ) );
  } );

  // Back cushions
  [ -1, 1 ].forEach( ( side ) => {
    const backCushion = createBox( cushionWidth - 0.04, 0.6, 0.25, sofaCushionMaterial,
      side * cushionWidth / 2, seatTop + 0.3, SOFA_DEPTH / 2 - SOFA_BACK_THICKNESS - 0.125 );
    backCushion.rotation.x = -0.15;   // slight lean back
    sofa.add( backCushion );
  } );

  sofa.position.set( positionX, 0, positionZ );
  scene.add( sofa );
  return sofa;
}

const sofa = createSofa( 0, 1.5 );


// CEILING SPOTLIGHT
const ceilingSpotLight = createCeilingSpotlight( scene, ROOM_HEIGHT, 0, 0 );


// POSTERS
const POSTER_FRAME_BORDER = 0.08;
const POSTER_FRAME_DEPTH = 0.06;

const posterFrameMaterial = new THREE.MeshStandardMaterial( { color: 0x1a1a1a, roughness: 0.4, metalness: 0.3 } );

function createPoster( texturePath, width, height, positionX, positionY, positionZ, rotationY ) {
  const poster = new THREE.Group();

  const posterTexture = textureLoader.load( texturePath );
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  const posterMaterial = new THREE.MeshStandardMaterial( { map: posterTexture, roughness: 0.6 } );

  const posterFrame = createBox(
    width + POSTER_FRAME_BORDER * 2,
    height + POSTER_FRAME_BORDER * 2,
    POSTER_FRAME_DEPTH,
    posterFrameMaterial,
    0, 0, 0
  );

  const posterImage = new THREE.Mesh( new THREE.PlaneGeometry( width, height ), posterMaterial );
  posterImage.position.z = POSTER_FRAME_DEPTH / 2 + 0.001;
  posterImage.receiveShadow = true;

  poster.add( posterFrame, posterImage );
  poster.position.set( positionX, positionY, positionZ );
  poster.rotation.y = rotationY;
  scene.add( poster );
  return poster;
}

const POSTER_WIDTH = 1.2;
const POSTER_HEIGHT = 1.8;
const POSTER_CENTER_Y = 2.6;
const LEFT_WALL_POSTER_X = -ROOM_WIDTH / 2 + POSTER_FRAME_DEPTH / 2;
const RIGHT_WALL_POSTER_X = ROOM_WIDTH / 2 - POSTER_FRAME_DEPTH / 2;
const SIDE_WALL_POSTER_Z = -2.2;   // far enough forward to be inside the camera view
const BACK_WALL_POSTER_Z = -ROOM_DEPTH / 2 + POSTER_FRAME_DEPTH / 2;
const BACK_WALL_POSTER_OFFSET_X = 4.6;   // beside the screen

// Left wall 
createPoster( "textures/poster1.jpg", POSTER_WIDTH, POSTER_HEIGHT, LEFT_WALL_POSTER_X, POSTER_CENTER_Y, SIDE_WALL_POSTER_Z, Math.PI / 2 );

// Right wall
createPoster( "textures/poster3.jpg", POSTER_WIDTH, POSTER_HEIGHT, RIGHT_WALL_POSTER_X, POSTER_CENTER_Y, SIDE_WALL_POSTER_Z, -Math.PI / 2 );

// Back wall
createPoster( "textures/poster2.jpg", POSTER_WIDTH, POSTER_HEIGHT, -BACK_WALL_POSTER_OFFSET_X, POSTER_CENTER_Y, BACK_WALL_POSTER_Z, 0 );
createPoster( "textures/poster4.jpg", POSTER_WIDTH, POSTER_HEIGHT, BACK_WALL_POSTER_OFFSET_X, POSTER_CENTER_Y, BACK_WALL_POSTER_Z, 0 );


// TABLES
const TABLE_TOP_THICKNESS = 0.08;
const TABLE_LEG_SIZE = 0.08;

// wood 
const tableTopMaterial = new THREE.MeshPhysicalMaterial( {
  color: 0x2b1d14,
  roughness: 0.4,
  metalness: 0.1,
  clearcoat: 1,
  clearcoatRoughness: 0.05
} );
// more wood for the legs
const tableLegMaterial = new THREE.MeshPhongMaterial( { color: 0x111111, specular: 0xffffff, shininess: 120 } );

function createTable( tableWidth, tableDepth, tableHeight, positionX, positionZ ) {
  const table = new THREE.Group();
  const legHeight = tableHeight - TABLE_TOP_THICKNESS;
  const legOffsetX = tableWidth / 2 - TABLE_LEG_SIZE;
  const legOffsetZ = tableDepth / 2 - TABLE_LEG_SIZE;

  // Glossy top
  table.add( createBox( tableWidth, TABLE_TOP_THICKNESS, tableDepth, tableTopMaterial,
    0, tableHeight - TABLE_TOP_THICKNESS / 2, 0 ) );

  // Four metal legs
  [ -1, 1 ].forEach( ( sideX ) => {
    [ -1, 1 ].forEach( ( sideZ ) => {
      table.add( createBox( TABLE_LEG_SIZE, legHeight, TABLE_LEG_SIZE, tableLegMaterial,
        sideX * legOffsetX, legHeight / 2, sideZ * legOffsetZ ) );
    } );
  } );

  table.position.set( positionX, 0, positionZ );
  scene.add( table );
  return table;
}

const consoleTable = createTable( 5, 0.6, 0.7, 0, -ROOM_DEPTH / 2 + 0.6 );


// ROOM LIGHTS
const coffeeTableLamp = createTableLamp( scene, 1.2, 0.5, -0.2 );

// One on each side wall
const leftUplight = createFloorUplight( scene, -ROOM_WIDTH / 2 + 0.5, -1, -ROOM_WIDTH / 2, -1 );
const rightUplight = createFloorUplight( scene, ROOM_WIDTH / 2 - 0.5, -1, ROOM_WIDTH / 2, -1 );

// One picture light above each poster
const leftPosterLight = createPosterLight( scene, -ROOM_WIDTH / 2 + 0.8, SIDE_WALL_POSTER_Z, -ROOM_WIDTH / 2, POSTER_CENTER_Y, SIDE_WALL_POSTER_Z );
const rightPosterLight = createPosterLight( scene, ROOM_WIDTH / 2 - 0.8, SIDE_WALL_POSTER_Z, ROOM_WIDTH / 2, POSTER_CENTER_Y, SIDE_WALL_POSTER_Z );
const backLeftPosterLight = createPosterLight( scene, -BACK_WALL_POSTER_OFFSET_X, -ROOM_DEPTH / 2 + 1.2, -BACK_WALL_POSTER_OFFSET_X, POSTER_CENTER_Y, -ROOM_DEPTH / 2 );
const backRightPosterLight = createPosterLight( scene, BACK_WALL_POSTER_OFFSET_X, -ROOM_DEPTH / 2 + 1.2, BACK_WALL_POSTER_OFFSET_X, POSTER_CENTER_Y, -ROOM_DEPTH / 2 );


// RESIZE
window.addEventListener( "resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
} );

// ANIMATION LOOP
function animate( time ) {
  const seconds = time * 0.001;
  const flicker = 1 + Math.sin( seconds * 8 ) * 0.05 + Math.sin( seconds * 2.3 ) * 0.08;

  screenLights.spotLight.intensity = SCREEN_SPOT_INTENSITY * flicker;
  screenLights.glow.intensity = SCREEN_GLOW_INTENSITY * flicker;

  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );