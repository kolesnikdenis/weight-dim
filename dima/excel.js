// Require library
var excel = require('excel4node');

// Create a new instance of a Workbook class
var workbook = new excel.Workbook();

// Add Worksheets to the workbook
var worksheet = workbook.addWorksheet('Sheet 1');
var worksheet2 = workbook.addWorksheet('Sheet 2');

var total_style = workbook.createStyle({
                font: {
                  //  bold: true
		 size: 12
                },
                border:{
		top:{ style: 'thin' },left:{ style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }
                }
            })

// Create a reusable style
var style = workbook.createStyle({
  font: {
    color: '#FF0800',
    size: 12
  },
  numberFormat: '# ##0,00кг.;(# ##0,00)-'
});

// Set value of cell A1 to 100 as a number type styled with paramaters of style
worksheet.cell(1,1).number(100).style(total_style);

// Set value of cell B1 to 300 as a number type styled with paramaters of style
worksheet.cell(1,2).number(200).style(style);

// Set value of cell C1 to a formula styled with paramaters of style
worksheet.cell(1,3).formula('A1 + B1').style(style);

// Set value of cell A2 to 'string' styled with paramaters of style
worksheet.cell(2,1).string('string').style(style);
worksheet.cell(4, 1, 4, 6, true).string('One big merged cell')
worksheet.column(3).setWidth(50);
//worksheet.row(1).setHeight(20);
//worksheet.cell(4,1).setWidth(50);
// Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
worksheet.cell(3,1).bool(true).style(style).style({font: {size: 14}});

workbook.write('Excel.xlsx');
