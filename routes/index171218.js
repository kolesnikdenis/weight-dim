'use strict';
var fs =  require('fs');
var ejs =  require('ejs');
var request = require('request');
const axios = require('axios');
var g_dc = require('../code/save_excel.js');
var filter_json = require('../code/filter_contragent.js');
//var config = require('../config.json');
//var goods_chicken = require('../goods_chicken.json');
var goods_chicken={};
var zakaz = require('../zakaz.json');
//var points_sale = require('../points_sale.json');
var points_sale = {};
var price = {};
var points_store={};

var load_points_sale =()=>{
    var file_points_sale="./points_sale.json";
    if (fs.existsSync(file_points_sale)) {
        console.log("read_file points sale");
        fs.readFile(file_points_sale, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                points_sale = JSON.parse(data);
		console.log(Object.keys(points_sale).length);
            }
        })
    }
}


var load_store =()=>{
    var file_store_catalogue="./store_catalogue.json";
    if (fs.existsSync(file_store_catalogue)) {
        console.log("read_file point store");
        fs.readFile(file_store_catalogue, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                points_store = JSON.parse(data);
                console.log("points_store: ",Object.keys(points_store.store_catalogue).length);
            }
        })
    }
}


var load_price =()=>{
    var file_price="./price.json";
    if (fs.existsSync(file_price)) {
        console.log("read_file price file");
        fs.readFile(file_price, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                price = JSON.parse(data);
                console.log("load_price: ",Object.keys(load_price).length);
            }
        })
    }
}

var load_goods_chicken=()=>{
    var file_goods_chicken="./goods_chicken.json";
    if (fs.existsSync(file_goods_chicken)) {
        console.log("read_file");
        fs.readFile(file_goods_chicken, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                goods_chicken = JSON.parse(data);
		console.log(Object.keys(goods_chicken.chicken).length);
            }
        })
    }
}

var config={};
var load_config = () =>
{
    var config_file = "./config.json";
    if (fs.existsSync(config_file)) {
        console.log("load config files");
        fs.readFile(config_file, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                config = JSON.parse(data);
            }
        })
    }
}

setInterval(()=>{
    load_goods_chicken();
},600000);

setInterval(()=>{
    load_store();
},600000);
setInterval(()=>{
    load_config();
},300000);

setInterval(()=>{
    load_price();
},600000);
setInterval(()=> {
	load_points_sale(); 
},900000);

load_goods_chicken();
load_points_sale();
load_price();
load_store();
load_config();

