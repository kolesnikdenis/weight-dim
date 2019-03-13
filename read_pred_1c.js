const testFolder = './to_send_1c/';
const soapFolser = './soap_send/';
const fs = require('fs');
var full_obj = {};

try{
	file_read_name=soapFolser + "full_obj.json";
    if (fs.existsSync(file_read_name))
    {
        fs.readFile(file_read_name, function readFileCallback(err, data) {
            if (err) {
                full_obj = {};
            }
            if (data != "undefined")
                full_obj = JSON.parse(data);
        })
    }else {
        full_obj = {}
	}
}catch (err){
	console.log("err:",err);
	full_obj={};
}


var count=0;
function get_in_id(id){
	if (!id) id=0;
	count++;
	return  new Date().getTime()+id+count;
}
var array_del_file=[];


const file = (path_to_file) => { return new Promise((resolve, reject) => {  
	fs.readFile(path_to_file, function readFileCallback(err, data) {
		if (err){ reject(err); }
		else 
			resolve({"data": data,"file_name":path_to_file} )
	}) 
})
}


var find_soap_file = function (){
    fs.readdir(soapFolser, (err, files) => {
        files.forEach(file => {
        	console.log("file:",file);
			fs.readFile(soapFolser+file, function readFileCallback(err, data) {
				if (err){ reject(err); }
				else {
                    if (file != "full_obj.json") {
                        test_obj = {};
                        in_soap_file = JSON.parse(data);
                        if (in_soap_file.arrival) {
                            console.log("in_soap_file:", file);
                            full_obj = MergeRecursive(full_obj, in_soap_file);
                        }

                        if (JSON.stringify(test_obj).length != JSON.stringify(full_obj).length) {
                            console.log("i del file:", soapFolser + file);
                            console.log("return del:", fs.unlinkSync(soapFolser + file));
                        }
                        else {
                            console.log(JSON.stringify(test_obj).length, JSON.stringify(full_obj).length);
                        }
                        console.log(JSON.stringify(full_obj).length);
                        fs.writeFile(soapFolser + "full_obj.json", JSON.stringify(full_obj), (err) => {
                            if(err) throw err;
                    	});
                        Object.assign(test_obj, full_obj);

                    }
                }
			});
		})
	})
}
var MergeRecursive = function (obj1, obj2) { // объеденяю объекты под отправку
    for (var p in obj2) {
        try {
            if ( obj2[p].constructor==Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);

            } else {
                obj1[p] = obj2[p];

            }

        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }
    return obj1;
}

var read_file= function(file_read_name){
		return new Promise((resolve, reject) => {
			setTimeout(() => resolve({"f_exist":fs.existsSync(file_read_name),"data":rr(file_read_name).then(res=>{return (res);}, rej=>{return rej})}),10);
			reject =>reject({"bb":"ee"});
		})
};

var r = read_file;
var rr= file;

var global_obj={arrival:{}, shipment:{}};
var promis_arr=[]


