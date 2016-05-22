var container;
var camera, controls, scene, renderer;
var animateid;
var sizescale=3;
var sphere;
var spheresteps=0;
var lastani=0;
var alreadyrender=false;
var autorender=false;

function init() {
	if(animateid){
		cancelAnimationFrame(animateid);
	}
	container = document.getElementById( "container" );

	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0x555555 ) );

	var geometry = new THREE.Geometry(),
	defaultMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0	} );

	function applyVertexColors( g, c ) {
		g.faces.forEach( function( f ) {
			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
			for( var j = 0; j < n; j ++ ) {
				f.vertexColors[ j ] = c;
			}
		} );
	}


	
	var color = new THREE.Color();
	var matrix = new THREE.Matrix4();
	var quaternion = new THREE.Quaternion();	

	for(renderIndex in blockRenderData){
		var tempRender = blockRenderData[renderIndex];
		
		var position = new THREE.Vector3();
		position.x = (tempRender.position[0])*-sizescale;
		position.y = (tempRender.position[1])*sizescale;
		position.z = (tempRender.position[2])*sizescale;


		quaternion = new THREE.Quaternion(-tempRender.rotation[0],tempRender.rotation[1],tempRender.rotation[2],-tempRender.rotation[3]);			
		//quaternion = new THREE.Quaternion(0,0,0,1);			
		var scale = new THREE.Vector3();
		scale.x = sizescale;
		scale.y = sizescale;
		scale.z = sizescale;
		
		matrix.compose( position, quaternion, scale );
		
		var points = [
			new THREE.Vector3( -(tempRender.negx-0.5), tempRender.negy-0.5, tempRender.negz-0.5 ),
			new THREE.Vector3( -(tempRender.posx+0.5), tempRender.negy-0.5, tempRender.negz-0.5 ),
			new THREE.Vector3( -(tempRender.negx-0.5), tempRender.posy+0.5, tempRender.negz-0.5 ),
			new THREE.Vector3( -(tempRender.posx+0.5), tempRender.posy+0.5, tempRender.negz-0.5 ),
			new THREE.Vector3( -(tempRender.negx-0.5), tempRender.negy-0.5, tempRender.posz+0.5 ),
			new THREE.Vector3( -(tempRender.posx+0.5), tempRender.negy-0.5, tempRender.posz+0.5 ),
			new THREE.Vector3( -(tempRender.negx-0.5), tempRender.posy+0.5, tempRender.posz+0.5 ),
			new THREE.Vector3( -(tempRender.posx+0.5), tempRender.posy+0.5, tempRender.posz+0.5 )
		];
		var geom =  new THREE.ConvexGeometry( points );		

	
		//var geom = new THREE.BoxGeometry( 1, 1, 1 );
		//applyVertexColors( geom, color.setHex( Math.random() * 0xffffff ) );
		applyVertexColors(geom, color.set(tempRender.color));
		geometry.merge( geom, matrix );	
		
	}
	
	
	var minx=minc[0];
	var maxx=maxc[0];
	var miny=minc[1];
	var maxy=maxc[1];
	var minz=minc[2];
	var maxz=maxc[2];
	
	var midx=(minx+maxx)/2;
	var midy=(miny+maxy)/2;
	var midz=(minz+maxz)/2;
	
	var maxdist=Math.sqrt((Math.pow(Math.max(maxx-minx,maxy-miny,maxz-minz)/1.4,2))/3);
	maxdist=maxdist/2;
	maxdist=maxdist+10/maxdist;
	maxdist=Math.sqrt(Math.pow(maxdist,2)/3);
	
	

	var drawnObject = new THREE.Mesh( geometry, defaultMaterial );
	scene.add( drawnObject );
	
	
	var sgeo = new THREE.SphereGeometry(1);
	var smat = new THREE.MeshBasicMaterial( {color: 0xffff00,transparent: true} );
		
	sphere = new THREE.Mesh( sgeo, smat );
	
	
	sphere.scale.set(1,1,1);
	sphere.material.opacity = 0;
	sphere.visible=false;
	scene.add( sphere );
	
	
	
	var intensity=Math.sqrt(maxz-minz)/6
	var light = new THREE.PointLight( 0xffffff, intensity );
	light.position.set( (maxx*(-sizescale))+250, (maxy+Math.sqrt(maxy-miny))*(sizescale+1), maxz*(sizescale+1) );
	scene.add( light );

	var dir = new THREE.Vector3( 0, 0, 1 );
	var origin = new THREE.Vector3( (minx-2)*(-sizescale), (miny-1)*sizescale, (midz*0.8)*sizescale) ;
	var al = (maxz-minz)*0.2;
	var ac = 0x007f00;

	var arrowHelper = new THREE.ArrowHelper( dir, origin, al, ac );
	arrowHelper.scale.set(sizescale,sizescale,sizescale);
	scene.add( arrowHelper );		

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setClearColor( 0xffffff,0 );
	//renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setPixelRatio(1);
	renderer.sortObjects = false;
	container.innerHTML = "";
	container.appendChild( renderer.domElement );
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.x = (minx-maxdist)*(-sizescale);
	camera.position.y = (maxy*1.2)*(sizescale);
	camera.position.z = (((midz+(maxz*2.5))/3.5)*sizescale)
	//camera.lookAt(new THREE.Vector3( midx*-10, (maxy-(miny*1.3))*10, ((maxz*1.1)-minz)*10 ));
	controls = new THREE.OrbitControls( camera ,renderer.domElement);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.enableZoom = true;
	controls.enablePan = true;
	controls.target.set(midx*(-sizescale), (((maxy+(miny*1.3))/2)*sizescale), (((minz+(maxz*2.5))/3.5)*sizescale));
	camera.lookAt(new THREE.Vector3(midx*(-sizescale), (((maxy+(miny*1.5))/2.5)*sizescale), (((minz+(maxz*2.5))/3.5)*sizescale)));
	
	// EVENTS
	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
	//onWindowResize();

}

function animate() {
	animateid=requestAnimationFrame( animate );
	if($("#renderpanel").hasClass("ui-collapsible-collapsed")){
		//do nothing
	}else{
		
		var tempnow=Date.now();
		if(tempnow-lastani>100){
			lastani=tempnow;
			render();
		}
	}
}

function render() {

	//controls.update();
	renderer.render( scene, camera );
	if(spheresteps>0){
		var tempscale=sphere.scale.x;
		tempscale=(tempscale*2)+sizescale;
		sphere.scale.set(tempscale,tempscale,tempscale);
		sphere.material.opacity = sphere.material.opacity*0.7;
		spheresteps--;
	}else if(spheresteps==0){
		sphere.material.opacity = false;
		sphere.visible=false;
		spheresteps--;
	}else{
		//donothing
	}		
}
	
function pinglocation(x,y,z) {
	sphere.position.set(x*(-sizescale),y*sizescale,z*sizescale);
	sphere.scale.set(1,1,1);
	sphere.material.opacity = 1;
	sphere.visible=true;
	spheresteps=15;

}
	

function onWindowResize() {

	var canvasWidth = $("#container").innerWidth();
	var canvasratio= window.innerHeight/window.innerWidth;
	if(canvasratio>1){
		canvasratio=1;
	}else if (canvasratio<0.5){
		canvasratio=0.5;
	}
	var canvasHeight = Math.round(canvasWidth*canvasratio);
	
	renderer.setSize( canvasWidth, canvasHeight );

	camera.aspect = canvasWidth / canvasHeight;
	camera.updateProjectionMatrix();

	render();

}	
