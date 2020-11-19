module.exports = function(req,res,next){
	function guid() {
	    function _p8(s) {
	        var p = (Math.random().toString(16)+"000000000").substr(2,8);
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	    }
	    return _p8() + _p8(true) + _p8(true) + _p8();
	}
	global.sessions = global.sessions || {};	
	var sessionId;
	if(req.cookies["SessionId"] && global.sessions[req.cookies["SessionId"]]){
		sessionId = req.cookies["SessionId"];
		req.userSession = global.sessions[sessionId];
	}
	else{
		
		sessionId = guid();
		req.userSession = global.sessions[sessionId] = {
			IsAuthenticated:false,
			IsAuthorised:false,
			user:{}
		};
		
	}
	req.lastAccessedOn = Date.now();
	res.cookie("SessionId",sessionId,{maxAge:10 * 60 * 1000});
	next();
}