module.exports = function(app) {
 app.get('/save_config',  function(req,res){
	console.log("save_config");
	console.log("new cfg weight url:",req.query.new_config_weight);
	var json_file="./config.json";
	if (fs.existsSync(json_file)) {
             console.log("read files");
             fs.readFile(json_file, function readFileCallback(err, data) {
                 if (err) {
			console.log(err);
			res.render('pages/add_ves', {arr_ves: [] } );
                 } else {
			var obj_config = JSON.parse(data);
			obj_config.weight_url = req.query.new_config_weight;
			console.log(obj_config);
			fs.writeFile(json_file, JSON.stringify(obj_config), (err) => {
 			 if (err){
				 throw err;
			 }
			 config = obj_config;
			 res.render('pages/add_ves', {arr_ves: JSON.stringify(obj_config.weight_url)} );
			});
                 }
             });
	}else { res.render('pages/add_ves', {arr_ves: [] } ); }
 });

 app.get('/show_setting', function(req, res){
	console.log(config.weight_url[0]);
     var arr_weight = config.weight_url;
	console.log(arr_weight);
	res.render('pages/setting', {arr_weight: JSON.stringify(arr_weight)} );
 });

 app.get('/select',  function(req, res) {
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment={};
     var store_price = price.store[points_store.id_in_1c[+req.query.dot_dst]];
     if (!store_price)store_price={};
     console.log(" points_store.id_in_1c:", points_store.id_in_1c)

     //console.log("store_price:", store_price, " req.query.dot_dst:",req.query.dot_dst,type_operation: req.query.type_operation, " points_store.id_in_1c[req.query.dot_dst]:",points_store.id_in_1c[+req.query.dot_dst])
     var dst_name="";

     if (( req.query.dot_dst === undefined ) ||  ( req.query.production === undefined )  ) {
         res.render('pages/error' );
     } else {
         console.log("req:",req.query);
         if ( req.query.type == "arrival" ) {
             dst_name = points_sale.points_sale[req.query.dot_dst];
         }else {
             if (req.query.destination_type=="contragent")
                 dst_name = points_sale.points_sale[req.query.dot_dst];
             else
                 dst_name = points_store.store_catalogue[req.query.dot_dst];
             console.log("type: ",req.query.type," dst_name: ",dst_name," destination_type: ",req.query.destination_type );

         }

         var production =  goods_chicken[req.query.production];
         if (fs.existsSync(file_json)) {
             console.log("read json files");
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     if (!dst_name) dst_name=obj_shipment.dst.name;


                     if ( obj_shipment.type == "arrival" ) {
                         dst_name = points_sale.points_sale[req.query.dot_dst];
                     }else {
                         if (obj_shipment.dst.destination_type=="contragent")
                             dst_name = points_sale.points_sale[req.query.dot_dst];
                         else
                             dst_name = points_store.store_catalogue[req.query.dot_dst];
                         console.log("111type: ",obj_shipment.type," dst_name: ",dst_name," 111destination_type: ",obj_shipment.destination_type );
                     }

                     res.render('pages/select', {filter_goods: JSON.stringify(config.filters_goods),rename_goods: JSON.stringify(config.rename_goods),store_price:  JSON.stringify(store_price),type_operation: obj_shipment.type, obj_shipment: JSON.stringify(obj_shipment), ps: req.query.production, name: dst_name, id_dst: req.query.dot_dst, goods_chicken: JSON.stringify(production),file:"1"} );
                 }
             });
         }else {
             var newDate = new Date(Date.now()+3*60*60*1000);
             newDate = newDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
             console.log("req:", req.query.dot_dst);
             var name="";
             var id_in_1c="";
             if (req.query.type == 'shipment') {
                req.query.type_operation= req.query.type;
                console.log("destination:", req.query.destination_type,"end");
                if (req.query.destination_type=="contragent"){
                    name = points_sale.points_sale[req.query.dot_dst];
		    id_in_1c  = points_sale.id_in_1c[(+req.query.dot_dst)];

		}
                else{
                    name=       points_store.store_catalogue[req.query.dot_dst];
		    id_in_1c =  points_store.id_in_1c[(+req.query.dot_dst)];

		}
             }
             else  {
                 id_in_1c=points_sale.id_in_1c[(+req.query.dot_dst)];
                 name = points_sale.points_sale[req.query.dot_dst];
             }
             obj_shipment=
		{  "dst":
                         {  "id": req.query.dot_dst,
                            "name": name,
                            "create_data_time": newDate,
			                "id_in_1c": id_in_1c,
                            "type_operation":  req.query.type_operation,
				            "destination_type": req.query.destination_type
                         },
                    "type": req.query.type,
                    "shipment": {}
             };
             obj_shipment.shipment[req.query.production] = {};
             var json = JSON.stringify(obj_shipment);

    	     console.log("save:",json);
             fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
             res.render('pages/select', {type_operation:req.query.type_operation, destination_type:req.query.destination_type,filter_goods: JSON.stringify(config.filters_goods),rename_goods: JSON.stringify(config.rename_goods),store_price: JSON.stringify(store_price), obj_shipment: JSON.stringify(obj_shipment), ps: req.query.production, name: dst_name, id_dst: req.query.dot_dst, goods_chicken: JSON.stringify(production),file:"1"} );
         }


     }
 });

 app.get('/ves_add', function(req, res) {
     console.log("-----  ves_add ------");
     var file_json = config.tmp_json+req.sessionID+".json";
     var obj_shipment={};
     if (fs.existsSync(file_json)) {
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log("err:"+err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     var production =  goods_chicken[req.query.production];
                     var price_product={Description: "", Price: 0};
                     if ( price.store[obj_shipment.dst.id_in_1c] && price.store[obj_shipment.dst.id_in_1c][req.query.id_production] )
                        price_product= price.store[obj_shipment.dst.id_in_1c][req.query.id_production];


                     //store
                     var contact_person="";
                     var shop_name="";


                     if ( obj_shipment.type=="shipment"){
                         if ( points_store.person )
                            contact_person = points_store.person[obj_shipment.dst.id_in_1c];
                         else
                             contact_person ="";
                         shop_name = points_store.store_catalogue[obj_shipment.dst.id];
                         console.log("shop_name:", shop_name, " obj_shipment.dst.id_in_1c: ",obj_shipment.dst.id_in_1c);
                     }else {
                         console.log("obj_shipment.dst.id:",obj_shipment.dst.id );
                         for (var i=0; i<Object.keys(points_sale.points_sale).length; i++ ) {
                             if ( +Object.keys(points_sale.points_sale)[i] == obj_shipment.dst.id ) {
                                 shop_name = Object.values(points_sale.points_sale)[i]
                                 console.log("i: ", i , " shop_name: ", shop_name , " + ",Object.keys(points_sale.points_sale)[i])
                             }

                         }
                     }

                     console.log("--------------------------");
                     console.log("do:",obj_shipment.shipment[req.query.production])
                     if (obj_shipment.shipment[req.query.production] === undefined){
                         obj_shipment.shipment[req.query.production]={};
                     }
                     console.log(req.query.production,obj_shipment.shipment[req.query.production])
                     console.log("--------------------------");
                     if (obj_shipment.shipment[req.query.production][req.query.id_production] === undefined){
                         console.log("create ves: " +req.query.ves+ " at product_d: "+req.query.id_production )
                         obj_shipment.shipment[req.query.production][req.query.id_production]=[];

                         if (!obj_shipment['price_product'])obj_shipment['price_product']={};
                         if (!obj_shipment['price_product'][req.query.production])obj_shipment['price_product'][req.query.production]={}
                         if (!obj_shipment['price_product'][req.query.production][req.query.id_production]) obj_shipment['price_product'][req.query.production][req.query.id_production]= "";


                         if ( !obj_shipment['contragent_name'] ) obj_shipment['contragent_name']={}
                         if ( !obj_shipment['contragent_name'][req.query.production] ) obj_shipment['contragent_name'][req.query.production]={};
                         if ( !obj_shipment['contragent_name'][req.query.production][req.query.id_production]) obj_shipment['contragent_name'][req.query.production][req.query.id_production]="";

                         if (!obj_shipment['contact_person'])obj_shipment['contact_person']={};
                         if (!obj_shipment['contact_person'][req.query.production])obj_shipment['contact_person'][req.query.production]={};
                         if (!obj_shipment['contact_person'][req.query.production][req.query.id_production])obj_shipment['contact_person'][req.query.production][req.query.id_production]="";

                         if (!obj_shipment['contragent_descr'])obj_shipment['contragent_descr']={};
                         if (!obj_shipment['contragent_descr'][req.query.production])obj_shipment['contragent_descr'][req.query.production]={};
                         if (!obj_shipment['contragent_descr'][req.query.production][req.query.id_production])obj_shipment['contragent_descr'][req.query.production][req.query.id_production]="";

                         /*
                         obj_shipment.shipment[req.query.production]['price_product']={};
                         obj_shipment.shipment[req.query.production]['price_product'][req.query.id_production]="";
                         obj_shipment.shipment[req.query.production]['contragent_name']={};
                         obj_shipment.shipment[req.query.production]['contragent_name'][req.query.id_production]="";
                         obj_shipment.shipment[req.query.production]['contact_person']={};
                         obj_shipment.shipment[req.query.production]['contact_person'][req.query.id_production]="";
                         obj_shipment.shipment[req.query.production]['contragent_descr']={};
                         obj_shipment.shipment[req.query.production]['contragent_descr'][req.query.id_production]="";
                         */
                     }else {
                         console.log("не могу сохранить " +req.query.ves+ + "req.query.production: " + req.query.production+" to id product: " +  req.query.id_production );
                     }
                     console.log(" contact_person: ",contact_person," shop_name: ",shop_name, " price_product: ", price_product );

                     obj_shipment.price_product[req.query.production][req.query.id_production]=price_product;
                     obj_shipment.contact_person[req.query.production][req.query.id_production]=contact_person;
                     obj_shipment.contragent_name[req.query.production][req.query.id_production]=shop_name;
                     obj_shipment.shipment[req.query.production][req.query.id_production].push(req.query.ves);

                     var json = JSON.stringify(obj_shipment);

                     fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
                     var arr_ves = obj_shipment.shipment[req.query.production][req.query.id_production]
                     res.render('pages/add_ves', {arr_ves: JSON.stringify(arr_ves ),file:"1"} );

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
                 fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
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
                 if ( typeof (req.query.weight_array)  === "undefined" ) {
                     obj_shipment.shipment[req.query.production][req.query.id_production] = [];
                 }else {
                     obj_shipment.shipment[req.query.production][req.query.id_production] = req.query.weight_array
                 }
                 var json = JSON.stringify(obj_shipment);
                 fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
                 var weight_array = obj_shipment.shipment[req.query.production][req.query.id_production]
                 res.render('pages/add_ves', {arr_ves: JSON.stringify(weight_array),file:"1"} );
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
                     console.log("dot_dst:  ",req.query.dot_dst);
                     obj_shipment = JSON.parse(data);

                     var dst_name="";/*
                     if ( req.query.type == "arrival" ) {
                         dst_name = points_sale.points_sale[req.query.dot_dst];
                     }else {
                         dst_name = points_store.store_catalogue[req.query.dot_dst];
                     }*/

			    if ( obj_shipment.type == "arrival" ) {
			       dst_name = points_sale.points_sale[req.query.dot_dst];
			     }else {
				if (obj_shipment.dst.destination_type=="contragent")
					dst_name = points_sale.points_sale[req.query.dot_dst];
				else
					dst_name = points_store.store_catalogue[req.query.dot_dst];
		              }




                     var production =  goods_chicken[req.query.ps];
                     var production_name =  production.product[req.query.id_production];
                     var arr_weight=[];
                     if (typeof (obj_shipment.shipment[req.query.ps]) !== undefined )
                         if ( obj_shipment.shipment[req.query.ps] && obj_shipment.shipment[req.query.ps][req.query.id_production] && typeof obj_shipment.shipment[req.query.ps][req.query.id_production] !== undefined )
                             arr_weight = obj_shipment.shipment[req.query.ps][req.query.id_production];
                        else {
                            //add type abd goods //05.12.2018
                             /*
                             obj_shipment.shipment[req.query.ps]={};
                             obj_shipment.shipment[req.query.ps][req.query.id_production]={};
                             arr_weight = obj_shipment.shipment[req.query.ps][req.query.id_production];
                             //var file_json = config.tmp_json+req.sessionID+".json";
                             fs.writeFile(file_json , JSON.stringify(obj_shipment), (err) => {
                                 if(err) {
                                     throw err;
                                 }
                             });
                             */
                         }

                     console.log("dst_name:",obj_shipment.dst.name);
                     if (!dst_name) dst_name=obj_shipment.dst.name;
                     res.render('pages/ves', {arr_weight: JSON.stringify(arr_weight),type_operation: obj_shipment.type, p_name: production_name, name: dst_name, id_dst: req.query.dot_dst, production: req.query.ps, id_production:req.query.id_production } );

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
     if (fs.existsSync(file_json)){
      fs.unlinkSync(file_json);
      if (fs.existsSync(file_json)) {
         res.render('pages/error' );
      }
     }
         res.render('pages/add_ves', {arr_ves: JSON.stringify( [] )} );
 });
/*
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
					//console.log("w:",weight);
                                        if ( weight1.indexOf(weight) == -1 ) {
                                                weight1 += " " +weight;
                                        } else {
                                                sovp++;
                                                if ( sovp > 5 ) {
                                                        sovp=0;
							result_weight=weight;
                                                        //console.log("stable: "+(+weight)+" same "+sovp + " i: "+i);
                                                }
                                        }
                               }
                        }
                        console.log("stabel: " +weight1+ " sovp: " + sovp);
                  }
		  console.log('pages/add_ves', {set_weight: result_weight} );
		  res.render('pages/add_ves', {arr_ves: result_weight} );
                }
        });
 })
*/


app.get('/get_weight_arr', function(req, res) {
 console.log( "get: ",config.weight_url[0] );
   axios.get(config.weight_url[0])
  .then(response => {
                  var stdout=response.data
                  var arr= stdout.split("\n\n");
                  var result_weight=0;
                  for ( var i=0; i< arr.length; i++){
                        //console.log("string: "+arr[i]);
                        var ves = arr[i].split("=");
                        var weight=[];
                        var sovp=0;
                        for (var ii=0; ii<ves.length; ii++){
                                if ( ves[ii])  {
                                        weight.push(ves[ii].split("").reverse().join(""));

                                        
                               }
                        }
			res.render('pages/add_ves', {arr_ves: JSON.stringify(weight)} );
			console.log('weight:',weight);
                }
                //res.render('pages/add_ves', {arr_ves: result_weight} );



  })
  .catch(error => {
    console.log(error);
  });

})



app.get('/get_weight', function(req, res) {
 console.log( "get: ",config.weight_url[0] );
	/*
   axios.get(config.weight_url[0])
  .then(response => {
                  var stdout=response.data
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
                                        //console.log("w:",weight);
                                        if ( weight1.indexOf(weight) == -1 ) {
                                                weight1 += " " +weight;
                                        } else {
                                                sovp++;
                                                if ( sovp > 5 ) {
                                                        sovp=0;
                                                        result_weight=weight;
                                                        //console.log("stable: "+(+weight)+" same "+sovp + " i: "+i);
                                                }
                                        }
                               }
                        }
                        console.log("stabel: " +weight1+ " sovp: " + sovp);
                }
                res.render('pages/add_ves', {arr_ves: result_weight} );



  })
  .catch(error => {
    console.log(error);
  });
	
*/
	res.render('pages/add_ves', {arr_ves: "1100.2"});
})
 app.get('/sel_products', function(req, res) {
    var file_json = config.tmp_json+req.sessionID+".json";
    var obj_shipment={};

    if (fs.existsSync(file_json)) {
        fs.readFile(file_json, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                res.render('pages/error' );
            } else {
                obj_shipment = JSON.parse(data);
                console.log("tyy;",obj_shipment, "type:", obj_shipment.type);
            }
        });
    }


    if (fs.existsSync(file_json) && obj_shipment.type &&  obj_shipment) {
 //       if (obj_shipment.type == "shipment") {
            console.log("load STORE o");
            res.render('pages/sel_products', {
                dst_point: obj_shipment.dst.id,
                type_operation: obj_shipment.type,
                points_store: JSON.stringify(points_store),
		points_contragent: JSON.stingify(points_sale),
		filters: JSON.stringify(config.filters)
            });
 /*       } else {
            console.log("load CONTRAGENT o");
            res.render('pages/sel_products', {
                dst_point: obj_shipment.dst.id,
                type_operation: obj_shipment.type,
                points_store: JSON.stringify(points_sale),
		points_contragent: "{}"
            });
        }
	*/
    }else {
        console.log(req.query)
 //       if (req.query.type == "shipment") {
            console.log("load STORE");
            var f_points_store=filter_json.filter_out(points_store);

            console.log("do",filter_json.filter_out(points_store));
            res.render('pages/sel_products', {
                dst_point: 0,
                type_operation: req.query.type,
                points_store: JSON.stringify(f_points_store),
		points_contragent: JSON.stringify(points_sale),
		filters: JSON.stringify(config.filters)
	    });
 /*       } else {
            console.log("load CONTRAGENT");
            res.render('pages/sel_products', {
                dst_point: 0,
                type_operation: req.query.type,
                points_contragent: JSON.stringify(points_sale),
		pints_store: JSON.stringify(poits_store)
            });
            console.log( JSON.stringify(points_sale))
        }
 */
    }

//        res.render('pages/sel_products', {dst_point: 0, type_operation: req.query.type, points: JSON.stringify(points_sale)});

 });
    app.get('/', function(req, res) {
        var file_json = config.tmp_json+req.sessionID+".json";
        var obj_shipment;
        if (fs.existsSync(file_json)) {
            fs.readFile(file_json, function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                    res.render('pages/error' );
                } else {
                    obj_shipment = JSON.parse(data);
                    //console.log(obj_shipment.shipment[0]);
                    res.render('pages/index', {dst_point: obj_shipment.dst.id, type_operation:"",points: JSON.stringify(points_sale,file:"1")} );
                }
            });
        }else {
            res.render('pages/index', {dst_point: 0, type_operation:"", points: JSON.stringify(points_sale),file:"0"});
        }
    });

 

