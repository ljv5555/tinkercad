/**
<h1>breadboard</h1>
breadboard useful for prototyping circuits
<h4>Parameter Information</h4>
<code>
  { "id": "innerDiameterPercent", "displayName": "size of hole (as a percent of 2.55mm)", "type": "int", "default": 65, "rangeMin": 55, "rangeMax": 75 },    
  { "id": "rows", "displayName": "rows", "type": "int", "default": 8 },    
  { "id": "columns", "displayName": "columns", "type": "int", "default": 4 }    
</code>
**/
//var Kanvas = kanvas;
var Conversions = Core.Conversions;
var Debug = Core.Debug;
var Path2D = Core.Path2D;
var Point2D = Core.Point2D;
var Point3D = Core.Point3D;
var Matrix2D = Core.Matrix2D;
var Matrix3D = Core.Matrix3D;
var Mesh3D = Core.Mesh3D;
var Plugin = Core.Plugin;
var Tess = Core.Tess;
var Sketch2D = Core.Sketch2D;
var Solid = Core.Solid;
var Vector2D = Core.Vector2D;
var Vector3D = Core.Vector3D;
var Box3D = Core.Box3D;
var Point3D = Core.Point3D;
var pa = null;
 

params = [
  { "id": "outerWidth", "displayName": "outerWidth", "type": "length", "default": 36, "rangeMin": 0.01, "rangeMax": 500 },    
  { "id": "innerWidth", "displayName": "innerWidth", "type": "length", "default": 32, "rangeMin": 0.01, "rangeMax": 500 },    
  { "id": "outerLength", "displayName": "outerLength", "type": "length", "default": 76, "rangeMin": 0.01, "rangeMax": 500 },    
  { "id": "innerLength", "displayName": "innerLength", "type": "length", "default": 72, "rangeMin": 0.01, "rangeMax": 500 }
  /*
  ,    
  { "id": "rows", "displayName": "rows", "type": "int", "default": 1 },    
  { "id": "columns", "displayName": "columns", "type": "int", "default": 1 }
  */    
  
];

function makeCube(H, W, L) {
    var mesh = new Mesh3D();
  L=L/2;W=W/2;H=H/2;
        mesh.quad([-L,W,-H], [L,W,-H], [L,-W,-H], [-L,-W,-H]); //box bottom
        mesh.quad([-L,W,-H], [-L,-W,-H], [-L,-W,H], [-L,W,H]); //box front
        mesh.quad([-L,-W,-H], [L,-W,-H], [L,-W,H], [-L,-W,H]); //box right
        mesh.quad([-L,W,-H], [-L,W,H], [L,W,H], [L,W,-H]); //box left
        mesh.quad([L,W,-H], [L,W,H], [L,-W,H], [L,-W,-H]); //box back
        mesh.quad([-L,W,H], [-L,-W,H], [L,-W,H], [L,W,H]); //box top
  return mesh;
}
function makeSolid(mesh)
{
  var rtn = Solid.make(mesh);
  return rtn;
}
function translateMesh(mesh,x,y,z)
{
  var move = new Matrix3D();
  move.translation(x,y,z);
  mesh.transform(move);
  return mesh;
}


function shapeGeneratorEvaluate(params, callback){
  params["rows"]=1;
  params["columns"]=1;
  var translateAndCloneMesh=function(mesh,x,y,z){
      var rtn = mesh.clone();
      var move = new Matrix3D();
      move.translation(x,y,z);
      rtn.transform(move);
      return rtn;
  };
  var svg0 =       '<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>'+'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+'<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
  var svg1 = '</svg>';
  var height = 2.55;
    //var innerDiameterPercent = params["innerDiameterPercent"];
    //var wallWidth = (2.55 - (2.55 * (innerDiameterPercent/100.0)))/2;
    var owidth = params.outerWidth;
    var iwidth = params.innerWidth;
    var olength = params.outerLength;
    var ilength = params.innerLength;
    var wallWidth = (owidth-iwidth)/2;
    var wallLength = (olength-ilength)/2;
    //var halfowidth = owidth/2;
    //var halfiwidth = iwidth / 2;
    var osketch = Conversions.toSketch2DFromSVG(svg0+'<rect x="'+0+'" y="'+0+'" rx="0" ry="0" width="'+owidth+'" height="'+olength+'"/>'+svg1);
    var obox = Solid.extrude(osketch,10).mesh;
    var isketch = Conversions.toSketch2DFromSVG(svg0+'<rect x="'+wallWidth+'" y="'+wallLength+'" rx="0" ry="0" width="'+iwidth+'" height="'+ilength+'"/>'+svg1);
    var ibox = Solid.extrude(isketch,10).mesh;
    var i=0;
    var j = 0;
  var niboxes=[];
  var noboxes=[];
  noboxes.push(translateAndCloneMesh(obox,0,0,0)); 
  niboxes.push(translateAndCloneMesh(ibox,0,0,0)); 
  
  //var usbHole = translateMesh(makeCube(6,14,14),-2.5,-25,4);
  //noboxes.push(usbHole);
  
  
  
  for(i=0;i<params["rows"];i++){
    for(j=0;j<params["columns"];j++){ 
       noboxes.push(translateAndCloneMesh(obox,2.55*i,2.55*j,0)); 
       niboxes.push(translateAndCloneMesh(ibox,2.55*i,2.55*j,0)); 
    }
  }
  
  var nobox = new Mesh3D();
  var nibox = new Mesh3D();
  nobox.combine(noboxes);
  nibox.combine(niboxes);
  if(niboxes && niboxes.length && niboxes.length>0){nobox.subtract(nibox, function(mesh){callback(Solid.make(mesh));});}
  else{callback(Solid.make(nobox));}
}
 
Library.exports.generateBreadboardEvaluate = shapeGeneratorEvaluate;
