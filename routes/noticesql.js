module.exports = (function(){	

	var config;
	var sql = require('mssql');
	var path = require('path');
	var date = require('date-and-time');

	//saving and getting data from sql server
	function mapSqlToJsObj(sqlObj){
		return {
	    			id: sqlObj.NoticeId,
	    			title: sqlObj.Title,
	    			description: sqlObj.Description
	    		};
	}

	function getTemplateHandler(req,res){
		var fileName = "";
		if(req.userSession.user && req.userSession.user.IsAdmin)
			fileName = 'noticesadmin.hbs';
		else
			fileName = 'noticesna.hbs';

		res.sendFile(
			path.join(
				__dirname, 
				'..\\templates', 
				fileName));
	}
	function getAllNotices(req,res){
		var queryStr = "";
		if(req.userSession.user.IsAdmin){
			queryStr = 'SELECT n.*,e.FirstName\
						FROM Notices n JOIN Employees e\
						ON n.PostedBy = e.EmployeeId WHERE n.IsActive = 1';
		}
		else
			queryStr = "EXEC [dbo].[getNotices]";
	    sql.connect(config).then(function () {
		        var request = new sql.Request();
		        request.query(queryStr).then(function (recordsets) {
		            var mappedData = recordsets.recordset.map(function(data,i) {

		            	data.StartDate = date.format(data.StartDate,'MMM DD YYYY');
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

	function postNoticeHandler(req, res){
		if(!req.userSession.user.IsAdmin)
			res.end();
		else{
			sql.connect(config).then(function () {
		        var request = new sql.Request()
		        .input('title',sql.NVarChar,req.body.title)
		        .input('desc',sql.NVarChar,req.body.description)
		        .input('postby',sql.Int,req.userSession.user.EmployeeId)
		        .input('sd',sql.Date,req.body.sd)
		        .input('ed',sql.Date,req.body.ed);
		        request.query("INSERT INTO Notices OUTPUT inserted.* VALUES(@title,@desc,@postby,@sd,@ed,1);").then(function (recordsets) {	 
		        	var result = recordsets.recordset[0];
		        	result.isEdit = false; 
		        	result.StartDate = date.format(result.StartDate,'MMM DD YYYY'); 	
		            res.send(result);
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
	}

	function putNoticeHandler(req, res){
		if(!req.userSession.user.IsAdmin)
			res.end();
		else{
			sql.connect(config).then(function () {
					var id = parseInt(req.body.id,10);
			        var request = new sql.Request()
			        .input('title',sql.NVarChar,req.body.title)
			        .input('desc',sql.NVarChar,req.body.description)
			        .input('id',sql.Int,id)
			        .input('sd',sql.Date,req.body.sd)
			        .input('ed',sql.Date,req.body.ed);
			        request.query("UPDATE Notices SET Title = @title, Description = @desc, StartDate = @sd, ExpirationDate = @ed  OUTPUT INSERTED.* WHERE NoticeId = @id;")
			        .then(function (recordsets) {	 
			        	var result = recordsets.recordset[0];
			        	result.isEdit = true;
			        	result.StartDate = date.format(result.StartDate,'MMM DD YYYY');  	
			            res.send(result);
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
	}
	function deleteNoticeHandler(req,res){
		if(!req.userSession.user.IsAdmin)
			res.end();
		else{
			var noticeId = parseInt(req.body.id, 10);
			sql.connect(config).then(function () {
		        var request = new sql.Request().input('id',sql.Int,noticeId);
		        request.query("UPDATE Notices SET IsActive = 0 WHERE NoticeId = @id").then(function (recordsets) {	 
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
	}
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.get('/notices-sql',getAllNotices);
		configObj.app.put('/notices-sql',putNoticeHandler);
		configObj.app.delete('/notices-sql',deleteNoticeHandler);
		configObj.app.post('/notices-sql',postNoticeHandler);
		configObj.app.get('/notices-template',getTemplateHandler);
	}

	return {init: init};
})();