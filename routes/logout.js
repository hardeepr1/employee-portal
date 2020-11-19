module.exports = (function(){	

	var config;

	//saving and getting data from sql server	

	
	function logout(req,res){
		req.userSession.user = null;
		req.userSession.IsAuthenticated = false;
		req.userSession.IsAuthorised = false;

		res.send(req.userSession);
	}
	
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.get('/logout',logout);
		
	}

	return {init: init};
})();