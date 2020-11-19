module.exports = (function () {
    var config;
    var sql = require('mssql');
    var path = require('path');
    var date = require('date-and-time');
    var pc = {};

    // initialisation of variables

    // decalre functions
    function handleEmployeeTemplate(req, res) {
        var fileName = "";
        if(req.userSession.user && req.userSession.user.IsAdmin)
            fileName = 'employeesadmin.hbs';
        else
            fileName = 'employees.hbs';

        res.sendFile(
            path.join(
                __dirname, 
                '..\\templates', 
                fileName));
    }
    function postEmployeeHandler(req,res){
        if(req.userSession.user.IsAdmin){
            sql.connect(config).then(function () {
                    var queryStr = "EXEC [dbo].insertEmployee @fn,@ln,@email,@doj,@dot,@dept,@pwd,@IsAdmin";
                    var request = new sql.Request();
                    request.input('fn',sql.NVarChar,req.body.fn)
                       .input('ln',sql.NVarChar,req.body.ln)
                       .input('email',sql.NVarChar,req.body.email)
                       .input('doj',sql.Date,req.body.doj)
                       .input('dot',sql.Date,req.body.dot === "" ? null:req.body.Ed)
                       .input('dept',sql.Int,req.body.dept)
                       .input('IsAdmin',sql.Bit,req.body.IsAdmin)
                       .input('pwd',sql.NVarChar,req.body.pwd);
                    request.query(queryStr).then(function (recordsets) { 
                        if(recordsets.recordset.length > 0){
                            var result = recordsets.recordset[0];
                            result.email = req.body.email;
                            result.password = req.body.pwd;
                            result.isEdit = false;
                            res.send(result);
                        }
                        else{
                            res.send({error:'not able to insert data'});
                        }
                        sql.close();
                    })
                    .catch(function (err) {
                        console.log(err);
                        sql.close();
                    });        
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        else{
            res.end();
        }
    }
    function putEmployeeHandler(req,res){
        if(req.userSession.user.IsAdmin){
            sql.connect(config).then(function () {
                    var queryStr = "EXEC [dbo].updateEmployee @EmpId, @fn,@ln,@email,@doj,@dot,@dept,@pwd,@IsAdmin";
                    var request = new sql.Request();
                    request.input('fn',sql.NVarChar,req.body.fn)
                       .input('ln',sql.NVarChar,req.body.ln)
                       .input('email',sql.NVarChar,req.body.email)
                       .input('doj',sql.Date,req.body.doj)
                       .input('dot',sql.Date,req.body.dot === "" ? null:req.body.Ed)
                       .input('dept',sql.Int,req.body.dept)
                       .input('IsAdmin',sql.Bit,req.body.IsAdmin)
                       .input('pwd',sql.NVarChar,req.body.pwd)
                       .input('EmpId',sql.Int,parseInt(req.body.EmpId,10));
                    request.query(queryStr).then(function (recordsets) { 
                        req.body.isEdit = true;
                        res.send(req.body);
                        sql.close();
                    })
                    .catch(function (err) {
                        console.log(err);
                        sql.close();
                    });        
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        else{
            res.end();
        }
    }
    function handleEmployeeGet(req, res) {
        var queryStr;

        sql.connect(config).then(function () {
            var isAdmin = req.userSession.user.IsAdmin ?1:0;
            var request = new sql.Request();
            request.input('Fn',sql.NVarChar,req.query.Fn === "" ? null:req.query.Fn)
                   .input('Ln',sql.NVarChar,req.query.Ln === "" ? null:req.query.Ln)
                   .input('Email',sql.NVarChar,req.query.Email === ""?null:req.query.Email)
                   .input('Bd',sql.Date,req.query.Bd === "" ? null:req.query.Bd)
                   .input('Ed',sql.Date,req.query.Ed === "" ? null:req.query.Ed)
                   .input('Dept',sql.Int,req.query.Dept === "" ? null: parseInt(req.query.Dept,10))
                   .input('isAdmin',sql.Bit,isAdmin);
            queryStr = "EXEC [dbo].searchEmployees @fn = @Fn,@ln = @Ln,@email = @Email,@bd = @Bd\
                        ,@ed = @Ed,@dept = @Dept,@IsAdmin = @isAdmin";
            request.query(queryStr).then(function (recordsets) {
                //send data
                var mappedData = recordsets.recordset.map(function(data, i) {                       
                        data.DateOfJoining = date.format(data.DateOfJoining,'MMM DD YYYY');
                        return data;
                    });
                res.send(mappedData);
                sql.close();
            })
            .catch(function (err) {
                console.log(err);
                sql.close();
            });        
        })
        .catch(function (err) {
            console.log(err);
        });    
    }

    function getDepartmentsHandler(req,res){
        sql.connect(config).then(function () {
                var queryStr = "SELECT * FROM Departments;";
                var request = new sql.Request();
                request.query(queryStr).then(function (recordsets) { 
                    res.send(recordsets.recordset);
                    sql.close();
                })
                .catch(function (err) {
                    console.log(err);
                    sql.close();
                });        
            })
            .catch(function (err) {
                console.log(err);
            }); 
    }
    function getEmpDetailsHanler(req,res){
        sql.connect(config).then(function () {
                var queryStr = "EXEC [dbo].getEmpDetails @Empid = @id;";
                var request = new sql.Request().input('id',sql.Int,parseInt(req.query.EmpId,10));
                request.query(queryStr).then(function (recordsets) { 
                    var data = recordsets.recordset[0];
                    if(req.userSession.user){
                        if(!req.userSession.user.IsAdmin){
                            data.Password = '';
                        }
                        data.DateOfJoining = date.format(data.DateOfJoining,'YYYY-MM-DD');
                        data.TerminationDate = date.TerminationDate?date.format(data.TerminationDate,'yyyy-MM-dd'):'';
                        res.send(data);
                    }
                    else{
                        res.end();
                    }
                    sql.close();
                })
                .catch(function (err) {
                    console.log(err);
                    sql.close();
                });        
            })
            .catch(function (err) {
                console.log(err);
            }); 
    }
    // declare init
    function init(routeConfig) {
        config = routeConfig.dbConfig;
        routeConfig.app.get('/employees-template', handleEmployeeTemplate);
        routeConfig.app.get('/employees', handleEmployeeGet);
        // routeConfig.app.post('/employees', handleEmployeePost2);
        routeConfig.app.get('/departments',getDepartmentsHandler);
        routeConfig.app.get('/emp-details',getEmpDetailsHanler);
        routeConfig.app.post('/employees',postEmployeeHandler);
        routeConfig.app.put('/employees',putEmployeeHandler);
    }

    // return
    return {
        init: init
    }
})();