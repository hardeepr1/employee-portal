window.notices = (function(){
	"use strict";
	var pc = {};
	function handleHash(htmlInjector){
		prepareHtml.htmlInjector = htmlInjector;
		if(!prepareHtml.templateFunction){
			$.ajax({
				url: '/notices-template',
				method: 'GET',
				dataType: 'text',
				data: {
				},
				success: getTemplateSH,
				error: function(){
					console.log(arguments);
				}
			});
		}

		$.ajax({
			url: '/notices-sql',
			method: 'GET',
			dataType: 'json',
			data: {},
			success: getDataSH,
			error: function(){console.log(arguments)}
		});
	}

	function getDataSH(data){
		var html ='';
		if(data.IsAuthenticated === false){
			html = '<p>please <a href = "#login">login</a> first to access this page</p>';
			prepareHtml.htmlInjector(html,null);

		}
		else if(data.IsAuthorised === false){
			html = '<p>please <a href = "#logout">Logout</a> and login with proper role to access this page</p>';
			prepareHtml.htmlInjector(html,null);
		}
		else{
			prepareHtml.data = data;
			prepareHtml();
		}
	}

	function getTemplateSH(source){
		prepareHtml.templateFunction = Handlebars.compile(source);
		prepareHtml();
	}

	function prepareHtml(){
		if(prepareHtml.data && prepareHtml.templateFunction){
			var content = prepareHtml.templateFunction(prepareHtml.data);
			prepareHtml.htmlInjector(content,pageSetup);
		}
	}

	function createTemplate(){

	}		
	function editHandler(button){		
		var $row = button.closest('div[notice-id]');	
		var title = $row.find('div[info=title]').find('span:first').text();
		var desc = $row.find('p[info=desc]').text();
		pc.inputTitle.val(title);
		pc.inputDesc.val(desc);
	}
	function clearModalForm(e){		
		pc.inputDesc.val("");
		pc.inputTitle.val("");
		pc.modalTitle.text('');
		pc.saveChanges.attr('data-for','');
		if (pc.saveChanges.is('[notice-id]'))
			pc.saveChanges.removeAttr('notice-id');
		pc.inputStart.val("");
		pc.inputEnd.val("");
	}
	function deleteHandlerSH(data){	
		$('[notice-id='+data.id+']',pc.divNotices).remove();
	}
	function deleteHandler(edit){	
		var $this = $(this);
		
		var noticeId = $this.closest('[notice-id]').attr('notice-id');
		$.ajax({
			url:'/notices-sql',
			method:'DELETE',
			data:{id:noticeId},
			success:deleteHandlerSH
		});		
	}
	function saveDataSH(data){
		// if(data.isEdit){
		// 	var $row = $('[notice-id='+data.id+']',pc.divNotices);
			
		// 	var title = $row.find('div[info="title"]').find('span:first');
		// 	var desc = $row.find('p[info="desc"').text();

		// 	title.text(data.title);
		// 	desc.text(data.description);
		// }
		// else{
		// 	pc.divNotices.append(createNotice(data));
		// }
		window.location.reload();		
	}
	function isValidNotice(obj){
		return obj.title && obj.description && obj.sd && obj.ed && (obj.sd <= obj.ed);

	}
	function saveDataH(e){	
		var button = $(e.target);
		var method = 'POST';
		var notice = {};		
		if(button.attr('data-for') == 'edit'){
			method = 'PUT';	
			notice.id = button.attr('notice-id');
		}
		notice.title = pc.inputTitle.val();
		notice.description = pc.inputDesc.val();
		notice.sd = pc.inputStart.val();
		notice.ed = pc.inputEnd.val();
		if(isValidNotice(notice)){
			pc.noticeModal.modal('hide');
			$.ajax({
				url: '/notices-sql',
				method:method,
				data: notice,
				success:saveDataSH
			});
			return false;
		}
		else{
			if(notice.sd>notice.ed)
				return false;
			return true;
		}
	}

	function pageSetup(){
		pc.divNoticestemplate = $('#divNoticesTemplate');
		pc.noticeModal = $('#noticeModal',pc.divNoticestemplate);
		pc.divNotices = $('#divNotices',pc.divNoticestemplate);
		pc.inputTitle = pc.noticeModal.find('#notice-title');
		pc.inputDesc = pc.noticeModal.find('#notice-desc');
		pc.inputStart = pc.noticeModal.find('#start-date');
		pc.inputEnd = pc.noticeModal.find('#end-date');
		pc.saveChanges = pc.noticeModal.find('#save-btn');
		pc.modalTitle = pc.noticeModal.find('.modal-title');


		pc.divNotices.on('click','[action=delete]',deleteHandler);
		pc.noticeModal.on('show.bs.modal', function (event) {
		    var button = $(event.relatedTarget);		    
		    var title = button.data('modaltitle');
		    pc.modalTitle.text(title);
		    if(button.attr('action') == "create")
		    	pc.saveChanges.attr('data-for', 'create');
		    else if(button.attr('action') =='edit'){		    	
		    	pc.saveChanges.attr({
		    		'data-for': 'edit',
		    		'notice-id': button.closest('[notice-id]').attr('notice-id')
		    	});
		    	editHandler(button);
		    }
		});

		pc.noticeModal.on('hide.bs.modal', clearModalForm);
		pc.saveChanges.on('click', saveDataH);
	}

	function init(){
	}
	return{
		init:init,
		handleHash:handleHash
	};
})();