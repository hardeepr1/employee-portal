module.exports = (function(){
	function handleNoticeGet(req, res){	
		res.send({
			IsAuthenticated: req.userSession.IsAuthenticated,
			IsAuthorised: req.userSession.IsAuthorised,
			userName: req.userSession.user ? req.userSession.user.Name :"",
			IsAdmin: req.userSession.user ? req.userSession.user.IsAdmin: false
		});
	}

	function init(routeConfig){
		routeConfig.app.get('/init', handleNoticeGet);
	}

	// return
	return {
		init: init
	};
})();