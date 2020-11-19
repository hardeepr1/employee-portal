module.exports = (function(){
	var sql = require('mssql');
	var path = require('path');
	var date = require('date-and-time');
	var config;

	//helper functions
	function getPriority(pnumeric){
		switch(pnumeric){
			case 1:
				return 'Normal';
			case 2:
				return 'Urgent';
			case 3:
				return 'Immediate';
		}
	}
	function mapIssueObj(obj){
		obj.AssignedTo = "TBD";
		obj.Status = "open";
		return obj;
	}
	//handlers
	function getIssue(req,res){
		sql.connect(config).then(function () {
				var id = parseInt(req.query.id);
		        var request = new sql.Request().input('id', sql.Int,id);
		        request.query("SELECT I.*,E.FirstName,E.LastName FROM Issues I JOIN Employees E\
		        			 ON E.EmployeeId = I.PostedBy WHERE IssueId = @id").then(function(recordsets) {		        		        	
		        	var toSend = recordsets.recordset[0];
		        	
		        	sql.close();
		            res.send(toSend);
		            
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
	function issueGetAllHandler(req,res){
	    sql.connect(config).then(function() {
		        var request = new sql.Request()
		        .input('id',sql.Int,req.userSession.user.EmployeeId)
		        .input('isActive',sql.Bit,1);
		        var queryStr = "";		        
		        if(req.userSession.user.IsAdmin){
		        	queryStr = "EXEC [dbo].[getAllIssues] @IsActive = @isActive";		        	
		        }
		        else{
		        	queryStr = "EXEC [dbo].[getAllIssues] @PostedBy = @id, @IsActive = @isActive"
		        }
		        request.query(queryStr).then(function (recordsets) {	 
		        	var mappedData = recordsets.recordset.map(function(data, i) {
		        		data.Priority = getPriority(data.Priority);		        	
		        		if(data.Status == 1)
		        			data.isEditable = "";
		        		else if(!req.userSession.user.IsAdmin)
		        			data.isEditable = 'disable-event';
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
	};
	function issueHistoryPostHandler(req,res){
		sql.connect(config).then(function () {
	        var request = new sql.Request()
	        .input('IssueId',sql.Int,parseInt(req.body.IssueId,10))
	        .input('Comments',sql.NVarChar,req.body.Comments)
	        .input('ModifiedBy',sql.Int,req.userSession.user.EmployeeId)
	        .input('AssignedTo',sql.Int,parseInt(req.body.AssignedTo,10))
	        .input('Status',sql.Int,parseInt(req.body.Status,10));
	        request.query("INSERT INTO IssueHistories OUTPUT inserted.* VALUES(@IssueId,@Comments,@ModifiedBy,GETDATE(),@AssignedTo,@Status);")
	        .then(function (recordsets) {	 	        	  	
	            res.send(recordsets.recordset[0]);
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
	function issuePostHandler(req, res){
		if(req.userSession.user.IsAdmin){
			res.end();
		}
		else{
			sql.connect(config).then(function () {
			        var request = new sql.Request().input('title',sql.NVarChar,req.body.title);
			        request.input('description',sql.NVarChar,req.body.description);
			        request.input('postedby',sql.Int,req.userSession.user.EmployeeId);
			        request.input('priority',sql.Int,parseInt(req.body.priority,10));
			        request.input('isActive',sql.Bit,1);
			        request.query("INSERT INTO Issues OUTPUT inserted.* VALUES(@title,@description,@postedby,@priority,@isActive)")
			        .then(function (recordsets) {	 
			        	var result = mapIssueObj(recordsets.recordset[0]);
			        	result.isEdit = false;  	
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
    function issuePutHandler(req, res){
		sql.connect(config).then(function () {
		        var request = new sql.Request().input('title',sql.NVarChar,req.body.title);
		        request.input('desc',sql.NVarChar,req.body.description);
		        request.input('priority',sql.Int,parseInt(req.body.priority));
		        request.input('id', sql.Int,parseInt(req.body.id,10));
		        request.query("UPDATE Issues SET Title = @title, Description = @desc, Priority = @priority OUTPUT INSERTED.* WHERE IssueId = @id;")
		        .then(function (recordsets) {	 
		        	var result = mapIssueObj(recordsets.recordset[0]);
		        	result.isEdit = true;  	
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
	function issueDeletehandler(req,res){
		var id = parseInt(req.body.id, 10);
		sql.connect(config).then(function () {
	        var request = new sql.Request().input('id',sql.Int,id);
	        request.query("UPDATE Issues SET IsActive = 0 WHERE IssueId = @id").then(function (recordsets) {	
	        	sql.close(); 
	            res.send(req.body);
	            
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
	function getTemplateHandler(req,res){
		var fileName = "";
		if(req.userSession.user && req.userSession.user.IsAdmin){
			fileName = "issuesadmin.hbs";
		}
		else
			fileName = "issuesna.hbs";
		res.sendFile(
			path.join(
				__dirname, 
				'..\\templates', 
				fileName));
	}
	function getIssueDetailsTemplate(req,res){
		res.sendFile(
			path.join(
				__dirname, 
				'..\\templates', 
				'issuehistory.hbs'));
	}
	function getHistoryHandler(req, res){
		sql.connect(config).then(function () {
		        var request = new sql.Request().input('id',sql.Int,parseInt(req.query.id,10));
		        request.query("SELECT * FROM IssueHistories WHERE IssueId = @id").then(function (recordsets) {    	
		            var mappedData = recordsets.recordset.map(function(data, i) {		            	
		        		data.ModifiedOn = date.format(data.ModifiedOn,'MMM DD YYYY HH:mm A',true);
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

	function getAdmins(req,res){
		if(req.userSession.user.IsAdmin){
			sql.connect(config).then(function () {
		        var request = new sql.Request();
		        request.query("EXEC [dbo].getAdmins").then(function (recordsets) {    	
		            res.send(recordsets.recordset);
		            sql.close();
		        })
		        .catch(function (err) {
		            console.log(err+'\n'+"Error line-187(issues.js)");
		            sql.close();
		        });        
		    })
		    .catch(function (err) {
		        console.log(err+'\n'+"ERROR: line-185(issues.js)");
		    });
		}
		else{
			res.end();
		}
	}
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.get('/issues',issueGetAllHandler);
		configObj.app.delete('/issues',issueDeletehandler);
		configObj.app.put('/issues',issuePutHandler);
		configObj.app.post('/issues',issuePostHandler);
		configObj.app.get('/get-issue',getIssue);
		configObj.app.get('/issues-template',getTemplateHandler);
		configObj.app.get('/issues-history',getHistoryHandler);
		configObj.app.post('/issues-history',issueHistoryPostHandler);
		configObj.app.get('/issues-historytempl',getIssueDetailsTemplate);
		configObj.app.get('/get-admins',getAdmins);
	}

	return {init: init};
})();