fs.readdir(testFolder, (err, files) => {
	files.forEach(file => {
		var r=read_file;
		promis_arr.push(rr(testFolder+file).then(
			res =>{ 
				var jsonf={};
				try{  
					if (res  && res.data.length>2) {
						jsonf=JSON.parse(res.data)
					}  
				}
				catch (err){ console.log(err); jsonf={} }
				console.log("=========================\n");
				console.log("file",file);
				console.log("jsonf:",jsonf);
				console.log(jsonf.type);
				if (JSON.stringify(jsonf)!="{}" && jsonf.dst.id_in_1c && jsonf.type)  {
					var add_id=0;
					console.log( "------------------------\n--------------\ntype:",jsonf.type, " magaz id:",jsonf.dst.id,"id_in_1c",jsonf.dst.id_in_1c);
					if ( global_obj[jsonf.type][jsonf.dst.id_in_1c] ) {
						console.log("test:!",jsonf[jsonf.type],jsonf.type, jsonf.shipment);
						Object.keys(jsonf.shipment).map(function (type_product){ 
							console.log("type_product:",type_product);
							//test na date_time
							if (global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]){
								console.log("date time est");
								Object.keys(jsonf.shipment[type_product]).map(function (id_product){ 
									console.log("blyaaaaaaaaaaaaaaa[",jsonf.type,"][",jsonf.dst.id,"][",type_product,"][",id_product,"]");
									add_id++;
								})
							}
							else { 	
								console.log("--------mimo date time didn't found ",jsonf.shipment,type_product);
								Object.keys(jsonf.shipment[type_product]).map(function (id_product){
									console.log("ttt:",jsonf.type, type_product,id_product);
									console.log(global_obj[jsonf.type][jsonf.dst.id_in_1c]);
									global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]={}
									global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time][type_product]={};
									global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time][type_product][id_product]={
										"weight":jsonf.shipment[type_product][id_product],
										"price_product": jsonf.price_product[type_product][id_product],
										"contragent_name":jsonf.contragent_name[type_product][id_product],
										"contragent_descr":jsonf.contragent_descr[type_product][id_product],
                                        "destination_type":jsonf.dst.destination_type,
										"contact_person": jsonf.contact_person[type_product][id_product],
										"internal_id": get_in_id()
									};
								})

								// create tare obj
                                global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package']={};
                                Object.keys(jsonf['package']).map(function (id_product){
									if ( id_product.indexOf("000")  >0  ) {
													global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][id_product]={
														"ExternalCode": id_product,
														"ItemDescription":jsonf['package'][id_product]['ItemDescription'],
														"Quantity":jsonf['package'][id_product]['Quantity'],
														"UnitOfMeasure":jsonf['package'][id_product]['UnitOfMeasure'],
														"internal_id": get_in_id()
													};
									}
                                })
                                Object.keys(jsonf['package']).map(function (type_product) {
                                    if (type_product.indexOf("0000")<0) {
                                        Object.keys(jsonf['package'][type_product]).map(function (tare_arr) {
                                            jsonf['package'][type_product][tare_arr].map(function (count_tare,i) {
                                                /*if (jsonf.type_package[type_product][tare_arr][i] =="select-1_8" ) { tare_id_1c="ФР-00000605"; }
                                                if (jsonf.type_package[type_product][tare_arr][i] =="select-1_26" ) { tare_id_1c="ФР-00000606"; }
                                                if (jsonf.type_package[type_product][tare_arr][i] =="select-0_85" ) { tare_id_1c="ФР-00000607"; }*/
												tare_id_1c = jsonf.type_package[type_product][tare_arr][i];
												global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity']= parseInt(global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity'])+parseInt(count_tare);
                                                console.log("2:",global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity']);
                                            });
                                        })
                                    }
                                });
								console.log("----- end create new obj--- ");
								console.log(jsonf['package']);
							}

						});
					}else {
						Object.keys(jsonf.shipment).map((product_type)=>{
							console.log("p: ",product_type);
								Object.keys(jsonf.shipment[product_type]).map((id_product_from_1c)=>{
                                    console.log("id p: ",id_product_from_1c);
                                    if (!global_obj[jsonf.type][jsonf.dst.id_in_1c])
										global_obj[jsonf.type][jsonf.dst.id_in_1c]={};
                                    if (!global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time])
										global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]={};
                        			if (!global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time][product_type])
										global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time][product_type]={};
									global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time][product_type][id_product_from_1c]={
                                        "price_product": jsonf.price_product[product_type][id_product_from_1c],
                                        "contragent_name":jsonf.contragent_name[product_type][id_product_from_1c],
                                        "contragent_descr":jsonf.contragent_descr[product_type][id_product_from_1c],
                                        "destination_type":jsonf.dst.destination_type,
                                        "contact_person": jsonf.contact_person[product_type][id_product_from_1c],
										"weight": jsonf.shipment[product_type][id_product_from_1c],
										"internal_id": get_in_id()
									};
								})
						})

                        Object.keys(jsonf.package).map((id_1c_tare)=>{
                        	console.log(id_1c_tare);
                            if ( id_1c_tare.indexOf("000")  >0  )
                        {

                            if (!global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'])
                                global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'] = {};
                            if (!global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][id_1c_tare])
                                global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][id_1c_tare] = {};
                            global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][id_1c_tare] = {
                                "ExternalCode": id_1c_tare,
                                "ItemDescription": jsonf['package'][id_1c_tare]['ItemDescription'],
                                "Quantity": jsonf['package'][id_1c_tare]['Quantity'],
                                "UnitOfMeasure": jsonf['package'][id_1c_tare]['UnitOfMeasure'],
                                "internal_id": get_in_id()
                            };
                        }

						})
                        Object.keys(jsonf['package']).map(function (type_product) {
                            if (type_product.indexOf("0000")<0) {
                                Object.keys(jsonf['package'][type_product]).map(function (tare_arr) {
                                    jsonf['package'][type_product][tare_arr].map(function (count_tare,i) {
                                    	console.log(jsonf.type_package[type_product][tare_arr][i], count_tare , "==============");
                                        /*if (jsonf.type_package[type_product][tare_arr][i] =="select-1_8" ) { tare_id_1c="ФР-00000605"; }
                                        if (jsonf.type_package[type_product][tare_arr][i] =="select-1_26" ) { tare_id_1c="ФР-00000606"; }
                                        if (jsonf.type_package[type_product][tare_arr][i] =="select-0_85" ) { tare_id_1c="ФР-00000607"; }*/
										tare_id_1c = jsonf.type_package[type_product][tare_arr][i];
                                        count_tare = parseInt(global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity']) +parseInt(count_tare);
                                        global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity']=count_tare;
                                        console.log("1:",global_obj[jsonf.type][jsonf.dst.id_in_1c][jsonf.dst.create_data_time]['package'][tare_id_1c]['Quantity']);
                                    });
                                })
                            }
                        });

					}
					console.log("===================================\n========================");
					array_del_file.push(testFolder+file);
				}else  { 
					fs.unlinkSync(testFolder+file);
					console.log("didn't read file del:",testFolder+file); 
				}
			}, 
			rej=>{
				console.log(rej)
			}
		));
	});


	Promise.all(promis_arr.map(p => p.catch(x => console.log(x)))).then(
		r => {
			//console.log("DONE!");
			//console.log(JSON.stringify(global_obj));
			var newnamejson = new Date(Date.now()+3*60*60*1000);
			newnamejson= newnamejson.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /,'_').replace(/:/g,'-')+".json";

			count = (Object.keys(global_obj.arrival).length +  Object.keys(global_obj.shipment).length)
			if ( count >0) {
				console.log("count  >  "+count);
                fs.writeFile(soapFolser + newnamejson, JSON.stringify(global_obj), (err) => {
                    if(err) throw err;
					array_del_file.map(function (t) {
						console.log("del:", t);
						fs.unlinkSync(t);
					});
            	});
                find_soap_file();
            }
			else {
                //console.log("count  <=  "+count);
                array_del_file.map(function (t) {
                    //console.log("file null:\n del:",t);
                    fs.unlinkSync(t);
                });
                find_soap_file();
			}
		}
);


});

//console.log(promis_arr);