function copyFile(source, target, cb) {
  var cbCalled = false;
  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
      done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
      done(err);
  });
  wr.on("close", function(ex) {
      done("copy ok");
  });
  rd.pipe(wr);

  function done(err) {
   if (!cbCalled) {
	 cb(err);
 	 cbCalled = true;
   }
  }
}

app.get('/send_to_1c', function (req,res) {
    var save_json = config.tmp_json+req.sessionID+".json";
    console.log("file:",save_json);
    var newnamejson = new Date(Date.now()+3*60*60*1000);
    newnamejson= newnamejson.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".json";
    res.render('pages/send_to_1c', {message: ["ok"]});
    copyFile(save_json,config.to_send_1c+"/"+newnamejson,function(ret){console.log(ret)});
    fs.unlinkSync(save_json);
})
 app.get('/create_invoice', function (req,res ) {
	var save_json = config.tmp_json+req.sessionID+".json";
	console.log("file:",save_json);
	var file;
	 if (fs.existsSync(save_json)){
		 fs.readFile(save_json, function readFileCallBack(err,data) {
		    var print=0;
		    if (req.query.print) {
			print = req.query.print;
			var template = fs.readFileSync('/var/www/html/weight/views/pages/invoice_print.ejs', 'utf8');
			var file = JSON.parse(data);
			var home = ejs.render(template,{json: JSON.stringify(file), price: JSON.stringify(store_price), goods_chicken: JSON.stringify(goods_chicken)});
			fs.writeFile("/var/www/html/weight/print.html",home, (err) => {
			 if(err) {
			  throw err;
			 }
			});

            } else {
                file = JSON.parse(data);
                console.log(file);
                var store_price = price.store[file.dst.id_in_1c];
                var html=res.render('pages/invoice', {
                    print: print,
                    json: JSON.stringify(file),
                    price: JSON.stringify(store_price),
                    goods_chicken: JSON.stringify(goods_chicken)
                });
                fs.writeFileSync("./print.html", html, 'utf8');
            }
		 })
	 }
	 else { res.render('pages/error' ) };
 });

 app.get('/create_excel', function (req,res ) {
 	var save_json=config.tmp_json+req.sessionID+".json"
     console.log("file:",save_json);
	var save_json_file;
	if (fs.existsSync(save_json)) {
		fs.readFile(save_json, function readFileCallback(err, data) {
		 if (err) {
			console.log(err);
		 } else {
			save_json_file = JSON.parse(data);
             var store_price = price.store[save_json_file.dst.id_in_1c];
             var to_person=" Колесник Денис";
             var from_person="Солонина Максим";
             g_dc.save_excel(config.to_send_1c+"/"+newnamejson,res,store_price,from_person,to_person);
		 }
		})
	}
	 var newnamejson = new Date(Date.now()+3*60*60*1000);
	 newnamejson= newnamejson.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".json";

    copyFile(save_json,config.to_send_1c+"/"+newnamejson,function(ret){console.log(ret)});
    console.log("del:"+save_json);
    fs.unlinkSync(save_json);



 });
 

 app.get('/type_select', function(req, res) {
     var store_price = price.store[points_store.id_in_1c[req.query.dot_dst]];
     console.log("req.query.dot_dst: ", req.query)
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
                     obj_shipment = JSON.parse(data);
                     var shipment = obj_shipment.shipment;
                     res.render('pages/type_select', {storeprice: JSON.stringify(store_price),shipment: JSON.stringify(shipment), name: dst_name, id_dst: req.query.dot_dst, type_operation: obj_shipment.type, destination_type: obj_shipment.destination_type,file:"1"} );
                 }
             });
        }else {
	    if ( req.query.type_operation == "shipment" ) {
                var dst_name = points_sale.points_sale[req.query.dot_dst];
		console.log("rqdt1:",req.query.destination_type);
		    if ( req.query.destination_type =="store" ) {
			     dst_name = points_store.store_catalogue[req.query.dot_dst];
		    }
            }else {
                 dst_name = points_sale.points_sale[req.query.dot_dst];
            }
            res.render('pages/type_select', {
                    shipment: JSON.stringify({}),
                    name: dst_name,
                    id_dst: req.query.dot_dst,
                    type_operation: req.query.type_operation,
		    type: req.query.type,		    
                    storeprice: JSON.stringify(store_price),
                    destination_type: req.query.destination_type,
		    file:"0"
                });
        }
     };



 });

};
