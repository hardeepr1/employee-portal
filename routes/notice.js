module.exports = (function(){	

	var config;
	var notices = [{
		id:1,
		title:'notice 1',
		description:'I am first notice'
	},
	{
		id:2,
		title:'notice 2',
		description:'I am second notice'
	},
	{
		id:3,
		title:'notice 3',
		description:'I am third notice'
	}];


	function getAllNotices(req,res){
		res.send(notices);
	}

	function postNoticeHandler(req,res){
		var noticeObj = {
			id: notices[notices.length - 1].id + 1,
			title : req.body.title,
			description: req.body.description
		};
		global.notices.push(noticeObj);
		req.body.id = noticeObj.id;
		req.body.isEdit = false;
		res.send(req.body);
		
	}
	function deleteNoticeHandler(req,res){
		var noticeid = parseInt(req.body.id, 10);
		var idx = -1;
		for (var i = global.notices.length - 1; i >= 0; i--) {
			if(global.notices[i].id == noticeid)
			{
				idx = i;
				break;
			}
		}
		if(idx != -1){
			var data = global.notices.splice(idx, 1)[0];
			res.send(data);
		}
	}

	function putNoticeHandler(req,res){
		var noticeid = parseInt(req.body.id, 10);
		var idx = -1;
		for (var i = global.notices.length - 1; i >= 0; i--) {
			if(global.notices[i].id == noticeid)
			{
				idx = i;
				break;
			}
		}
		if(idx != -1){
			var data = global.notices[idx];
			data.title = req.body.title;
			data.description = req.body.description;
			req.body.isEdit = true;
			res.send(req.body);
		}
	}
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.get('/notices',getAllNotices);
		configObj.app.put('/notices',putNoticeHandler);
		configObj.app.delete('/notices',deleteNoticeHandler);
		configObj.app.post('/notices',postNoticeHandler);
	}

	return {init: init};
})();