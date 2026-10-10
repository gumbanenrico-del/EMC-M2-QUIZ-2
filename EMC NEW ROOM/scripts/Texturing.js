const TEXTURE_TILE_SIZE = 2;   // room units covered by one copy of the image
const textureLoader = new THREE.TextureLoader();

function loadRepeatingTexture( texturePath, surfaceWidth, surfaceHeight ) {
  const texture = textureLoader.load(
    texturePath,
    undefined,
    undefined,
    () => console.error( "Texture failed to load: " + texturePath )
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( surfaceWidth / TEXTURE_TILE_SIZE, surfaceHeight / TEXTURE_TILE_SIZE );
  return texture;
}

function createTexturedMaterial( texturePath, surfaceWidth, surfaceHeight, roughness ) {
  const texture = loadRepeatingTexture( texturePath, surfaceWidth, surfaceHeight );
  return new THREE.MeshStandardMaterial( { map: texture, roughness: roughness } );
}

// Floor, walls and ceiling in one call
function createRoomMaterials( roomWidth, roomDepth, roomHeight ) {
  return {
    floorMaterial: createTexturedMaterial( "textures/floor.jpg", roomWidth, roomDepth, 0.35 ),
    backWallMaterial: createTexturedMaterial( "textures/wall.jpg", roomWidth, roomHeight, 0.95 ),
    sideWallMaterial: createTexturedMaterial( "textures/wall.jpg", roomDepth, roomHeight, 0.95 ),

    // Purely matte ceiling (Lambert has no highlights at all)
    ceilingMaterial: new THREE.MeshLambertMaterial( {
      map: loadRepeatingTexture( "textures/ceiling.jpg", roomWidth, roomDepth )
    } )
  };
}