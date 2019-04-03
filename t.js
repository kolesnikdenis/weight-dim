

'use strict';
var fs =  require('fs');


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
        // days = days left in date1's month,
        //   plus days that have passed in date2's month
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
var b = new Date('2019-03-11 05:22:23');

var file_json="./soap_send/full_obj.json";
if (fs.existsSync(file_json)) {
    fs.readFile(file_json, function readFileCallback(err, data) {
        if (err) {
            console.log(err);
            res.render('pages/error');
        } else {
            var obj_shipment = JSON.parse(data);

            function way_show(way, count, out) {
                Object.keys(obj_shipment[way]).map(function (value, key) {
                    Object.keys(obj_shipment[way][value]).map(function (date_m, key_m) {
                        b = new Date(date_m);
                        var result_interval = interval(b, a);
                        if (result_interval.years == 0 && result_interval.months == 0 && result_interval.days <= 2) {
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
                                        console.log(obj_shipment[way][value][date_m][type_prod_value][prod_value])
                                        //console.log(way,value,date_m,type_prod_value,prod_value,contragent_name,summ);
                                        var date_set= date_m.substr(0,10);
                                        if  ( !out[way][date_set] ) {out[way][date_set]={}};
                                        if ( !out[way][date_set][prod_value] ) { out[way][date_set][prod_value]={"descr":contragent_name,"sum":summ,"UnitOfMeasure":"кг."}}
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
                                    /*if ( !out[way][date_set][prod_value] ) {out[way][date_set][prod_value]={"descr":contragent_name,"sum":summ}}
                                    else {
                                        out[way][date_set][prod_value].sum +=summ;
                                    }*/
                                    Object.keys(obj_shipment[way][value][date_m][type_prod_value]).map(function (prod_value, prod_key) {
                                        var p=obj_shipment[way][value][date_m][type_prod_value][prod_value]
                                        //console.log(p)
                                        if ( !out[way][date_set][prod_value] ) { out[way][date_set][prod_value]={"descr":p.ItemDescription,"sum":p.Quantity,"UnitOfMeasure":p.UnitOfMeasure}}
                                        else {
                                            out[way][date_set][prod_value].sum +=+prod_value.Quantity;
                                        }
                                    })
                                    //console.log(obj_shipment[way][value][date_m][type_prod_value]);


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


        }
    });
}


