const fs = require('fs');
const nodeExcel = require('excel-export');

var conf = {};
conf.name = 'xxxxxx';
conf.cols = [{
    caption: 'string',
    type: 'string'
},
{
    caption: 'date',
    type: 'date'
},
{
    caption: 'bool',
    type: 'bool'
},
{
    caption: 'number 2',
    type: 'number'
}];
conf.rows = [['pi', (new Date(Date.UTC(2013, 4, 1))).oaDate(), true, 3.14], 
            ["e", (new Date(2012, 4, 1)).oaDate(), false, 2.7182], 
            ["M&M<>'", (new Date(Date.UTC(2013, 6, 9))).oaDate(), false, 1.2], 
            ["null", null, null, null]];

var result = nodeExcel.execute(conf);
console.log(result);

// var fs = require('fs');
fs.writeFileSync('single.xlsx', result, 'binary');

fs.writeFile('zzz.txt', 'Hello Node.js', (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
});