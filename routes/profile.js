module.exports = (function () {
    // var
    var sql = require('mssql');
    var path = require('path');
    var pc = {};

    // initialisation of variables

    // declare functions
    function handleProfileTemplate(req, res) {
        res.sendFile(
        path.join(
            __dirname,
            '..\\templates',
            'profile.hbs'));
    
    }

    function handleProfileGet(req, res) {

        var empId = parseInt(req.userSession.user.EmployeeId, 10); 

        sql.connect(pc.config).then(function () {
            var request = new sql.Request();

            request.input('empId',sql.Int,empId);

            var queryString = 'SELECT * ' +
                              'FROM dbo.Employees E JOIN dbo.Departments D ON E.DepartmentId = D.DepartmentId ' +
                              'WHERE E.EmployeeId=@empId';

            request.query(queryString).then(function (recordsets) {
                sql.close();
                res.send(recordsets.recordset[0]);      
            }).catch(function (err) {
                sql.close();
                console.log(err);
            });
        }).catch(function (err) {
            sql.close();
            console.log(err);
        });
    }

    function handleProfilePut(req, res) {        
        var newPwd = req.body.NewPwd;
        var current = req.body.current;
        
        sql.connect(pc.config).then(function () {

            var request = new sql.Request();

            request.input('userId', sql.INT, req.userSession.user.UserId)
                   .input('newPwd', sql.NVARCHAR, newPwd)
                   .input('current',sql.NVARCHAR,current);
            
            var queryString = "UPDATE Users SET Password = @newPwd OUTPUT INSERTED.* WHERE UserId = @userId AND Password = @current";

            request.query(queryString).then(function (recordsets) {
                sql.close();
                var retVal = {};                
                if(recordsets.recordset.length>0){
                    retVal.msg = "Password successfully changed";
                    retVal.success = 'true';
                }
                else{
                    retVal.success = false;
                    retVal.msg = "Check current password";
                }
                console.log(recordsets);
                console.log(req.body);
                res.send(retVal);
            }).catch(function (err) {
                sql.close();
                console.log(err);
            });
        }).catch(function (err) {
            sql.close();
            console.log(err);
        });
    };

    // declare init
    function init(routeConfig) {
        pc.config = routeConfig.dbConfig;
        routeConfig.app.get('/profile-template', handleProfileTemplate);
        routeConfig.app.get('/profile', handleProfileGet);
        routeConfig.app.put('/profile', handleProfilePut);
    }

    // return
    return {
        init: init
    }
})();