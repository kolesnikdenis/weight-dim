'use strict';
var fs =  require('fs');
var request = require('request');
var g_dc = require('../code/save_excel.js');
var config = require('../config.json');
var goods_chicken = require('../goods_chicken.json');
var zakaz = require('../zakaz.json');
var points_sale = require('../points_sale.json');


//JSON.parse(fs.readFileSync('/var/www/html/my_project/21-03-17_ds.arr', 'utf8'));

module.exports = function(app) {

 app.get('/create_way_car', function(req, res) {
   var arr = "";
   res.render('pages/create_way_car', {data: JSON.stringify(arr)} );
 });

 app.get('/select',  function(req, res) {
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment={};
     if (( req.query.dot_dst === undefined ) ||  ( req.query.production === undefined )  ) {
         res.render('pages/error' );
     } else {
         var dst_name = points_sale.points_sale[req.query.dot_dst]
         var production =  goods_chicken[req.query.production];
         if (fs.existsSync(file_json)) {
             console.log("read files");
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     res.render('pages/select', {obj_shipment: JSON.stringify(obj_shipment), ps: req.query.production, name: dst_name, id_dst: req.query.dot_dst, goods_chicken: JSON.stringify(production)} );
                 }
             });
         }else {
             var newDate = new Date(Date.now()+3*60*60*1000);
             newDate = newDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');

             obj_shipment={  "dst": {
                "id": req.query.dot_dst,
                "name": points_sale.points_sale[req.query.dot_dst],
                "create_data_time": newDate
             },"shipment": {}
             };
             obj_shipment.shipment[req.query.production] = {};
             var json = JSON.stringify(obj_shipment);
             fs.writeFile(file_json, json);
             res.render('pages/select', {obj_shipment: JSON.stringify(obj_shipment), ps: req.query.production, name: dst_name, id_dst: req.query.dot_dst, goods_chicken: JSON.stringify(production)} );
         }


     }
 });

 app.get('/ves_add', function(req, res) {
     //console.log("-----  ves_add ------");
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment={};
     if (fs.existsSync(file_json)) {
             //console.log("----- read files TO PAGE VES");
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log("err:"+err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     /*console.log("----- show OBJ -----");
                     console.log(obj_shipment);
                     console.log("body")
                     console.log(req.body);
                     console.log("query")
                     console.log(req.query)*/
                     var dst_name = points_sale.points_sale[req.query.dot_dst]
                     var production =  goods_chicken[req.query.production];
                     /*console.log("obj_shipment");
                     console.log(obj_shipment);
                     console.log("obj_shipment.shipment");
                     console.log(obj_shipment.shipment);
                     console.log("production");
                     console.log(production);*/
                     if (obj_shipment.shipment[req.query.production][req.query.id_production] === undefined){
                         //console.log("create ves: " +req.query.ves+ " at product_d: "+req.query.id_production )
                         obj_shipment.shipment[req.query.production][req.query.id_production]=[];
                     }else {
                         //console.log("add ves " +req.query.ves+ " to product_d: " +  req.query.id_production );
                     }
                     obj_shipment.shipment[req.query.production][req.query.id_production].push(req.query.ves);
                     var json = JSON.stringify(obj_shipment);
                     fs.writeFile(file_json, json);
                     var arr_ves = obj_shipment.shipment[req.query.production][req.query.id_production]
                     res.render('pages/add_ves', {arr_ves: JSON.stringify(arr_ves )} );

                 }
             });
     }else {
             res.render('pages/error' );
     }
 });
 app.get('/change_tare', function(req, res) {
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment = {};
     if (fs.existsSync(file_json)) {
         fs.readFile(file_json, function readFileCallback(err, data) {
             if (err) {
                 console.log("err:" + err);
             } else {
                 obj_shipment = JSON.parse(data);
                 //console.log(req.query);
                 obj_shipment.dst["tare"]=req.query.tare;
                 var json = JSON.stringify(obj_shipment);
                 fs.writeFile(file_json, json);
             }
         });
     } else {
         res.render('pages/error');
     }
 });

 app.get('/weight_change', function(req, res) {
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment={};
     if (fs.existsSync(file_json)) {
         fs.readFile(file_json, function readFileCallback(err, data) {
             if (err) {
                 console.log("err:"+err);
             } else {
                 obj_shipment = JSON.parse(data);
                 var dst_name = points_sale.points_sale[req.query.dot_dst]
                 var production =  goods_chicken[req.query.production];
/*                 if (obj_shipment.shipment[req.query.production][req.query.id_production] === undefined){
                     //console.log("create ves: " +req.query.ves+ " at product_d: "+req.query.id_production )
                     obj_shipment.shipment[req.query.production][req.query.id_production]=[];
                 }else {
                     //console.log("add ves " +req.query.ves+ " to product_d: " +  req.query.id_production );
                 }
*/
                 if ( typeof (req.query.weight_array)  === "undefined" ) {
                     obj_shipment.shipment[req.query.production][req.query.id_production] = [];
                 }else {
                     obj_shipment.shipment[req.query.production][req.query.id_production] = req.query.weight_array
                 }
                 var json = JSON.stringify(obj_shipment);
                 fs.writeFile(file_json, json);
                 var weight_array = obj_shipment.shipment[req.query.production][req.query.id_production]
                 res.render('pages/add_ves', {arr_ves: JSON.stringify(weight_array)} );
             }
         });
     }else {
         res.render('pages/error' );
     }
 });

 app.get('/ves', function(req, res) {
     if (( req.query.dot_dst === undefined ) ||  ( req.query.id_production === undefined )  ) {
         res.render('pages/error' );
     } else {
         var file_json = config.tmp_json+req.sessionID+".json";
         var obj_shipment={};
         if (fs.existsSync(file_json)) {
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     var dst_name = points_sale.points_sale[req.query.dot_dst]
                     var production =  goods_chicken[req.query.ps];
                     var production_name =  production.product[req.query.id_production];
                     var arr_weight=[];
                     if (typeof (obj_shipment.shipment[req.query.ps]) !== undefined )
                         if ( typeof obj_shipment.shipment[req.query.ps][req.query.id_production] !== undefined )
                             arr_weight = obj_shipment.shipment[req.query.ps][req.query.id_production];

                     res.render('pages/ves', {arr_weight: JSON.stringify(arr_weight), p_name: production_name, name: dst_name, id_dst: req.query.dot_dst, production: req.query.ps, id_production:req.query.id_production } );

                 }
             });
         }else {
             res.render('pages/error' );
         }
     }
 });
 app.get('/del_order', function(req, res) {
     var file_json = config.tmp_json+req.sessionID+".json";
     console.log(file_json);
     fs.unlinkSync(file_json);
     if (fs.existsSync(file_json)) {
         res.render('pages/error' );
     }else {
         res.render('pages/add_ves', {arr_ves: JSON.stringify( [] )} );
     }
 });
 app.get('/get_weight', function(req, res) {
        const execFile = require('child_process').execFile;
        const child = execFile('./start_read.sh', (error, stdout, stderr) => {
                if (error) {
                        console.error('stderr', stderr);
                } else {
                  var arr= stdout.split("\n\n");
		  var result_weight=0;
                  for ( var i=0; i< arr.length; i++){
                        //console.log("string: "+arr[i]);
                        var ves = arr[i].split("=");
                        var weight1="";
                        var sovp=0;
                        for (var ii=0; ii<ves.length; ii++){
                                if ((ves[ii].length==7) && (+ves[ii]) ) {
                                        var weight= ves[ii].split("").reverse().join("");
                                        if ( weight1.indexOf(weight) == -1 ) {
                                                weight1 += " " +weight;
                                        } else {
                                                sovp++;
                                                if ( sovp > 5 ) {
                                                        sovp=0;
							result_weight=weight;
                                                        console.log("stable: "+(+weight)+" same "+sovp + " i: "+i);
                                                }
                                        }
                               }
                        }
                        //console.log("stabel: " +weight1+ " sovp: " + sovp);
                  }
		  console.log('pages/add_ves', {set_weight: result_weight} );
		  res.render('pages/add_ves', {arr_ves: result_weight} );
                }
        });


 })
 app.get('/', function(req, res) {
    var file_json = config.tmp_json+req.sessionID+".json";
    var obj_shipment;
    if (fs.existsSync(file_json)) {
        //console.log("read files TO PAGE VES");
        fs.readFile(file_json, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                res.render('pages/error' );
            } else {
                obj_shipment = JSON.parse(data);
                //console.log(obj_shipment.shipment[0]);
                res.render('pages/index', {dst_point: obj_shipment.dst.id, points: JSON.stringify(points_sale)} );
            }
        });
    }else {
        res.render('pages/index', {dst_point: 0, points: JSON.stringify(points_sale)});
    }
 });


 
 app.get('/create_excel', function (req,res ) {
    g_dc.save_excel(config.tmp_json+req.sessionID+".json",res);
 });
 

 app.get('/type_select', function(req, res) {
     if ( req.query.dot_dst === undefined ) {
         res.render('pages/error' );
     } else {
        console.log(req.sessionID);
        var file_json = config.tmp_json+req.sessionID+".json";
        var obj_shipment={};
        if (fs.existsSync(file_json)) {
             //console.log("read files он уже есть :D");
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                     res.render('pages/error' );
                 } else {
                     //console.log("obj_shipment:")
                     obj_shipment = JSON.parse(data);
                     var shipment = obj_shipment.shipment;
                     //console.log(obj_shipment.shipment[0]);
                     res.render('pages/type_select', {shipment: JSON.stringify(shipment), name: dst_name, id_dst: req.query.dot_dst} );
                 }
             });
        }else {
             //файла нет грузим пустое
             var dst_name = points_sale.points_sale[req.query.dot_dst];
             res.render('pages/type_select', {shipment: JSON.stringify({}), name: dst_name, id_dst: req.query.dot_dst} );
        }
     };



 });
};

