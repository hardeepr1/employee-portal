window.issues = (function(){
	"use strict";
	var pc = {};
	function handleHash(htmlInjector){
		prepareHtml.htmlInjector = htmlInjector;
		if(!prepareHtml.templateFunction){
			$.ajax({
				url: '/issues-template',
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
		else{
			prepareHtml();
		}

		$.ajax({
			url: '/issues',
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

	function getIssueDetails(){
		var toRemove = $('tr#details',pc.tblIssues);

		if(toRemove.length>0)
			toRemove.remove();
		var id = $(this).closest('[issue-id]').attr('issue-id');
		renderIssueDetails.id = id;
		$.ajax({
			url: '/get-issue',
    		method: 'GET',
    		data: {id: id},
    		success: getIssueDataSH
		});		
		if(!renderIssueDetails.templateFunction){
			$.ajax({
				url: '/issues-historytempl',
				method: 'GET',
				dataType: 'text',
				data: {
				},
				success: getDetailsTemplateSH,
				error: function(){
					console.log(arguments);
				}
			});
		}
		else{
			renderIssueDetails();
		}
	}
	function getIssueDataSH(data){
		createInputToHistoryTemplate.issue = data;
		$.ajax({
			url: '/issues-history',
			method: 'GET',
			data: {id: renderIssueDetails.id},
			success: issueHistorySH
		});
		createInputToHistoryTemplate();
	}
	function issueHistorySH(data){
		createInputToHistoryTemplate.history = data;
		createInputToHistoryTemplate();
	}
	function getDetailsTemplateSH(source){
		renderIssueDetails.templateFunction = Handlebars.compile(source);
		renderIssueDetails();
	}
	function createInputToHistoryTemplate(){
		if(createInputToHistoryTemplate.issue && createInputToHistoryTemplate.history){
			var issue = createInputToHistoryTemplate.issue;
			issue.history = createInputToHistoryTemplate.history;
			renderIssueDetails.issue = issue;
			if(pc.inputDesc.length == 0)
				issue.len = 6;
			else
				issue.len = 5;
			createInputToHistoryTemplate.history = undefined;
			renderIssueDetails();
		}
	}
	function renderIssueDetails(){
		if(renderIssueDetails.issue && renderIssueDetails.templateFunction){
			var content = renderIssueDetails.templateFunction(renderIssueDetails.issue);
			var id = renderIssueDetails.id;
			var ref = $('[issue-id='+id+']',pc.tblIssues);
			ref.after(content);
			var selectList = ref.next().find('#issue-priority');
			selectList.val(selectList.attr('value'));
			ref.next().find('td').find('button[action=collapse]').click();
			renderIssueDetails.id = undefined;
			renderIssueDetails.issue = undefined;
		}
	}
	function populateAssignedTo(data){
		for(var i = 0;i<data.length;i++){
			$('<option></option>')
			.attr('value', data[i].EmployeeId)
			.text(data[i].FullName).appendTo(pc.inputAssignedTo);
		}
	}
	function editHandler(issueObj){
		pc.inputTitle.val(issueObj.Title);
		pc.inputDesc.val(issueObj.Description);
		
		pc.inputPriority.val(issueObj.Priority);	
	}
	function clearModalForm(e){		
		pc.inputDesc.val("");
		pc.inputTitle.val("");
		pc.modalTitle.text('');
		pc.saveChanges.attr('data-for','');
		pc.inputPriority.val('1');
		if (pc.saveChanges.is('[issue-id]'))
			pc.saveChanges.removeAttr('issue-id');
		pc.inputAssignedTo.empty();
		pc.inputComments.text("");
		pc.inputStatus.val('1');
	}
	function deleteHandlerSH(data){	
		$('[issue-id='+data.id+']',pc.tblIssues).remove();
	}
	function deleteHandler(e){	
		var $this = $(this);
		
		var issueId = $this.closest('[issue-id]').attr('issue-id');
		$.ajax({
			url:'/issues',
			method:'DELETE',
			data:{id:issueId},
			success:deleteHandlerSH
		});		
	}
	function saveDataSH(data){
		if(data.isEdit){
			var $row = $('[issue-id='+data.IssueId+']',pc.tblIssues);
			var toupdate = $row.find('td').slice(0,2);
			var title = toupdate.eq(0);
			var priority = toupdate.eq(1);

			title.text(data.Title);
			priority.text(getPriority(data.Priority));
		}
		else{
			window.location.reload();
		}
	}
	function saveToHistorySH(data){
		var $row = $('[issue-id='+data.IssueId+']',pc.tblIssues);
		var toupdate = $row.find('td:gt(2)');
		toupdate.eq(0).text(data.AssignedTo);
		toupdate.eq(1).text(data.Status);
	}
	function isValidIssueHistory(obj){
		return obj.AssignedTo && obj.Status;
	}
	function saveToHistory(e){
		var button = $(e.target);
		var issue = {};
		issue.IssueId = button.attr('issue-id');
		issue.Comments = pc.inputComments.val();
		issue.AssignedTo = pc.inputAssignedTo.val();
		issue.Status = pc.inputStatus.val();
		if(isValidIssueHistory(issue)){
			$('[issue-id='+issue.IssueId+']',pc.tblIssues).next('#details').remove();
			pc.issueModal.modal('hide');
			$.ajax({
				url: '/issues-history',
				method:'POST',
				data: issue,
				success:saveToHistorySH
			});
			return false;
		}
		else
			return true;
	}

	function isValidIssueNa(obj){
		return obj.title && obj.description && obj.priority;
	}
	function saveDataH(e){
		if(pc.inputTitle.length == 0 || pc.inputDesc.length == 0 || pc.inputPriority.length == 0){
			return saveToHistory(e);			
		}
		var button = $(e.target);
		var method = 'POST';
		var issue = {};		
		if(button.attr('data-for') == 'edit'){
			method = 'PUT';	
			issue.id = button.attr('issue-id');
			$('[issue-id='+issue.id+']',pc.tblIssues).next('#details').remove();
		}
		issue.title = pc.inputTitle.val();
		issue.description = pc.inputDesc.val();
		issue.priority = pc.inputPriority.val();
		if(isValidIssueNa(issue)){
			pc.issueModal.modal('hide');
			$('[issue-id='+issue.id+']',pc.tblIssues).next('#details').remove();		
			$.ajax({
				url: '/issues',
				method:method,
				data: issue,
				success:saveDataSH
			});
			return false;
		}
		else{
			return true;
		}
	}
	function pageSetup(){

		//common for admin and non-admin
		pc.issuesTemplate = $('#issuesTemplate');
		pc.issueModal = $('#issueModal',pc.issuesTemplate);
		pc.tblIssues = $('#tblIssues',pc.issuesTemplate);
		pc.saveChanges = pc.issueModal.find('#save-btn');
		pc.modalTitle = pc.issueModal.find('.modal-title');

		//for non-admin
		pc.inputTitle = pc.issueModal.find('#issue-title');
		pc.inputDesc = pc.issueModal.find('#issue-desc');
		pc.inputPriority = pc.issueModal.find('#issue-priority');

		//for admin
		pc.inputAssignedTo = pc.issueModal.find('#assigned-to');
		pc.inputComments = pc.issueModal.find('#issue-comments');
		pc.inputStatus = pc.issueModal.find('#issue-status');

		
		pc.tblIssues.on('click','[action=delete]',deleteHandler);
		pc.tblIssues.on('click','[action=details]',getIssueDetails);
		pc.issueModal.on('show.bs.modal', function (event) {
		    var button = $(event.relatedTarget);		    
		    var title = button.data('modaltitle');

		    pc.modalTitle.text(title);
		    if(button.attr('action') == "create")
		    	pc.saveChanges.attr('data-for', 'create');
		    else if(button.attr('action') =='edit'){		    	
		    	pc.saveChanges.attr({
		    		'data-for': 'edit',
		    		'issue-id': button.closest('[issue-id]').attr('issue-id')
		    	});
		    	var issue = button.closest('[issue-id]');		    	
		    	var body = {};
		    	body.id = issue.attr('issue-id');
		    	if(pc.inputDesc.length>0 && pc.inputTitle.length>0){
			    	$.ajax({
			    		url: '/get-issue',
			    		method: 'GET',
			    		data: body,
			    		success: editHandler
			    	});
		    	}
		    	else{
					$.ajax({
						url: '/get-admins',
						method:'GET',				
						success:populateAssignedTo
					});
		    	}
			}
		});

		pc.issueModal.on('hide.bs.modal', clearModalForm);
		pc.saveChanges.on('click', saveDataH);
	}

	function init(){
	}
	return{
		init:init,
		handleHash:handleHash
	};
})();