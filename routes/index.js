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
var points_store={}

var load_points_sale =()=>{

    var file_points_sale="./points_sale.json";
    if (fs.existsSync(file_points_sale)) {
        console.log("read_file points sale");
        fs.readFile(file_points_sale, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                points_sale = JSON.parse(data);
		//console.log(Object.keys(points_sale).length);
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
                //console.log("points_store: ",Object.keys(points_store.store_catalogue).length);
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
                //console.log("load_price: ",Object.keys(load_price).length);
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

 app.get('/list_deferred', function (req,res){
     var testFolder = config.tmp_json;
     var promis_arr=[];
     var count_file=0;
    var return_obj={};
     const read_file = (path_to_file) => { return new Promise((resolve, reject) => {
         fs.readFile(path_to_file, function readFileCallback(err, data) {
             if (err){ reject(err); }
             else {
                 resolve({"data": data, "file_name": path_to_file})
                 count_file++;
                 return_obj[count_file]={"file_path":path_to_file,from:"",to:"",datatime:"",type:""};
		     if ( data.length>5) {
                 var in_obj=JSON.parse(data);
		     if ( in_obj && in_obj.dst.type_operation){
                 if ( in_obj.dst.type_operation=="arrival"){
                     return_obj[count_file].from=in_obj.dst.name;
                     return_obj[count_file].to="основной склад";
                 }else {
                     return_obj[count_file].to=in_obj.dst.name;
                     return_obj[count_file].from="основной склад";
                 }
                 return_obj[count_file].type=in_obj.dst.type_operation;
                 return_obj[count_file].datatime=in_obj.dst.create_data_time;
		     }
		     } else {
			return_obj[count_file].type="arrival";
			return_obj[count_file].datatime="";
			return_obj[count_file].to="error";
			return_obj[count_file].from="error";
		     }

             }
         })
      })
    }
    fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
        promis_arr.push(read_file(testFolder + file).then(
            res => {
                read_file(testFolder + file, function readFileCallback(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("d:", data);
                        result =>		{data};
                    }
                })
            }
         ))
     })


     Promise.all(promis_arr.map(p => p.catch(x => console.log(x)) )).then(
         r => {
         count_file++;
     //res.render('pages/add_ves', { arr_ves: JSON.stringify({arr_ves: return_obj }),file:"1"} );


     res.write(JSON.stringify({return_obj }));
     res.end()
 },
     t =>{	console(t);}
 );
 })

 })


    app.get('/summary_report', function (req,res) {
        var data=req.query.data;
        console.log(data);
        res.render('pages/summary_report', {
            data: JSON.stringify({"data":data})
        });
    })

    app.get('/show_invoice', function (req,res) {
        console.log(req.query);
        var date=req.query.datetime;
        var way=req.query.way;
        var id=req.query.id;

        var file_json="./soap_send/full_obj.json";
        if (fs.existsSync(file_json)) {
            fs.readFile(file_json, function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                    res.render('pages/error');
                } else {
                    var obj_shipment = JSON.parse(data);
                    var show_invoice = obj_shipment[way][id][date];
                    if  ( JSON.stringify(show_invoice).length>10 ) {
                        res.render('pages/show_archive_invoice', {
                            show_invoice: JSON.stringify(show_invoice),
                            way: JSON.stringify({"path":way}),
			    date:JSON.stringify({"date":date})
                        });
                    }
                }
            })
        }


    })
    app.get('/list_transaction', function (req,res){
        function interval(date1, date2) {
            if (date1 > date2) { // swap
                var result = interval(date2, date1);
                result.years  = -result.years;
                result.months = -result.months;
                result.days   = -result.days;
                result.hours  = -result.hours;
                return result;
            }
            result = {
                years:  date2.getYear()  - date1.getYear(),
                months: date2.getMonth() - date1.getMonth(),
                days:   date2.getDate()  - date1.getDate(),
                hours:  date2.getHours() - date1.getHours()
            };
            if (result.hours < 0) {
                result.days--;
                result.hours += 24;
            }
            if (result.days < 0) {
                result.months--;
                var copy1 = new Date(date1.getTime());
                copy1.setDate(32);
                result.days = 32-date1.getDate()-copy1.getDate()+date2.getDate();
            }
            if (result.months < 0) {
                result.years--;
                result.months+=12;
            }
            return result;
        }
        var a = new Date(); // Current date now.
        var b = new Date();
        b.setDate(b.getDate() - 2);

        var file_json="./soap_send/full_obj.json";
        if (fs.existsSync(file_json)) {
            fs.readFile(file_json, function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                    res.render('pages/error' );
                } else {
                    var obj_shipment = JSON.parse(data);
                    if ( req.query.list == 1 ) {
                        function way_show(way, count, out) {
                            Object.keys(obj_shipment[way]).map(function (value, key) {
                                var count_tare = 0;
                                var count_product = 0;

                                Object.keys(obj_shipment[way][value]).map(function (date_m, key_m) {
                                    b = new Date(date_m);

                                    var result_interval = interval(b, a);
                                    if (result_interval.years == 0 && result_interval.months == 0 && result_interval.days <= 2) {
                                        var show = 0;

                                        Object.keys(obj_shipment[way][value][date_m]).map(function (type_prod_value, type_prod_key) {
                                            if (type_prod_value != "package") {
                                                Object.keys(obj_shipment[way][value][date_m][type_prod_value]).map(function (prod_value, prod_key) {
                                                    if (show == 0) {
                                                        show = 1;
                                                        if (!out[way][date_m]) {
                                                            out[way][date_m] = {}
                                                        }
                                                        if (!out[way][date_m][value]) {
                                                            out[way][date_m][value] = {}
                                                        }
                                                        out[way][date_m][value] = {
                                                            "datatime": date_m,
                                                            "contragent_name": obj_shipment[way][value][date_m][type_prod_value][prod_value].contragent_name,
                                                            "count_product": count_product,
                                                            "count_tare": count_tare
                                                        };
                                                    }
                                                    if ( obj_shipment[way][value][date_m][type_prod_value][prod_value].weight.length>0)
                                                        count_product++;
                                                    if (out[way] && out[way][date_m] && out[way][date_m][value]) {
                                                        out[way][date_m][value].count_product = count_product;
                                                    }
                                                })
                                            } else {
                                                //console.log(obj_shipment[way][value][date_m][type_prod_value]);
                                                Object.keys(obj_shipment[way][value][date_m][type_prod_value]).map(function (tare_id) {
                                                    if (out[way] && out[way][date_m] && out[way][date_m][value]) {
                                                        if  (+obj_shipment[way][value][date_m][type_prod_value][tare_id].Quantity > 0 )
                                                            out[way][date_m][value].count_tare += +obj_shipment[way][value][date_m][type_prod_value][tare_id].Quantity;
                                                        else
                                                            console.log("error package: ",obj_shipment[way][value][date_m][type_prod_value][tare_id].Quantity)

                                                    }
                                                })

                                            }
                                        })
                                    }

                                })
                            })
                            return out;
                        };
                        var count=0;
                        var out={arrival:{},shipment:{}};
                        out = way_show("shipment",count,out);
                        out= way_show("arrival",count,out);
                        res.write(JSON.stringify(out));
                        res.end();
                    } else {
                        function way_show(way, count, out) {
                            Object.keys(obj_shipment[way]).map(function (value, key) {
                                Object.keys(obj_shipment[way][value]).map(function (date_m, key_m) {
                                    b = new Date(date_m);
                                    var result_interval = interval(b, a);
                                    if (result_interval.years == 0 && result_interval.months == 0 && result_interval.days <= 1) {
                                        var show = 0;
                                        var count_tare = 0;
                                        var count_product = 0;
                                        Object.keys(obj_shipment[way][value][date_m]).map(function (type_prod_value, type_prod_key) {
                                            if (type_prod_value != "package") {
                                                Object.keys(obj_shipment[way][value][date_m][type_prod_value]).map(function (prod_value, prod_key) {
                                                    var sum  = obj_shipment[way][value][date_m][type_prod_value][prod_value].weight;
                                                    var summ = 0;
                                                    for (var t = 0; t < sum.length; t++) {
                                                        var st = sum[t];
                                                        summ = parseFloat(summ) + parseFloat(st);
                                                    }
                                                    var contragent_name = obj_shipment[way][value][date_m][type_prod_value][prod_value].price_product.Description;
                                                    var date_set= date_m.substr(0,10);
                                                    if  ( !out[way][date_set] ) {out[way][date_set]={}};
                                                    if ( !out[way][date_set][prod_value] ) { out[way][date_set][prod_value]={"descr":contragent_name,"sum":summ,"UnitOfMeasure":"кг"}}
                                                    else {
                                                        out[way][date_set][prod_value].sum +=summ;
                                                    }
                                                    count_product++;
                                                    if (out[way] && out[way][date_m] && out[way][date_m][value]) {
                                                        out[way][date_m][value].count_product = count_product;
                                                    }
                                                })
                                            } else {
                                                var date_set= date_m.substr(0,10);
                                                if ( !out[way][date_set] ){out[way][date_set]={}};
                                                Object.keys(obj_shipment[way][value][date_m][type_prod_value]).map(function (prod_value, prod_key) {

                                                    if ( !out[way][date_set] ){out[way][date_set][prod_value]={}};

                                                    var p=obj_shipment[way][value][date_m][type_prod_value][prod_value]
                                                    if  ( p.Quantity > 0) {
                                                        if (!out[way][date_set][prod_value]) {
                                                            out[way][date_set][prod_value] = {
                                                                "descr": p.ItemDescription,
                                                                "sum": +p.Quantity,
                                                                "UnitOfMeasure": p.UnitOfMeasure
                                                            }
                                                        } else {
                                                            //console.log("else:",prod_value,date_set,p.Quantity,out[way][date_set][prod_value].sum);
                                                            out[way][date_set][prod_value].sum +=+p.Quantity;
                                                        }
                                                    }
                                                    /**/
                                                })
                                            }
                                        })
                                    }

                                })
                            })
                            return out;
                        };
                        var count = 0;
                        var out = {arrival: {}, shipment: {}};
                        out = way_show("shipment", count, out);
                        out = way_show("arrival", count, out);
                        res.write(JSON.stringify(out));
                        res.end();
                    }

                }
            });
        }else {
            es.write(JSON.stringify({error:"ошибка загрузки файла"}));
            res.end();
        }

    })
