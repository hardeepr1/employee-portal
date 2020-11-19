module.exports = (function(){	
	var config;
	var fs = require('fs');


	//saving and getting data from files
	function getAllNotices(req, res){
		fs.readFile("data/notices.json",function(err,data){
			res.send(JSON.parse(data));
		});
	}

	function deleteNoticeHandler(req, res){
		var noticeId = parseInt(req.body.id, 10);

		fs.readFile('data/notices.json',function(err,data){
			var notices = JSON.parse(data);
			var idx = -1, i = 0;
			for(i = 0; i < notices.length; i++){
				if(notices[i].id === noticeId){
					idx = i;
					break;
				}
			}

			var notice = notices.splice(idx, 1);
			fs.writeFile('data/notices.json',JSON.stringify(notices),function(err){
				res.send(notice[0]);
			});
		});
	}

	function putNoticeHandler(req, res){
		var noticeId = parseInt(req.body.id, 10);

		fs.readFile('data/notices.json',function(err,data){
			var notices = JSON.parse(data);
			var idx = -1, i = 0;
			for(i = 0; i < notices.length; i++){
				if(notices[i].id === noticeId){
					idx = i;
					break;
				}
			}

			notices[idx].title = req.body.title;
			notices[idx].description = req.body.description;

			fs.writeFile('data/notices.json',JSON.stringify(notices),function(err){
				req.body.isEdit = true;
				res.send(req.body);
			});
		});
	}

	function postNoticeHandler(req, res){

		fs.readFile('data/notices.json',function(err,data){
			var notices = JSON.parse(data);
			var notice = {
				id: notices.length - 1 == -1?1:parseInt(notices[notices.length - 1].id,10) + 1,
				title : req.body.title,
				description: req.body.description
			};

			notices.push(notice);
			fs.writeFile('data/notices.json',JSON.stringify(notices),function(err){
				req.body.id = notice.id;
				req.body.isEdit = false;
				res.send(req.body);
			});
		});	
	}
	function init(configObj){
		config = configObj.dbConfig;
		configObj.app.get('/notices-file',getAllNotices);
		configObj.app.put('/notices-file',putNoticeHandler);
		configObj.app.delete('/notices-file',deleteNoticeHandler);
		configObj.app.post('/notices-file',postNoticeHandler);
	}

	return {init: init};
})();