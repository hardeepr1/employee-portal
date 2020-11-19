window.logout = (function(){

	var pc = {};
	function handleHash(htmlInjector){
		$.ajax({
			url: '/logout',
			method: 'GET',
			dataType: 'text',
			data: {
			},
			success: logoutSH,
			error: function(){
				console.log(arguments);
			}
		});
	}

	function logoutSH(){
		window.location.href = '/';
	}

	function init(){
	}
	return {
		init: init,
		handleHash: handleHash
	}
})();