app.get("/select_invoice",function(req,res){
    var out={error:"",file:{}};
    var obj_shipment={};
    if ( req.session.file && req.session.file.length>5 ) {
        console.log(req.query);
        out.error="вы еще не закрыли предыдущую накладную";
        res.write(JSON.stringify(out));
        res.end();
    }else {
        console.log("test",req.query);
        req.session.file=req.query.load_invoice_file;
        if (fs.existsSync(req.session.file)) {
            fs.readFile(req.session.file, function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    obj_shipment = JSON.parse(data);
                    out.file=obj_shipment;
                    res.write(JSON.stringify(out));
                    res.end();
                }
            })
        }
    }

});
 app.get('/select',  function(req, res) {
     var file_json;//=config.tmp_json + req.sessionID + ".json";
/*
     if (req.session.file == "new") {
         req.session.regenerate(function (err) {
             req.session.file = config.tmp_json + req.sessionID + ".json";
             console.log("new sessionid:", req.session.file);
         });
     }*/
    console.log(req.session.file)
     if ( req.session.file && req.session.file.length>5 ) {
	     console.log("file exist:", req.session.file);
         file_json = req.session.file;
     }else {
        console.log("set new file:");
         req.session.file = config.tmp_json + req.sessionID + ".json";
         file_json=req.session.file;
         console.log("session id and file : ",file_json)
         req.session.regenerate(function (err) {
             req.session.file = config.tmp_json + req.sessionID + ".json";
             file_json=req.session.file;
             console.log("new sessionid:", req.session.file);

         });
	    console.log(req.session.file);
     }
     var obj_shipment={};
     var store_price = price.store[points_store.id_in_1c[+req.query.dot_dst]];
     if (!store_price)store_price={};
     var dst_name="";
     var show_pages='pages/select';
     if (( req.query.dot_dst === undefined ) ||  ( req.query.production === undefined )  ) {
         res.render('pages/error' );
     } else {
         //console.log("req:",req.query);
         if ( req.query.type == "arrival" ) {
             show_pages='pages/select';
             //console.log("11",show_pages);
             dst_name = points_sale.points_sale[req.query.dot_dst];
         }else {
             show_pages='pages/select-shipment';
             //console.log("22",show_pages);
             if (req.query.destination_type=="contragent")
                 dst_name = points_sale.points_sale[req.query.dot_dst];
             else
                 dst_name = points_store.store_catalogue[req.query.dot_dst];
             //console.log("type: ",req.query.type," dst_name: ",dst_name," destination_type: ",req.query.destination_type );

         }

         var production =  goods_chicken[req.query.production];
	     console.log("read file: ",file_json);
         if (fs.existsSync(file_json)) {
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                 } else {
                     obj_shipment = JSON.parse(data);
                     if (!dst_name) dst_name=obj_shipment.dst.name;
			
                     if ( obj_shipment.type == "arrival" ) {
                         dst_name = points_sale.points_sale[req.query.dot_dst];
                         show_pages='pages/select';
                         console.log("1",show_pages);
                     } else {
                         show_pages='pages/select-shipment';
                         console.log("2",show_pages);
                         if (obj_shipment.dst.destination_type=="contragent") {
                             dst_name = points_sale.points_sale[req.query.dot_dst];
                         } else {
                             dst_name = points_store.store_catalogue[req.query.dot_dst];
                         }
                         console.log("111type: ",obj_shipment.type," dst_name: ",dst_name," 111destination_type: ",obj_shipment.destination_type );
                     }
		     console.log(req.query);
                     if ( req.query.type ) {
                         if (  req.query.type == "arrival"  )  {
                             console.log("3",show_pages);
                             show_pages='pages/select';
                         } else {
                             show_pages='pages/select-shipment';
                             console.log("4",show_pages,req.query.type );
                         }
                     }
                     res.render(show_pages, {
                         arr_packages: JSON.stringify(obj_shipment.package),
                         filter_goods: JSON.stringify(config.filters_goods),
                         rename_goods: JSON.stringify(config.rename_goods),
                         store_price: JSON.stringify(store_price),
                         type_operation: obj_shipment.type,
                         obj_shipment: JSON.stringify(obj_shipment),
                         ps: req.query.production,
                         name: dst_name,
                         id_dst: req.query.dot_dst,
                         goods_chicken: JSON.stringify(production),
                         file: "1",
                         sort: JSON.stringify(config.sort[req.query.production])
                     });
                 }
             });
         }else {
             var newDate = new Date(Date.now()+2*60*60*1000)
             newDate = newDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
             console.log("req:", req.query.dot_dst);
             var name="";
             var id_in_1c="";
	     var destination_type="";
	     var type_operation="";
	     var show_page='pages/select';
             if (req.query.type == 'shipment') {
                show_page='pages/select-shipment';
                console.log("b",show_page);
                req.query.type_operation= req.query.type;
		        type_operation="shipment";
                console.log("destination:", req.query.destination_type,"end");
                if (req.query.destination_type=="contragent"){
                    name = points_sale.points_sale[req.query.dot_dst];
		            id_in_1c  = points_sale.id_in_1c[(+req.query.dot_dst)];
		            destination_type="contragent";
		        }else{
                    name= points_store.store_catalogue[req.query.dot_dst];
                    id_in_1c =  points_store.id_in_1c[(+req.query.dot_dst)];
                    destination_type="store";
        		}
             } else  {
                 show_page='pages/select';
                 type_operation="arrival";
                 id_in_1c=points_sale.id_in_1c[(+req.query.dot_dst)];
                 name = points_sale.points_sale[req.query.dot_dst];
                 destination_type="contragent";
             }
             obj_shipment=
		{  "dst":
                {  "id": req.query.dot_dst,
                    "name": name,
                    "create_data_time": newDate,
			        "id_in_1c": id_in_1c,
                    "type_operation":  type_operation,
			        "destination_type":destination_type
                },
		    "package":{

            },
			"type_package": {},
                    "type": req.query.type,
                    "shipment": {}
             };
             Object.keys(goods_chicken.package.product).forEach(function (e){
                 if (typeof(obj_shipment.package) == "undefined" ) {
                     test['packages']={};
                 }
                 if ( typeof(obj_shipment.package[e]) == "undefined" ) {
                     obj_shipment.package[e] = {};
                 }

                 obj_shipment.package[e]={
                     "ItemDescription":goods_chicken.package.product[e],
                     "UnitOfMeasure":"шт",
                     "Quantity":"0"
                 }
                 console.log("e",obj_shipment.package[e]);

             });
             obj_shipment.shipment[req.query.production] = {};
             var json = JSON.stringify(obj_shipment);
             fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
//tyt session file
             res.render(show_page, { arr_packages: JSON.stringify(obj_shipment.package),type_operation:req.query.type_operation, destination_type:req.query.destination_type,filter_goods: JSON.stringify(config.filters_goods),rename_goods: JSON.stringify(config.rename_goods),store_price: JSON.stringify(store_price), obj_shipment: JSON.stringify(obj_shipment), ps: req.query.production, name: dst_name, id_dst: req.query.dot_dst, goods_chicken: JSON.stringify(production),file:"1", sort: JSON.stringify(config.sort[req.query.production])} );
         }


     }
 });


 app.get('/deferred',function (req,res){ 
	 deferred(req,res)
 })

 app.get('/report', function (req,res){ 
	report(req,res);
 })

 app.get('/session', function (req,res) {
     req.session.file="new";
     res.write(JSON.stringify({session:"ok" }));
     res.end()
 } );
 function deferred(req,res){
	 console.log(req.session.file);
	 	var file = {"file":0};
	 if ( req.session.file ) {
		 file = {"file": req.session.file};
	 }
	 res.render("pages/deferred",{file: JSON.stringify(file) });

 }
 function report(req,res){
	 console.log("report");
	 res.render("pages/report",{});
 }

 function ves_add(req,res){
     console.log("-----  ves_add ------");
     var file_json = req.session.file;
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

                 if ( goods_chicken[req.query.production] && goods_chicken[req.query.production].product[req.query.id_production] )
                     price_product.Description=goods_chicken[req.query.production].product[req.query.id_production];

                 //console.log("eee:",price_product, req.query.production,req.query.id_production);
                 //console.log("eee1:", goods_chicken[req.query.production][req.query.id_production]);
                 var contact_person="";
                 var shop_name="";


                 if ( obj_shipment.type=="shipment"){
                     if ( points_store.person )
                         contact_person = points_store.person[obj_shipment.dst.id_in_1c];
                     else
                         contact_person ="";
                     console.log("destination_type: - > ", obj_shipment.dst.destination_type );

                     console.log('shop_name -> ',shop_name);

                     if ( obj_shipment.dst.destination_type == "store" ) {
                         console.log("STORE!!!",obj_shipment.dst.id)
                         shop_name = points_store.store_catalogue[obj_shipment.dst.id];
                         console.log("  ->",shop_name)
                     } else {
                         console.log("no store:",obj_shipment.dst.destination_type)
                         shop_name = points_sale.points_sale[obj_shipment.dst.id];
                     }
                     console.log("shop name : ",shop_name,"end");
                 }else {
                     console.log("obj_shipment.dst.id:",obj_shipment.dst.id );
                     for (var i=0; i<Object.keys(points_sale.points_sale).length; i++ ) {
                         if ( +Object.keys(points_sale.points_sale)[i] == obj_shipment.dst.id ) {
                             shop_name = Object.values(points_sale.points_sale)[i]
                             console.log("eeeeeeeee i: ", i , " shop_name: ", shop_name , " + ",Object.keys(points_sale.points_sale)[i])
                         }

                     }
                 }

                 console.log("--------------------------");
                 console.log("do:",obj_shipment.shipment[req.query.production])
                 if (obj_shipment.shipment[req.query.production] === undefined){
                     obj_shipment.shipment[req.query.production]={};
                 }
                 var product_description=goods_chicken[req.query.production]['product'][req.query.id_production];
                 console.log(req.query.production,obj_shipment.shipment[req.query.production])
                 console.log("--------------------------");
                 if (obj_shipment.shipment[req.query.production][req.query.id_production] === undefined){
                     console.log("create ves: " +req.query.ves+ " tare:" +req.query.tare+" at product_d: "+req.query.id_production )
                     obj_shipment.shipment[req.query.production][req.query.id_production]=[];

                     if (!obj_shipment['package'][req.query.production])  obj_shipment['package'][req.query.production] = {};
                     if (!obj_shipment['package'][req.query.production][req.query.id_production])  obj_shipment['package'][req.query.production][req.query.id_production]=[];
                     if (!obj_shipment['type_package'][req.query.production])  obj_shipment['type_package'][req.query.production] = {};
                     if (!obj_shipment['type_package'][req.query.production][req.query.id_production])  obj_shipment['type_package'][req.query.production][req.query.id_production]=[];

                     if (!obj_shipment['price_product'])obj_shipment['price_product']={};
                     if (!obj_shipment['price_product'][req.query.production])obj_shipment['price_product'][req.query.production]={}
                     if (!obj_shipment['price_product'][req.query.production][req.query.id_production]) obj_shipment['price_product'][req.query.production][req.query.id_production]= "";


                     if ( !obj_shipment['contragent_name'] ) obj_shipment['contragent_name']={}
                     if ( !obj_shipment['contragent_name'][req.query.production] ) obj_shipment['contragent_name'][req.query.production]={};
                     if ( !obj_shipment['contragent_name'][req.query.production][req.query.id_production]) obj_shipment['contragent_name'][req.query.production][req.query.id_production]="";

                     if (!obj_shipment['ItemDescription'])obj_shipment['ItemDescription']={};
                     if (!obj_shipment['ItemDescription'][req.query.production])
                         obj_shipment['ItemDescription'][req.query.production]={};
                     if (!obj_shipment['ItemDescription'][req.query.production][req.query.id_production])obj_shipment['ItemDescription'][req.query.production][req.query.id_production] = "";

                     if (!obj_shipment['contact_person'])obj_shipment['contact_person']={};
                     if (!obj_shipment['contact_person'][req.query.production])obj_shipment['contact_person'][req.query.production]={};
                     if (!obj_shipment['contact_person'][req.query.production][req.query.id_production])obj_shipment['contact_person'][req.query.production][req.query.id_production]="";

                     if (!obj_shipment['contragent_descr'])obj_shipment['contragent_descr']={};
                     if (!obj_shipment['contragent_descr'][req.query.production])obj_shipment['contragent_descr'][req.query.production]={};
                     if (!obj_shipment['contragent_descr'][req.query.production][req.query.id_production])obj_shipment['contragent_descr'][req.query.production][req.query.id_production]="";

                 }else {
                     console.log("не могу сохранить " +req.query.ves+  "req.query.production: " + req.query.production+" to id product: " +  req.query.id_production );
                 }
                 console.log(" contact_person: ",contact_person," shop_name: ",shop_name, " price_product: ", price_product );

                 obj_shipment.price_product[req.query.production][req.query.id_production]=price_product;
                 obj_shipment.contact_person[req.query.production][req.query.id_production]=contact_person;
                 obj_shipment.contragent_name[req.query.production][req.query.id_production]=shop_name;
                 obj_shipment.ItemDescription[req.query.production][req.query.id_production]=product_description;
                 obj_shipment.shipment[req.query.production][req.query.id_production].push(req.query.ves);
                 obj_shipment['package'][req.query.production][req.query.id_production].push(req.query.tare);
                 obj_shipment['type_package'][req.query.production][req.query.id_production].push(req.query.type_tare);
                 var json = JSON.stringify(obj_shipment);

                 fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
                 var arr_ves = obj_shipment.shipment[req.query.production][req.query.id_production];
                 var arr_tare = obj_shipment['package'][req.query.production][req.query.id_production];
                 var arr_type_tare = obj_shipment['type_package'][req.query.production][req.query.id_production];
                 console.log(obj_shipment['type_package']);
                 console.log("arr tare: ",arr_tare, "arr ves", arr_ves, " type add tare:", arr_type_tare);
                 res.render('pages/add_ves', { arr_ves: JSON.stringify({arr_ves: arr_ves ,arr_tare: arr_tare, arr_type_tare: arr_type_tare}),file:"1"} );

             }
         });
     }else {
         res.render('pages/error' );
     }
 }


    var get_scan = (req,res)=> {
        //console.log(req.sessionID);
        var file_json = req.session.file;
        if (fs.existsSync(file_json) ){
            var options = {
                url: 'http://192.168.0.112:5000/',
                path: '/',
                method: 'GET',
                timeout:500,
                json:true
            };
            request(options, function(error, response, body){
                if(error) console.log("error:",error);
                if (response && response.statusCode && response.statusCode =='200' ) {
                    //console.log(body);
                    if (JSON.parse(JSON.stringify(response.body)).scan) {
                        var scan = JSON.parse(JSON.stringify(response.body)).scan;

                        function find_id(arr,scan_code,product,code){
                            var find=0;
                            var out={}
                            //scan_code =+scan_code.replace(/\D+/g,"");
                            arr.map(function (v,i) {
                                if (scan_code.indexOf(v) > 0 && scan_code.indexOf(v) < 5) {
                                    find=1;
                                    scan_code =+scan_code;
                                    scan_code =scan_code+"";
                                    var ves= scan_code.substr(-5,4)/1000;
                                    out= {production:product,code:code,ves:ves}
                                }
                            });
                            if (find ==0){
                                out= {production:"",code:"",ves:""}
                            }
                            return out;
                        }
                        var arr_out={};
                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out = find_id(["03305", "03242", "013948", "01198", "01197", "008580", "008579"], scan, "chicken", "ФР-00000005") // pechen
                        }
                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out = find_id(["013949", "03243", "03306", "01200", "01199", "008582", "008581"], scan, "chicken", "ФР-00000006"); // serdce
                        }
                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out = find_id(["01395", "008583", "008584", "2301201", "2301202", "03307", "03241", "03244"], scan, "chicken", "ФР-00000007"); // shlunok
                        }
                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out=find_id(["022199","022200","21664","70277" ],scan,"chicken","ФР-00000729");// tushka svyatkova
                        }
                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out=find_id(["021837", "021804", "04764", "021805","04765"],scan,"chicken","ФР-00000602");// Айдахо
                        }

                        if (!arr_out.production || arr_out.production.length<2) {
                            arr_out={production:"",code:"",ves:""}
                        }

                        console.log(arr_out)
                        req.query.id_production=arr_out.code;
                        req.query.production=arr_out.production;
                        req.query.ves=arr_out.ves;
                        req.query.tare=0;
                        req.query.type_tare="ФР-00000605";
			    if (arr_out.code.length > 8 ) {
	                        ves_add(req,res);
			    }else {
				    console.log("ne nashel cod",arr_out.code );
			    }
                    }
                }
            });
        }
    }

 app.get('/ves_add', function(req, res) {
     ves_add(req,res);
 });


 app.get('/add_tare', function( req,res ) {
	var file_json = req.session.file;
	var obj_shipment = {};
	if (fs.existsSync(file_json)) {
		fs.readFile(file_json, function readFileCallback(err, data) {
			if (err) {
				console.log("err:" + err);
			} else {
				console.log("req.query:",req.query);
				obj_shipment = JSON.parse(data);
				if ( obj_shipment.package[req.query.id_tare]) 
					obj_shipment.package[req.query.id_tare].Quantity=req.query.tare;
				else 
					console.log('error add tare');
			}
			console.log(obj_shipment.package);
			var json = JSON.stringify(obj_shipment);
			fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
		});
	}

 })

 app.get('/weight_change', function(req, res) {
     var file_json = req.session.file;
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
		     obj_shipment['package'][req.query.production][req.query.id_production]=[];
		     obj_shipment['type_package'][req.query.production][req.query.id_production]=[];
                 }else {
                     obj_shipment.shipment[req.query.production][req.query.id_production] = req.query.weight_array;
		     obj_shipment['package'][req.query.production][req.query.id_production] = req.query.tare_array;
		     obj_shipment['type_package'][req.query.production][req.query.id_production] = req.query.type_tare_array;
                 }
                 var json = JSON.stringify(obj_shipment);
                 fs.writeFile(file_json, json,  (err) => { if (err) throw err; });
                 var weight_array = obj_shipment.shipment[req.query.production][req.query.id_production];
                 res.render('pages/add_ves', { arr_ves: JSON.stringify({arr_tare: req.query.tare_array, arr_ves: weight_array, arr_type_tare: req.query.type_tare_array}),file:"1"} );
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
         var file_json = req.session.file;
	     console.log("read file:",file_json);
         var obj_shipment={};
         if (fs.existsSync(file_json)) {
             fs.readFile(file_json, function readFileCallback(err, data) {
                 if (err) {
                     console.log(err);
                 } else {
                    console.log("dot_dst:  ",req.query.dot_dst);
                    obj_shipment = JSON.parse(data);

                    var dst_name="";
                    var show_page='pages/ves';
                    if ( obj_shipment.type == "arrival" ) {
                       dst_name = points_sale.points_sale[req.query.dot_dst];
                        show_page='pages/ves';
                    }else {
                        show_page='pages/ves-shipment';
                        if (obj_shipment.dst.destination_type=="contragent")
                            dst_name = points_sale.points_sale[req.query.dot_dst];
                        else
                            dst_name = points_store.store_catalogue[req.query.dot_dst];
                    }

                    var production =  goods_chicken[req.query.ps];
                    var production_name =  production.product[req.query.id_production];
                    var arr_weight=[];
                    var arr_tare=[];
                    var arr_type_tare=[];
                    if (typeof (obj_shipment.shipment[req.query.ps]) !== undefined )
                        if ( obj_shipment.shipment[req.query.ps] && obj_shipment.shipment[req.query.ps][req.query.id_production] && typeof obj_shipment.shipment[req.query.ps][req.query.id_production] !== undefined ) {
                            arr_weight = obj_shipment.shipment[req.query.ps][req.query.id_production];
                            arr_tare= obj_shipment['package'][req.query.ps][req.query.id_production];
                            arr_type_tare = obj_shipment['type_package'][req.query.ps][req.query.id_production];
                        };
		     	
            console.log("dst_name:",obj_shipment.dst.name);
            console.log("package:",obj_shipment.package);
            if (!dst_name) dst_name=obj_shipment.dst.name;

                res.render(show_page, { arr_packages: JSON.stringify(obj_shipment.package),  arr_weight: JSON.stringify(arr_weight),type_operation: obj_shipment.type, p_name: production_name, name: dst_name, id_dst: req.query.dot_dst, production: req.query.ps, arr_tare: JSON.stringify(arr_tare), arr_type_tare: JSON.stringify(arr_type_tare), id_production:req.query.id_production,file:"1" } );
            }
             });
         }else {
             res.render('pages/error' );
         }
     }
 });

 app.get('/del_order', function(req, res) {
     var file_json = req.session.file;
     console.log(file_json);
     if (fs.existsSync(file_json)){
      fs.unlinkSync(file_json);
      req.session.file="";
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

	//res.render('pages/add_ves', {arr_ves: (Math.round(Math.random()*111)) });
})



 app.get('/sel_products', function(req, res) {
    var file_json = req.session.file;
    var obj_shipment={};
    console.log("file_json", file_json,"session:",req.session);
    if (fs.existsSync(file_json)) {
        fs.readFile(file_json, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                res.render('pages/error' );
            } else {
                obj_shipment = JSON.parse(data);
                //console.log("tyy;",obj_shipment, "type:", obj_shipment.type);
	//console.log("test:",obj_shipment.type,obj_shipment)
    	if (fs.existsSync(file_json) && obj_shipment &&  obj_shipment.type) {
            console.log("load STORE", obj_shipment.type);
            res.render('pages/sel_products', {
                dst_point: obj_shipment.dst.id,
                type_operation: obj_shipment.type,
                points_store: JSON.stringify(points_store),
		points_contragent: JSON.stringify(points_sale),
		filters: JSON.stringify(config.filters),
		sort: JSON.stringify(config.sort.contragetn_and_store),
		file:"1"
            });
	}
	}
	})

    } else {
        console.log(req.query)
            console.log("load STORE", req.query.type);
            var f_points_store=filter_json.filter_out(points_store);

            //console.log("do",filter_json.filter_out(points_store));
            res.render('pages/sel_products', {
                dst_point: 0,
                type_operation: req.query.type,
                points_store: JSON.stringify(f_points_store),
		points_contragent: JSON.stringify(points_sale),
		sort: JSON.stringify(config.sort.contragetn_and_store),
		filters: JSON.stringify(config.filters)
	    });
    }
 });
    app.get('/', function(req, res) {
        var file_json = req.session.file;
        var obj_shipment;
        if (fs.existsSync(file_json)) {
            fs.readFile(file_json, function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                    res.render('pages/error' );
                } else {
                    obj_shipment = JSON.parse(data);
                    //console.log(obj_shipment.shipment[0]);
                    res.render('pages/index', {dst_point: obj_shipment.dst.id, type_operation:"",points: JSON.stringify(points_sale),file:"1"} );
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
    var save_json = req.session.file;
    console.log("file:",save_json);
    var newnamejson = new Date(Date.now()+2*60*60*1000);
    newnamejson= newnamejson.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".json";
	req.session.file="";
    res.render('pages/send_to_1c', {message: ["ok"]});
    copyFile(save_json,config.to_send_1c+"/"+newnamejson,function(ret){console.log(ret)});
    fs.unlinkSync(save_json);
})
 app.get('/create_invoice', function (req,res ) {
	var save_json = req.session.file;
	console.log("file:",save_json);
	var old_production = req.query.production?req.query.production:"0";
	var file;
	 if (fs.existsSync(save_json)){
		 fs.readFile(save_json, function readFileCallBack(err,data) {
		    var print=0;
		    if (req.query.print) {
			print = req.query.print;
			var template = fs.readFileSync('/var/www/html/weight/views/pages/invoice_print.ejs', 'utf8');
			var file = JSON.parse(data);
			var home = ejs.render(template,{json: JSON.stringify(file), price: JSON.stringify(store_price), goods_chicken: JSON.stringify(goods_chicken),file:"1"});
			fs.writeFile("/var/www/html/weight/print.html",home, (err) => {
			 if(err) {
			  throw err;
			 }
			});

            } else {
                file = JSON.parse(data);
                console.log(file);
                var store_price = price.store[file.dst.id_in_1c];
		if ( file.type == "arrival")  {
		        var html=res.render('pages/invoice_arrival', {
		            print: print,
		            json: JSON.stringify(file),
		            price: JSON.stringify(store_price),
		            goods_chicken: JSON.stringify(goods_chicken),
			    old_url_production: old_production,
			    file:"0"
		        });			
		}else {
		        var html=res.render('pages/invoice', {
		            print: print,
		            json: JSON.stringify(file),
		            price: JSON.stringify(store_price),
		            goods_chicken: JSON.stringify(goods_chicken),
			    old_url_production: old_production,
			    file:"0"
		        });
		}
		var template = fs.readFileSync('/var/www/html/weight/views/pages/invoice_print.ejs', 'utf8');
		var file = JSON.parse(data);
		var home = ejs.render(template,{json: JSON.stringify(file), price: JSON.stringify(store_price), goods_chicken: JSON.stringify(goods_chicken),file:"0",print: print});
		 var name_print = new Date(Date.now()+2*60*60*1000);
		 name_print= name_print.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".html";
		 name_print = config.root_path+"/public/print/"+name_print;
		fs.writeFile(name_print,home, (err) => {
		 if(err) {
	 	 throw err;
		 }
		});


            }
		 })
	 }
	 else { res.render('pages/error' ) };
 });

 app.get('/create_excel', function (req,res ) {
	
 	//var save_json=config.tmp_json+req.sessionID+".json"
     console.log("read file dlya create exelc file:",req.session.file);
	var save_json_file;
	if (fs.existsSync(req.session.file)) {
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
	 var newnamejson = new Date(Date.now()+2*60*60*1000);
	 newnamejson= newnamejson.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".json";

    copyFile(save_json,config.to_send_1c+"/"+newnamejson,function(ret){console.log(ret)});
    console.log("del:"+save_json);
    fs.unlinkSync(save_json);



 });

app.get('/reload_data', function(req,res){
    var file_json = req.session.file;
    var obj_shipment={};
    console.log("file:",file_json);
    if (fs.existsSync(file_json)) {
        fs.readFile(file_json, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
                res.render('pages/error');
            } else {
                obj_shipment = JSON.parse(data);

                res.write(JSON.stringify(obj_shipment));
                res.end();
            }
        });
    }else {
        res.write(JSON.stringify({"error":"не смог прочесть файл"}));
        res.end();
    }
})

    app.get('/background_scan',  function(req, res) {
        get_scan(req,res);
    })
 app.get('/type_select', function(req, res) {
     var store_price = price.store[points_store.id_in_1c[req.query.dot_dst]];
     console.log("req.query.dot_dst: ", req.query)
 	console.log("session:",req.session    );
     if ( req.query.dot_dst === undefined ) {
         res.render('pages/error' );
     } else {
        var file_json = req.session.file;
        var obj_shipment={};
        console.log("probobly load: " ,file_json);
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
