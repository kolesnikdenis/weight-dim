var excel = require('excel4node');
var fs =  require('fs');

var workbook = new excel.Workbook();
var worksheet = workbook.addWorksheet('Sheet 1');
//var worksheet2 = workbook.addWorksheet('Sheet 2');
var file_json = "/var/www/html/dima/my_project/tmp/orFX1lqz5u43P_pWAlJ1l2GLcY5O42FI.json";
var goods_chicken = require('./goods_chicken.json');
//console.log(goods_chicken);
var obj_shipment={};
if (fs.existsSync(file_json)) {
    fs.readFile(file_json, function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            //create_excel(JSON.parse(data));
            load_goods_chicken(JSON.parse(data));
        }
    });

    }else {
    console.log("obj not found");

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

//

function load_goods_chicken(obj_shipment){
    /*if (fs.existsSync(goods_chicken)) {
        fs.readFile(goods_chicken, function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {*/
                create_excel(goods_chicken,obj_shipment);
                //create_excel(JSON.parse(data),obj_shipment);
    /*
            }
        });

    }else {
        console.log("error load_goods_chicken");

    }*/
}
function replacer(match, p1, p2, p3, p4, p5, p6, offset, string) {
    return [p1, p2, p3, p4, p5, p6].join('_');
}

function create_excel(load_goods_chicken,obj_shipment) {
    //console.log(obj_shipment);
    var cell=1;
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
    p = Object.keys(obj_shipment.shipment)[0];
    var turkey = obj_shipment.shipment[p];
    //var turkey = obj_shipment.shipment.turkey;
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
            console.log("cell:"+cell+" num: "+i +" name: "+load_goods_chicken.turkey.product[k]+": "+k+": "+summ);
            summ=summ.toFixed(3);
            //worksheet.cell(cell, 3).setWidth(65);
            worksheet.column(3).setWidth(18);
            //worksheet.row(cell).setHeight(20);
            worksheet.cell(cell, 1).string(""+i).style(first_cell_in_table);
            worksheet.cell(cell, 2).string(""+k).style(first_cell_in_table);
            worksheet.cell(cell, 3).string(load_goods_chicken.turkey.product[k]).style(text_in_table);
            worksheet.cell(cell, 4).string(summ).style(weight_in_table);
            worksheet.cell(cell, 5).string("кг.").style(text_in_table);
            worksheet.cell(cell, 6).string("").style(text_in_table);
            worksheet.cell(cell, 7).string("").style(text_in_table);
            cell++;
        }
    }
    worksheet.cell(cell, 6).string("Итого:");
    cell++;
    worksheet.cell(cell, 1,cell,3, true).string("Отпустил ________________________");
    worksheet.cell(cell, 4,cell,7, true).string("Получил _____________________________");

    var save_file= obj_shipment.dst.create_data_time.replace(/(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)/g, replacer)+'.xlsx'
    console.log("save file:" + save_file);
    workbook.write(save_file);
}
