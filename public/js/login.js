window.login = (function(){
	"use strict";
	var pc = {};
	function handleHash(htmlInjector){
		
		prepareHtml.htmlInjector = htmlInjector;
		if(!prepareHtml.templateFunction){
			$.ajax({
				url: '/login-template',
				method: 'GET',
				dataType: 'text',
				data: {},
				success: getTemplateSH,
				error: function(){
					console.log(arguments);
				}
			});
		}
		else{
			prepareHtml();
		}		
	}	

	function getTemplateSH(source){
		prepareHtml.templateFunction = Handlebars.compile(source);
		prepareHtml({error:""});
	}

	function prepareHtml(errObj){
		if(prepareHtml.templateFunction){
			var content = prepareHtml.templateFunction(errObj);
			prepareHtml.htmlInjector(content,pageSetup);
		}
	}

	function showLoginError(){
		if(prepareHtml.templateFunction){
			var content = prepareHtml.templateFunction({error:"Login Failed!"});
			prepareHtml.htmlInjector(content,pageSetup);
		}
	}
	function loginSuccessHandler(data){
		if(!data.IsAuthenticated)
			showLoginError();
		else{
			
			window.location.href = '/';
		}
	}
	function loginHandler(){
		var loginId = pc.username.val();
		var pwd = pc.password.val();
		$.ajax({
				url: '/login',
				method: 'POST',
				data: {
					LoginId: loginId,
					Password: pwd
				},
				success: loginSuccessHandler				
			});
	}
	function pageSetup(){
		pc.divLoginTemplate = $('#divLoginTemplate');
		pc.username = $('#username',pc.divLoginTemplate);
		pc.password = $('#password',pc.divLoginTemplate);
		pc.login = $('#login',pc.divLoginTemplate);		

		pc.login.on('click',loginHandler);

	}

	function init(){
	}
	return{
		init:init,
		handleHash:handleHash
	};
})();