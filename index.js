const url = require("url");
const fs = require("fs");
const path = require("path");
const mime = require("./mime").mime;
const parser = require('http-parser-js');
const nodeExcel = require('excel-export');

process.binding('http_parser').HTTPParser = parser.HTTPParser;

const http = require('http');

function start(){
    http.createServer((req,resp) => {
        var pathname = url.parse(req.url).pathname;
        var foder = path.dirname(pathname);
        var base = path.basename(pathname);
        var extname = path.extname(pathname);

        console.dir(req.headers.host);
        
        if(base === "oper"){
            oper(req,resp,extname);
        }else{
            if(!extname){
                extname = ".html";
                pathname+=extname;
            };
            if(mime[extname.slice(1)]){
                var rs = fs.createReadStream(".."+pathname);
                resp.writeHead(200, {"Content-Type": mime[extname.slice(1)]});
                
                rs.on('data', (chunk) => {
                    rs.pause();
                    resp.write(chunk);
                    rs.resume();
                });
                
                rs.on('end', () => {
                    resp.end();
                });
                
                rs.on('error', () => {
                    ftf(resp);
                }); 
            }else{
                ftf(resp);
            }
        }
    }).listen(80);
}
function oper(req,resp,extname){
    req.setEncoding('utf-8');
    var postData = "";

    req.on("data",(chunk) => {
        postData += chunk;
    });
    req.on("end",() => {
        var data = JSON.parse(postData);
        bornFile(data.url,data.col,data.excelname,function(){
            console.log('已生成文件！');
            resp.writeHead(200, {"Content-Type": mime[extname.slice(1)]});
            resp.write('{"link":"/node/'+data.excelname+'.xlsx"}');
            resp.end();
        });
    });
}
function ftf(resp){
    resp.writeHead(404, {"Content-Type": "text/html"});
    resp.write("404!");
    resp.end();
}
function bornFile(url,col,name,fn){
    var conf = {};
    conf.name = 'xxxxxx';
    conf.cols = [];
    conf.rows = [];
    for(var item of col){
        conf.cols.push({
            caption: item.title,
            type: 'string'
        });
    }
    http.get(url,(res) => {
        if(res.statusCode === 200){
            var _data = [];
            res.on('data',(chunk) => {
                _data.push(chunk.toString('utf-8'));
            });
            res.on('end',() => {
                var dataObj = JSON.parse(_data.join(''));
                var tableData = dataObj.aaData;
                for(var row of tableData){
                    var rowCnt = [];
                    for(var item of col){
                        var cell = row[item.attr];
                        cell !== undefined && (rowCnt.push(cell));
                    }
                    conf.rows.push(rowCnt);
                }
                var result = nodeExcel.execute(conf);
                fs.writeFile(name+'.xlsx', result, 'binary', (err) => {
                    if (err) throw err;
                    fn && fn();
                });
            })
        }
    }).on('error', function(e){
        console.log(`Got error: ${e}`);
    });
}
start();