"use strict";
/**
<h1>grid-of-cubes</h1>
<h4>Parameter Information</h4>
<code>[
  { "id": "innerDiameterPercent", "displayName": "size of hole (as a percent of 2.55mm)", "type": "length", "default": 60, "rangeMin": 0, "rangeMax": 200 },    
  { "id": "rows", "displayName": "rows", "type": "int", "default": 2 },    
  { "id": "columns", "displayName": "columns", "type": "int", "default": 2 },
  { "id": "holesOnly", "displayName":"holesOnly", "type":"string","default":"true"},
  { "id": "layers", "displayName":"layers", "type":"int","default":2},//111111110011
  { "id": "holesToSkip", "displayName":"holesToSkip", "type":"string","default":"1"}
]</code>
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
  { "id": "innerDiameterPercent", "displayName": "size of hole (as a percent of 2.55mm)", "type": "length", "default": 60, "rangeMin": 0, "rangeMax": 200 },    
  { "id": "rows", "displayName": "rows", "type": "int", "default": 2 },    
  { "id": "columns", "displayName": "columns", "type": "int", "default": 2 },
  { "id": "holesOnly", "displayName":"holesOnly", "type":"string","default":"true"},
  { "id": "layers", "displayName":"layers", "type":"int","default":2},//111111110011
  { "id": "holesToSkip", "displayName":"holesToSkip", "type":"string","default":"1"}
//  { "id": "layers", "displayName":"layers", "type":"int","default":8},//111111110011
//  { "id": "holesToSkip", "displayName":"holesToSkip", "type":"string","default":"111111100001100001100001100001111001100001101111"}
];



function shapeGeneratorEvaluate(params, callback)
{
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
    var innerDiameterPercent = params["innerDiameterPercent"];
    var wallWidth = (2.55 - (2.55 * (innerDiameterPercent/100.0)))/2;
    var owidth = 2.544;
    var iwidth = 2.54 - wallWidth - wallWidth;
    var halfowidth = owidth/2;
    var halfiwidth = iwidth / 2;
    var osketch = Conversions.toSketch2DFromSVG(svg0+'<rect x="'+0+'" y="'+0+'" rx="0" ry="0" width="'+owidth+'" height="'+owidth+'"/>'+svg1);
    var obox = Solid.extrude(osketch,2.55).mesh;
    var isketch = Conversions.toSketch2DFromSVG(svg0+'<rect x="'+wallWidth+'" y="'+wallWidth+'" rx="0" ry="0" width="'+iwidth+'" height="'+iwidth+'"/>'+svg1);
    var ibox = Solid.extrude(isketch,2.55).mesh;
    var i=0;
    var j = 0;
    var k = 0;
  var niboxes=[];
  var noboxes=[];
  var hts = (''+params["holesToSkip"]).replace(new RegExp("[^0-9]","g"),"");
  var htsi = 0;
  for(k=0;k<params.layers;k++)
  {
  for(i=0;i<params["rows"];i++){
    for(j=0;j<params["columns"];j++){ 
      if(hts[htsi]=="1")
      {
        if(params["holesOnly"]=="false")
        {
          noboxes.push(translateAndCloneMesh(obox,2.55*i,2.55*j,2.551*k));
          niboxes.push(translateAndCloneMesh(ibox,2.55*i,2.55*j,2.551*k));
        }
        else{  noboxes.push(translateAndCloneMesh(ibox,2.55*i,2.55*j,2.551*k));  }
    }
      htsi++;
      if( htsi >= hts.length ){ 
        htsi = htsi - hts.length; 
      }
    }
  }
  }
  var nobox = new Mesh3D();
  var nibox = new Mesh3D();
  nobox.combine(noboxes);
  nibox.combine(niboxes);
  if(params["holesOnly"]=="false"){
    nobox.subtract(nibox, function(mesh){
        var s = Solid.make(mesh);
        callback(s);
    });
  }
  else
  {
    callback(Solid.make(nobox));
  }
}
 
Library.exports.generateBreadboardHolesEvaluate = shapeGeneratorEvaluate;
