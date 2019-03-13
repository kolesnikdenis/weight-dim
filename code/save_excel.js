var excel = require('excel4node');
var fs =  require('fs');

var workbook = new excel.Workbook();
var worksheet;
var store_price={};
var cell=0;
var goods_chicken = require('../goods_chicken.json');
var config = require('../config.json');
var full_summ=0;
var out={err:"", absolute_path: "", relative_path:"", text:""};
var obj_shipment1={};
var res;
var from_person="";
var to_person="";
function save_excel1(file_json,res1,in_store_price,in_from_person,in_to_person) {
    store_price= in_store_price;
    from_person=in_from_person;
    to_person=in_to_person;
    cell=1;
    res=res1;
    workbook = new excel.Workbook();
    worksheet  = workbook.addWorksheet('Sheet 1');

	console.log("read:"+file_json);
    if (fs.existsSync(file_json)) {
        fs.readFile(file_json, function readFileCallback(err, data) {
            if (err) {
                //console.log(err);
                out.err +=err;
            } else {
                load_goods_chicken(JSON.parse(data));
		}
        });

    }else {
        out.err+="obj not found";
    }
}
var header_line= workbook.createStyle({
    font: {
        bold: true,
        size: 12
    },
    border:{
        bottom: { style: 'thin' }
    }
})
var text_in_table = workbook.createStyle({
    font: {
        //bold: true
        size: 10
    },
    border:{
        top:{ style: 'thin' },left:{ style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    }
})
var header_in_table = workbook.createStyle({
    font: {
        bold: true,
        size: 12
    },
    alignment: {
        wrapText: true,
        horizontal: 'center'
    },
    border:{
        top:{ style: 'thin' },left:{ style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    }
})
var first_cell_in_table = workbook.createStyle({
    font: {
        //bold: true,
        size: 10
    },
    alignment: {
        wrapText: true,
        horizontal: 'center'
    },
    border:{
        top:{ style: 'thin' },left:{ style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    }
})
var weight_in_table = workbook.createStyle({
    font: {
        //color: '#FF0800',
        size: 10
    },
    border:{
        top:{ style: 'thin' },left:{ style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
    },
    numberFormat: '# ##0,00кг.;(# ##0,00)-'
});

function load_goods_chicken(obj_shipment){
    create_excel(goods_chicken,obj_shipment);
}
function replacer(match, p1, p2, p3, p4, p5, p6, offset, string) {
    return [p1, p2, p3, p4, p5, p6].join('_');
}
function add_cell_weight(in_obj) {
    var p = Object.keys(in_obj.shipment)[0];
    var turkey = in_obj.shipment[p];
    var i=0;
    for (var k in turkey) {
        if (turkey.hasOwnProperty(k)) {
            i++;
            var summ=0;
            if (typeof(turkey[k]) === "object") {
                summ = 0;
                for (var t = 0; t < turkey[k].length; t++) {
                    var st = turkey[k][t];
                    summ = parseFloat(summ) + parseFloat(st);

                }
            }
            if ( store_price && k && store_price[k] && store_price[k].Price) {
                price=store_price[k].Price;
                console.log("price:", price, " descr:", store_price[k].Description)
            }else {
                price=0;
            }
            full_summ += price*summ;
            summ=summ.toFixed(3);
            worksheet.column(3).setWidth(18);
            worksheet.cell(cell, 1).string(""+i).style(first_cell_in_table);
            worksheet.cell(cell, 2).string(k).style(first_cell_in_table);
            worksheet.cell(cell, 3).string(goods_chicken[p].product[k]).style(text_in_table);
            worksheet.cell(cell, 4).string(summ).style(weight_in_table);
            worksheet.cell(cell, 5).string("кг.").style(text_in_table);
            worksheet.cell(cell, 6).string(price.toFixed(3)+" грн\\кг.").style(text_in_table);
            worksheet.cell(cell, 7).string((price*summ).toFixed(3)+" грн.").style(text_in_table);
            out.text+= "cell:"+cell+" 1-7 num: "+i +" id: "  +" name: "+goods_chicken[p].product[k]+" ves: "+summ+"\r\n";
            console.log("+++do:"+cell);
            cell++;
            console.log("+++pos:"+cell);
        }
    }
	return {"ok":cell};
}

var add_line = function(in_data,cell) { 
	return new Promise((resolve, reject) => {
		//resolve=>({"Test":"test"}/*add_cell_weight(obj_shipment1)*/)
		//setTimeout(() => resolve(add_cell_weight(obj_shipment1)), 2000);
		setTimeout(() => resolve(add_cell_weight(obj_shipment1)),2000);
		reject =>reject({"bb":"ee"});
	});
}

function create_excel(load_goods_chicken,obj_shipment) {
    worksheet.cell(cell, 1, 1, 7, true).string("Перемещение запасов № "+ "__" +" от "+obj_shipment.dst.create_data_time).style(header_line);
    cell++;
    worksheet.cell(cell, 1,cell,2, true).string("Отправитель:");
    worksheet.cell(cell, 3).string("основной склад");
    cell++;
    worksheet.cell(cell, 1,cell,2, true).string("Получатель:");
    worksheet.cell(cell, 3).string(obj_shipment.dst.name);
    cell++;
    worksheet.column(1).setWidth(3);
    worksheet.cell(cell, 1).string("№").style(header_in_table);
    worksheet.cell(cell, 2).string("Код").style(header_in_table);
    worksheet.cell(cell, 3).string("Товары").style(header_in_table);
    worksheet.cell(cell, 4, cell,5, true).string("Количество").style(header_in_table);
    worksheet.cell(cell, 6).string("Цена").style(header_in_table);
    worksheet.cell(cell, 7).string("Сумма").style(header_in_table);
    cell++;
    obj_shipment1= obj_shipment;
    console.log("do:"+cell);
    console.log("promise:");
    console.log("pre:",obj_shipment1);
    var add_line_to_excal=add_line;
    add_line_to_excal(obj_shipment1,cell).then(
     result => { 
	console.log("result:",result);
	console.log("posle:",cell);
	worksheet.cell(cell, 6).string("Итого:");
    worksheet.cell(cell, 7).string(full_summ+" грн.");
	cell++;

	if (from_person.length >1 ) {
        worksheet.cell(cell, 1, cell, 3, true).string("Отпустил: "+from_person);
    }else {
        worksheet.cell(cell, 1, cell, 3, true).string("Отпустил ________________________");
    }

	if (to_person.length > 1 ){
        worksheet.cell(cell, 4, cell, 7, true).string("Получил: "+to_person);
    }else {
        worksheet.cell(cell, 4, cell, 7, true).string("Получил _____________________________");
    }
	var save_file1= obj_shipment.dst.create_data_time.replace(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/g, replacer)+'.xlsx'
	out.absolute_path = config.invoice+save_file1;
	out.relative_path = config.public+"/invoice"+save_file1;
	save_file = config.invoice+save_file1;
	if (fs.existsSync(save_file)) {
	 fs.unlinkSync(save_file);
	};
	workbook.write(save_file);
	res.render('pages/download_file', {path: config.public+"invoice\/"+save_file1 } );
     },
     reject => { console.log("Rejected: " + reject); res.render('pages/error'); }
    );
}

module.exports.save_excel = save_excel1;
