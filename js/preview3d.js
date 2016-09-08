THREE.CustomCubeGeometry = function( vertices ,colors) {
	THREE.Geometry.call( this );
	var faces = [[0,1,2],[3,2,1],[3,7,2],[6,2,7],[2,6,0],[4,0,6],[1,0,5],[4,5,0],[4,6,5],[7,5,6],[3,1,7],[5,7,1] ]; 
	
	for(var f=0;f<8;f++){
		this.vertices.push(vertices[f]);
		
	}

	for ( var i = 0; i < faces.length; i ++ ) {
		this.faces.push( new THREE.Face3(
				faces[ i ][ 0 ],
				faces[ i ][ 1 ],
				faces[ i ][ 2 ], null,colors
		) );
	}
};
THREE.CustomCubeGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.CustomCubeGeometry.prototype.constructor = THREE.CustomCubeGeometry;



var container;
var camera, controls, scene, renderer;
var animateid=null;
var sizescale=3;
var sphere;
var spheresteps=0;
var lastani=0;
var alreadyinit=false;
var alreadyrender=false;
var alreadyanimate=false;
var drawnObject=null;
var pointlight=null;
var arrowHelper=null;

function init() {
	var temptime=(new Date()).getTime();
	
	if(!alreadyinit){
		alreadyinit=true;
		firstInit();
	}
	
	
	renderObject();

	if(!alreadyanimate){
		
		alreadyanimate=true;
		animate();
	}
	
	var temptime2=(new Date()).getTime();
	var timetaken = (temptime2-temptime);
	//console.log("time taken: " + timetaken);	
}

function firstInit(){
	container = document.getElementById( "container" );
	scene = new THREE.Scene();
	scene.add( new THREE.AmbientLight( 0x555555 ) );

	
	var sgeo = new THREE.SphereGeometry(1);
	var smat = new THREE.MeshBasicMaterial( {color: 0xffff00,transparent: true} );
		
	sphere = new THREE.Mesh( sgeo, smat );
	
	
	sphere.scale.set(1,1,1);
	sphere.material.opacity = 0;
	sphere.visible=false;
	scene.add( sphere );
	
	
	var intensity=1;
	pointlight = new THREE.PointLight( 0xffffff, intensity );
	pointlight.position.set( 0,0,0 );
	scene.add( pointlight );

	var dir = new THREE.Vector3( 0, 0, 1 );
	var origin = new THREE.Vector3(0,0,0) ;
	var al = 1;
	var ac = 0x007f00;

	arrowHelper = new THREE.ArrowHelper( dir, origin, al, ac );
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
	
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 0;

	controls = new THREE.OrbitControls( camera ,renderer.domElement);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.enableZoom = true;
	controls.enablePan = true;
	controls.target.set(0,0,0);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	// EVENTS
	window.addEventListener( 'resize', onWindowResize, false );
	onWindowResize();
	//onWindowResize();	
}


function renderObject(){

	
	var color = new THREE.Color();
	var geometry = new THREE.Geometry();


	var defaultMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 5	} );
	
	
	var matrix = new THREE.Matrix4();
	var quaternion = new THREE.Quaternion();	
	
	var scale = new THREE.Vector3();
	scale.x = sizescale;
	scale.y = sizescale;
	scale.z = sizescale;	

	for(renderIndex in blockRenderData){
		var tempRender = blockRenderData[renderIndex];
		
		var position = new THREE.Vector3();
		position.x = (tempRender.position[0])*-sizescale;
		position.y = (tempRender.position[1])*sizescale;
		position.z = (tempRender.position[2])*sizescale;


		quaternion = new THREE.Quaternion(-tempRender.rotation[0],tempRender.rotation[1],tempRender.rotation[2],-tempRender.rotation[3]);					

		
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
		var geom =  new THREE.CustomCubeGeometry( points ,color.set(tempRender.color));		

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
	
	scene.remove(drawnObject);
	if(drawnObject&&drawnObject.dispose){
		setTimeout(function(){
			var tempDO=drawnObject;
		   	disposeHierarchy (tempDO, disposeNode);
		}, 200);		
	}
	/*
	if(drawnObject&&drawnObject.dispose){
		drawnObject.dispose();
		drawnObject=null;
	}
	*/
	//geometry.mergeVertices();
	
	drawnObject = new THREE.Mesh( geometry, defaultMaterial );
	scene.add( drawnObject );
	
	
	var intensity=Math.sqrt(maxz-minz)/6
	pointlight.intensity=intensity;
	
	pointlight.position.x= (maxx*(-sizescale))+250;
	pointlight.position.y=(maxy+Math.sqrt(maxy-miny))*(sizescale+1);
	pointlight.position.z=maxz*(sizescale+1);
	


	arrowHelper.position.x=(minx-2)*(-sizescale);
	arrowHelper.position.y=(miny-1)*sizescale;
	arrowHelper.position.z=(midz*0.8)*sizescale;
	arrowHelper.setLength((maxz-minz)*0.2);
		

	camera.position.x = (minx-maxdist)*(-sizescale);
	camera.position.y = (maxy*1.2)*(sizescale);
	camera.position.z = (((midz+(maxz*2.5))/3.5)*sizescale)

	controls.target.set(midx*(-sizescale), (((maxy+(miny*1.3))/2)*sizescale), (((minz+(maxz*2.5))/3.5)*sizescale));
	camera.lookAt(new THREE.Vector3(midx*(-sizescale), (((maxy+(miny*1.5))/2.5)*sizescale), (((minz+(maxz*2.5))/3.5)*sizescale)));

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

function disposeNode (node)
{
    if (node instanceof THREE.Mesh)
    {
        if (node.geometry)
        {
            node.geometry.dispose ();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)           mtrl.map.dispose ();
                    if (mtrl.lightMap)      mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)     mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)   mtrl.specularMap.dispose ();
                    if (mtrl.envMap)        mtrl.envMap.dispose ();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else
            {
                if (node.material.map)          node.material.map.dispose ();
                if (node.material.lightMap)     node.material.lightMap.dispose ();
                if (node.material.bumpMap)      node.material.bumpMap.dispose ();
                if (node.material.normalMap)    node.material.normalMap.dispose ();
                if (node.material.specularMap)  node.material.specularMap.dispose ();
                if (node.material.envMap)       node.material.envMap.dispose ();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}   // disposeNode

function disposeHierarchy (node, callback)
{
    for (var i = node.children.length - 1; i >= 0; i--)
    {
        var child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
}
