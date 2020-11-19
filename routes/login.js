module.exports = (function(){	

	var config;
	var sql = require('mssql');
	var path = require('path');

	//saving and getting data from sql server	

	function getTemplateHandler(req,res){
		res.sendFile(
			path.join(
				__dirname, 
				'..\\templates', 
				'login.hbs'));
	}
	function isValidUser(req,res){
		sql.connect(config).then(function () {
		        var request = new sql.Request()
		        .input('email',sql.NVarChar,req.body.LoginId)
		        .input('pwd',sql.NVarChar,req.body.Password);


		        request.query("SELECT e.FirstName as Name,e.EmployeeId,u.UserId,u.IsAdmin FROM Employees AS e JOIN Users u ON e.EmployeeId = u.EmployeeId WHERE e.Email = @email AND u.Password = @pwd")
		        .then(function (recordsets) { 	
		        	if(recordsets.recordset.length>0){
		        		var user = recordsets.recordset[0];
		        		req.userSession.user = user;
		        		req.userSession.IsAuthenticated = true;

		        		
		        	}

		            res.send({
		            	IsAuthenticated: req.userSession.IsAuthenticated,				
						userName: req.userSession.user ? req.userSession.Name:"",
						IsAdmin: req.userSession.user ? req.userSession.user.IsAdmin: false
		            });
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
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.post('/login',isValidUser);
		configObj.app.get('/login-template',getTemplateHandler);
	}
	return {init: init};
})();