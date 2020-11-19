window.employees = (function(){
	// var
	var pc = {};
	pc.pwdPattern =   /^(?=.*\d)(?=(.*[!@#$%&*~?^.]))(?=.*[a-zA-Z]).{8,16}$/;
    pc.emailPattern =  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;

	// var init
	
	// functions
	function handleHash(htmlInjector){
		prepareHTML.htmlInjector = htmlInjector;
		$.ajax({
			url: '/departments',
			method: 'GET',
			dataType: 'json',
			data: {
			},
			success: getDataSuccessHandler,
			error: function(){
				console.log(arguments);
			}
		});

		if(!prepareHTML.templateFunction){
			$.ajax({
				url: '/employees-template',
				method: 'GET',
				dataType: 'text',
				data: {
				},
				success: getTemplateSuccessHandler,
				error: function(){
					console.log(arguments);
				}
			});
		} 
	}

	function getTemplateSuccessHandler(templateText){
		prepareHTML.templateFunction = Handlebars.compile(templateText);
		prepareHTML();
	}

	function getDataSuccessHandler(data){
		if(data.IsAuthenticated === false){
			var html = 'Please <a href="#login">Login</a> to access employees';
			prepareHTML.htmlInjector(html, null);
		} else if(data.IsAuthorised === false){
			var html = 'Please <a href="#logout">Logout</a> and Login with proper role to access employees';
			prepareHTML.htmlInjector(html, pageSetup);
		}
		else {
			prepareHTML.data = data;
			prepareHTML();
		}
	}

	function prepareHTML(){
		if(prepareHTML.data && prepareHTML.templateFunction){
			var html = prepareHTML.templateFunction(prepareHTML.data);
			prepareHTML.htmlInjector(html, pageSetup);
		}
	}

	function searchEmployee()
	{
		var emp = {
    		Fn: $('#first-name',pc.searchOpts).val(),
    		Ln: $('#last-name',pc.searchOpts).val(),
    		Email: $('#email',pc.searchOpts).val(),
    		Bd: $('#beg-date',pc.searchOpts).val(),
    		Ed: $('#end-date',pc.searchOpts).val(),
    		Dept: $('#dept',pc.searchOpts).val()
    	};
    	pc.searchResult.hide();
    	$.ajax({
			url: '/employees',
			method: 'GET',
			dataType: 'json',
			data: emp,
			success: searchEmployeeSuccessHandler,
			error: function(){
				console.log(arguments);
			}
		});
	}
	function prepareSearchResults(data){
		var htmlGen;
		if(!prepareSearchResults.empTuppleGen){
			var source = '{{#each .}}<tr><td>{{FirstName}}</td><td>{{LastName}}</td>';
				source += '<td>{{Email}}</td><td>{{DateOfJoining}}</td>';
				source += '<td>{{DepartmentName}}</td></tr>{{/each}}';						   				              				              
			htmlGen = Handlebars.compile(source);
			prepareSearchResults.empTuppleGen = htmlGen;
		}
		else{
			htmlGen = prepareSearchResults.empTuppleGen;			
		}
		var html = htmlGen(data);
		return html;
	}
	function prepareSearchResultsForAdmin(data){
		var htmlGen;
		if(!prepareSearchResultsForAdmin.empTuppleGen){
			var source = '{{#each .}}<tr emp-id = "{{EmployeeId}}"><td>{{FirstName}}</td><td>{{LastName}}</td>';
				source += '<td>{{Email}}</td><td>{{DateOfJoining}}</td>';
				source += '<td>{{DepartmentName}}</td>';
				source += '<td><a href="#employees" class="glyphicon glyphicon-edit"data-toggle="modal"';
				source += ' data-modaltitle = "Edit Employee:- {{FirstName}}" data-target="#employeeModal" action = "edit"';
				source += 'style="font-size:16px;"></a></td></tr>{{/each}}';						   				              				              
			htmlGen = Handlebars.compile(source);
			prepareSearchResultsForAdmin.empTuppleGen = htmlGen;
		}
		else{
			htmlGen = prepareSearchResultsForAdmin.empTuppleGen;			
		}
		var html = htmlGen(data);
		return html;
	}
	function searchEmployeeSuccessHandler(data)
	{
		if(pc.employeeModal.length>0){
			pc.empTupples.html(prepareSearchResultsForAdmin(data));
		}
		else{
			pc.empTupples.html(prepareSearchResults(data));
		}
		pc.searchResult.show();
	}

    function clearModalForm(){
    	var x = $('#employeeModal input');
    	var radio = x.splice(5,2);
    	$(radio[1]).prop('checked','true');
    	x.eq(4).attr('disabled', 'true');
    	x.val('');
    	pc.btnSave.attr('data-for','');
		if (pc.btnSave.is('[emp-id]'))
			pc.btnSave.removeAttr('emp-id');
    }
    function isvalidEmail(email){
    	return pc.emailPattern.test(email);
    }
    function isValidPwd(pwd){
    	return pc.pwdPattern.test(pwd);
    }
    function isValidEmployee(emp){
    	var ret =  (emp.fn&& emp.ln && isvalidEmail(emp.email)
    			&& emp.doj && isvalidPwd(emp.pwd) && emp.dept
    			);
    	if(emp.dot)
    		return ret && emp.doj<emp.dot;
    	return ret;
    }
    function saveEmployeeSH(data){
    	window.alert('success');
    }
    function saveEmployeeHandler(e){
    	var button = $(e.target);
		var method = 'POST';
    	var fields = pc.employeeModal.find('input');
    	var emp = {
    		fn: fields.eq(0).val(),
    		ln: fields.eq(1).val(),
    		email: fields.eq(2).val(),
    		doj: fields.eq(3).val(),
    		dot: fields.eq(4).val(),
    		pwd: fields.eq(7).val()
    	};
    	emp.dept = parseInt(fields.eq(4).closest('.form-group').next().find('select').val(),10);
    	emp.IsAdmin = fields.eq(5).is(':checked')?1:0; 

    	if(button.attr('data-for') == 'edit'){
			method = 'PUT';	
			emp.EmpId = button.attr('emp-id');
		}
		if(isValidEmployee(emp)){
			pc.employeeModal.modal('hide');
			$.ajax({
				url: '/employees',
				method:method,
				data: emp,
				success:saveEmployeeSH
			});
			return false;
		}
		else{
			if((emp.dot && emp.doj>emp.dot) || !isvalidEmail(emp.email) || !isvalidPwd(emp.pwd))
				return false;
			return true;
		}   
    }
    function editEmployeeHandler(data){
    	var fields = pc.employeeModal.find('input');
    	fields.eq(0).val(data.FirstName);
		fields.eq(1).val(data.LastName);
		fields.eq(2).val(data.Email);
		fields.eq(3).val(data.DateOfJoining);
		fields.eq(4).val(data.TerminationDate).removeAttr('disabled')
			  		.closest('.form-group').next().find('select').val(data.DepartmentId);
		fields.eq(7).val(data.Password);
		if(data.IsAdmin){
			fields.eq(5).prop('checked','true');
		}		
    }
	function pageSetup(){
		pc.employeesTemplate = $('#employeesTemplate');
		pc.searchOpts = pc.employeesTemplate.find('#search-options');
		pc.searchResult = pc.employeesTemplate.find('#search-result');
		pc.empTupples = pc.searchResult.find('#emp-tupples');
		pc.searchBtn = pc.searchOpts.find('#search-btn');

		pc.employeeModal = $('#employeeModal',pc.employeesTemplate);		
		pc.btnSave = $('#btnSave',pc.employeeModal);


		pc.searchBtn.on('click',searchEmployee);
		pc.btnSave.on('click',saveEmployeeHandler);
		pc.employeeModal.on('show.bs.modal', function (event) {
		    var button = $(event.relatedTarget);		    
		    var title = button.data('modaltitle');
		    $('#modalTitle',pc.employeeModal).text(title);
		    if(button.attr('action') == "create")
		    	pc.btnSave.attr('data-for', 'create');
		    else if(button.attr('action') =='edit'){
		    	var info = {
		    		'data-for': 'edit',
		    		'emp-id': button.closest('[emp-id]').attr('emp-id')
		    	};		    	
		    	pc.btnSave.attr(info);
		   		$.ajax({
		   			url: '/emp-details',
		   			method: 'GET',
		   			data: {EmpId: info['emp-id']},
		   			success: editEmployeeHandler
		   		});
		    }
		});

		pc.employeeModal.on('hide.bs.modal', clearModalForm);
	}
	// init
	function init(){
	}

	// return
	return {
		init: init,
		handleHash: handleHash
	}
})();