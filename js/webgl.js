$( document ).ready(function() {

  var SCREEN_WIDTH = window.innerWidth;
  var SCREEN_HEIGHT = window.innerHeight;
  var FLOOR = -250;

  var container,stats;

  var camera, scene;
  var renderer;

  var mesh, helper;

  var mouseX = 0, mouseY = 0;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  var clock = new THREE.Clock();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  init();
  animate();

  function init() {

    container = document.getElementById( 'webgl-container' );

    camera = new THREE.PerspectiveCamera( 30, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.z = 2200;

    scene = new THREE.Scene();

    //scene.fog = new THREE.Fog( 0xffffff, 2000, 10000 );

    scene.add( camera );

    var geometry = new THREE.BoxGeometry( 200, 200, 200 );

    for ( var i = 0; i < geometry.faces.length; i += 2 ) {

      var hex = Math.random() * 0xffffff;
      geometry.faces[ i ].color.setHex( hex );
      geometry.faces[ i + 1 ].color.setHex( hex );

    }

    var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );

    cube = new THREE.Mesh( geometry, material );
    cube.position.y = 150;
    scene.add( cube );

    var ambient = new THREE.AmbientLight( 0x222222 );
    scene.add( ambient );


    var light = new THREE.DirectionalLight( 0xebf3ff, 1.6 );
    light.position.set( 0, 140, 500 ).multiplyScalar( 1.1 );
    scene.add( light );

    light.castShadow = true;

    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 2048;

    var d = 390;

    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d * 1.5;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 3500;
    //light.shadowCameraVisible = true;

    //

    var light = new THREE.DirectionalLight( 0x497f13, 1 );
    light.position.set( 0, -1, 0 );
    scene.add( light );

    // RENDERER

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.domElement.style.position = "relative";

    //renderer.setClearColor( scene.fog.color, 1 );

    container.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMapEnabled = true;


    // STATS

    // stats = new Stats();
    // container.appendChild( stats.domElement );

    //

    // var loader = new THREE.JSONLoader();
    // loader.load( "models/skinned/knight.js", function ( geometry, materials ) {
    //
    //   createScene( geometry, materials, 0, FLOOR, -300, 60 )
    //
    // } );

    // GUI

  //  initGUI();

    //

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }

  function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

  }

  //

  function animate() {

    requestAnimationFrame( animate );

    render();
    //stats.update();

  }

  function render() {

    //cube.rotation.y += 0.05;

    var delta = 0.75 * clock.getDelta();

    camera.position.x += ( mouseX - camera.position.x ) * .05;
    camera.position.y = THREE.Math.clamp( camera.position.y + ( - mouseY - camera.position.y ) * .05, 0, 1000 );

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

  }

});
