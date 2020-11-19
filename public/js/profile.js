window.profile = (function () {
    // var
    var parentClosure = {};
    parentClosure.pwdPattern =   /^(?=.*\d)(?=(.*[!@#$%&*~?^.]))(?=.*[a-zA-Z]).{8,16}$/;
    parentClosure.emailPattern =  /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;  

    // var init

    // functions
    function handleHash(htmlInjector){
    	prepareHTML.htmlInjector = htmlInjector;
    	 $.ajax({
            url: '/profile',
            method: 'GET',            
            data: {},
            success: getProfileSuccessHandler,
            error: function () {
                console.log(arguments);
            }
        });

        if (!prepareHTML.templateFunction) {
            $.ajax({
                url: '/profile-template',
                method: 'GET',
                dataType: 'text',
                data: { },
                success: getTemplateSuccessHandler,
                error: function () {
                    console.log(arguments);
                }
            });
        }
    }   

    function getTemplateSuccessHandler(templateText) {
    	//console.log(templateText);
        prepareHTML.templateFunction = Handlebars.compile(templateText);
        prepareHTML();
    }

    function getProfileSuccessHandler(data) {
    	var html ='';
        if(data.IsAuthenticated === false){
            html = '<p>please <a href = "#login">login</a> first to access this page</p>';
            prepareHTML.htmlInjector(html,null);

        }
        else if(data.IsAuthorised === false){
            html = '<p>please <a href = "#logout">Logout</a> and login with proper role to access this page</p>';
            prepareHTML.htmlInjector(html,null);
        }
        else{
            prepareHTML.data = data;
            prepareHTML();
        }

    }

    function prepareHTML() {
        if (prepareHTML.templateFunction && prepareHTML.data) {
            var html = prepareHTML.templateFunction(prepareHTML.data);
            prepareHTML.htmlInjector(html, pageSetup);
        }
    }

    function handleChangePassword()
    {
    	clearModal();
    	parentClosure.profileModal.modal('show');
    }

    function clearModal()
    {
    	parentClosure.current.val('');
    	parentClosure.newPwd.val('');
    	parentClosure.retype.val('');
    }
    function isvalidPwd(pwd){
        return parentClosure.pwdPattern.test(pwd);
    }

    function isValidData(data){
        var pwdAlertmsg = 'Check length (8-16)\\n'+
                          'Atleast one character out of (!@#$%^&*~?.)\\n'+
                          'Atleast one numeric character';
        if(!isvalidPwd(data.current)){
            alert('check current Password for\\n'+pwdAlertmsg);
            return false;
        }
        else if(!isvalidPwd(data.newPwd)){            
            alert('check new Password for\\n'+pwdAlertmsg);
            return false;
        }
        else if(!isvalidPwd(data.retype)){
            alert('check Confirm Password for\\n'+pwdAlertmsg);
            return false;
        }
        else if(data.newPwd != data.retype)
        {
            alert("new passwords do not match");
            return false;
        }
        return true;
    }
    function savePassword()
    {
        var fields = {};
    	fields.current = parentClosure.current.val();
    	fields.newPwd = parentClosure.newPwd.val();
    	fields.retype = parentClosure.retype.val();
        
        if(isValidData(fields)){
            $.ajax({
                url: '/profile',
                method: 'PUT',            
                data: {             
                    NewPwd: fields.newPwd,
                    current: fields.current
                },
                success: savePasswordSuccessHandler,
                error: function () {
                    console.log(arguments);
                }
            });
        }
    	
    }

    function savePasswordSuccessHandler(data)
    {
        if(data.success){
            parentClosure.profileModal.modal('hide');
            alert(data.msg);
        }
        else
    	   alert(data.msg);
    }

    function pageSetup() {
        // variables init
        parentClosure.profileModal = $('#divProfileTemplate #profileModal');
        parentClosure.btnSave = $('#divProfileTemplate #btnSave');
        parentClosure.btnPwd = $('#divProfileTemplate #btnPwd');
        parentClosure.current = $('#divProfileTemplate #current');
        parentClosure.newPwd = $('#divProfileTemplate #new');
        parentClosure.retype = $('#divProfileTemplate #retype');
        
        // events init
        parentClosure.btnPwd.bind('click',handleChangePassword);
        parentClosure.btnSave.bind('click', savePassword);
    }

    // init
    function init() {
    }

    // return
    return {
        init: init,
        handleHash: handleHash
    }
})();