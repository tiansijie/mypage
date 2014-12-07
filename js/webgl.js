$( document ).ready(function() {

  var container, stats;

  var camera, scene, renderer;

  var objects, controller;

  var mouseX = 0, mouseY = 0;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  var time;

  var propertyGUI;

  var material;


  var BRDFFragmentShader = {};

  var currentFragShader;

  var startTime = new Date();

  init();
  animate();


  function init() {

    propertyGUI = new property();

    initShader();

    container = document.getElementById('webgl-container');
    //document.body.appendChild(container);


    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5500 );
    camera.position.z = 10;
    camera.position.x = 10;
    camera.position.y = 13;
    camera.lightDir = new THREE.Vector3(-1,-1,-1);
    camera.lightDir.normalize();

    scene = new THREE.Scene();

    var light = new THREE.PointLight( 0xffffff, 1, 100 );
    light.position.set( 100, 100, 100 );
    scene.add(light);

    var cubeMapTex = initiCubeMap();

    var boxGeo = new THREE.BoxGeometry(1,1,1);


    material = new THREE.ShaderMaterial( {
      uniforms: {
        u_lightColor: { type: "v3", value: new THREE.Vector3(light.color.r, light.color.g, light.color.b)  },
        u_lightDir: { type: "v3", value: camera.lightDir },
        u_lightPos: { type: "v3", value: light.position},
        u_viewPos: {type: "v3", value: camera.position },
        u_diffuseColor: {type: "v3", value: new THREE.Vector3(0.9, 0.9, 0.9)},
        u_ambientColor: {type: "v3", value: new THREE.Vector3(0.1, 0.1, 0.1)},
        u_roughness: {type: "f", value: 0.21 },
        u_fresnel: {type: "f", value: 5.1 },
        u_alpha: {type: "f", value: 0.21*0.21 },
        u_tCube: {type: "t", value: cubeMapTex },
        u_time: {type: "f", value: 0.0},
        u_texture: {type: "t", value: null },
        u_isTexture: {type: "i", value: 0 }
      },
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: currentFragShader,
    } );



    var loader = new THREE.JSONLoader();

    loader.load('../objects/spaceship/spaceship.js', function(geometry, materials) {

      $.getJSON('../objects/spaceship/spaceship.js', function(jsonData) {

        for (var i = 0; i < materials.length; ++i) {
          if (jsonData.materials[i].roughness && jsonData.materials[i].fresnel) {
            var mat = materials[i];
            materials[i] = material.clone();

            if(mat.map) {
              materials[i].uniforms['u_texture'].value = mat.map;
              materials[i].uniforms['u_isTexture'].value = 1;
            }

            var alpha = jsonData.materials[i].roughness * jsonData.materials[i].roughness
            materials[i].uniforms['u_roughness'].value = jsonData.materials[i].roughness;
            materials[i].uniforms['u_fresnel'].value = jsonData.materials[i].fresnel;
            materials[i].uniforms['u_alpha'].value = alpha;
            materials[i].uniforms['u_diffuseColor'].value = mat.color;
          }
        }
      });
      //mats = materials;
      var mesh = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
      mesh.position.set(0, 4, 0);
      scene.add(mesh);
    });


    var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry( 1, 32, 32 ), material);
    //var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry( 1, 32, 32 ), new THREE.MeshPhongMaterial());
    sphereMesh.position.y += 4;
    sphereMesh.scale.set(0.1, 0.1, 0.1);
    scene.add(sphereMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
    //renderer.setClearColor( 0xffffff, 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    ///renderer.gammaInput = true;
    //renderer.gammaOutput = true;
    container.appendChild( renderer.domElement );

    controller = new THREE.OrbitControls(camera, renderer.domElement);

    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

  }


  function animate() {

    requestAnimationFrame( animate );

    render();
    //stats.update();

    material.uniforms['u_time'].value = (new Date() - startTime) * 0.001;
  }

  function render() {
    renderer.render( scene, camera );
  }


  function property() {
    this.roughness = 0.21;
    this.fresnel = 10.0;
    this.Normal_Dirstribution_Function = 'BlinnPhong';
    this.Geometric_Shadowing = 'CookTorrance';
    this.Cube_Map_Name = 'chapel/';
  }


  function addUI() {
    var datGui = new dat.GUI();
    for(var i = 0; i < mats.length; ++i) {
      propertyGUI[i] = new property();
      datGui.add(propertyGUI[i], 'roughness', 0.01, 1.0);
      datGui.add(propertyGUI[i], 'fresnel', 1.0, 20.0);
      datGui.add(propertyGUI[i], 'Normal_Dirstribution_Function', ['BlinnPhong', 'Beckmann', 'GGX']);
      datGui.add(propertyGUI[i], 'Geometric_Shadowing', ['Implicit', 'CookTorrance', 'Kelemen', 'Beckmann', 'Schlick_Beckmann']);
    }
  }


  window.onload = function() {

    function roughnessCallback(value) {
      material.uniforms['u_roughness'].value = propertyGUI.roughness;
      material.uniforms['u_alpha'].value = propertyGUI.roughness * propertyGUI.roughness;
    }

    function fresnelCallback(value) {
      material.uniforms['u_fresnel'].value = propertyGUI.fresnel;
    }

  }


  function initShader() {
    BRDFFragmentShader.init = document.getElementById( 'fragmentShader_param' ).textContent;

    BRDFFragmentShader.N = [];
    BRDFFragmentShader.N['BlinnPhong'] = document.getElementById( 'NDFBlinnPhong' ).textContent;
    BRDFFragmentShader.N['Beckmann'] = document.getElementById( 'NDFBeckmann' ).textContent;
    BRDFFragmentShader.N['GGX'] = document.getElementById( 'NDFGGX' ).textContent;

    BRDFFragmentShader.G = [];
    BRDFFragmentShader.G['Implicit'] = document.getElementById( 'GImplicit' ).textContent;
    BRDFFragmentShader.G['CookTorrance'] = document.getElementById( 'GCookTorrance' ).textContent;
    BRDFFragmentShader.G['Kelemen'] = document.getElementById( 'GKelemen' ).textContent;
    BRDFFragmentShader.G['Beckmann'] = document.getElementById( 'GBeckmann' ).textContent;
    BRDFFragmentShader.G['Schlick_Beckmann'] = document.getElementById( 'GSchlick_Beckmann' ).textContent;

    BRDFFragmentShader.main = document.getElementById( 'fragmentShader_main' ).textContent;

    currentFragShader = BRDFFragmentShader.init
    + BRDFFragmentShader.N['BlinnPhong']
    + BRDFFragmentShader.G['CookTorrance']
    + BRDFFragmentShader.main;
  }


  function initiCubeMap() {

    var urlPrefix = "../cubemap/chapel/";
    //urlPrefix += propertyGUI.Cube_Map_Name + '/';
    //urlPrefix += "guangzhou/";

    var urls = [ urlPrefix + "posx.jpg", urlPrefix + "negx.jpg",
    urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",
    urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
    var textureCube = THREE.ImageUtils.loadTextureCube( urls );
    textureCube.format = THREE.RGBFormat;

    var shader = THREE.ShaderLib["cube"];
    shader.uniforms['tCube'].value = textureCube;   // textureCube has been init before
    var material = new THREE.ShaderMaterial({
      fragmentShader    : shader.fragmentShader,
      vertexShader  : shader.vertexShader,
      uniforms  : shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    // build the skybox Mesh
    var skyboxMesh = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material );
    // add it to the scene
    //scene.add( skyboxMesh );

    return textureCube;
  }


});
