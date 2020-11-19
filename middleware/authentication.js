module.exports = function(authInfo){
	return function(req, res, next){
		var currentUrl = req._parsedUrl || "/";
		currentUrl = currentUrl.pathname.substring(1);
		
		if(currentUrl.indexOf("/") !== -1){
			currentUrl = currentUrl.substring(0, currentUrl.indexOf("/"));
		}
		var authRequired = (authInfo.indexOf(currentUrl) != -1);

		if(authRequired){
			if(!req.userSession.IsAuthenticated){
				req.userSession.IsAuthenticated = false;
				req.userSession.IsAuthorised = false;
				req.userSession.user = null;

				res.send(req.userSession);
			}
			else{				
				next();
			}
		} else {			
			next();
		}
	}
}