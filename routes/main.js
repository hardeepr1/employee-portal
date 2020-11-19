module.exports = (function(){
	var notice = require('./notice.js');
	var noticefile = require('./noticefile.js');
	var noticesql = require('./noticesql.js');
	var issue = require('./issues.js');
	var login = require('./login.js');
	var initR = require('./initR.js');
	var employee = require('./employees.js');
	var logout = require('./logout.js');
	var profile = require('./profile.js');
	
	function init(configObj){
		notice.init(configObj);
		noticefile.init(configObj);
		noticesql.init(configObj);
		issue.init(configObj);
		employee.init(configObj);
		login.init(configObj);
		logout.init(configObj);
		initR.init(configObj);
		profile.init(configObj);
	}

	return {init: init};
})();