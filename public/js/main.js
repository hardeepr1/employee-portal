var $liUser = $('#liUser');
var $liLogout = $('#liLogout');
var $liLogin = $('#liLogin');
var $nav = $('.navbar-fixed-top');

var $bodyContent = $('#bodyContent');

function htmlInjector(content,cb){
	$bodyContent.html(content);
	if(typeof cb == 'function')
		cb();
}

function makeActive(hash){
	var toActivate = $nav.find('a[href="'+hash+'"]').parent('li');
	if(toActivate && toActivate.is('li')){
		$nav.find('li.active').removeClass('active');
		toActivate.addClass('active');
	}
}
function hasChangeHandler(e){
	switch(window.location.hash){
			case '#notices':
				window.notices.handleHash(htmlInjector);
				makeActive('#notices');
				break;
			case '#issues':
				window.issues.handleHash(htmlInjector);
				makeActive('#issues');
				break;
			case '#employees':
				window.employees.handleHash(htmlInjector);
				makeActive('#employees');
				break;
			case '#login':
				window.login.handleHash(htmlInjector);
				makeActive('#login');
				break;
			case '#logout':
				window.logout.handleHash(htmlInjector);
				break;
			case '#profile':
				window.profile.handleHash(htmlInjector);
			default:
				makeActive('/');
				break;
		}
}
function getInitData(){
	$.ajax({
		url:'/init',
		method: 'GET',
		data: {},
		success: getInitDataSH
	});
}

function getInitDataSH(data){
	$liLogin.hide();
	$liUser.hide();
	$liLogout.hide();
	if(data.IsAuthenticated){
		window.user = data;
		$liUser.find('a').html('Hi ' + data.userName);
		$liUser.show();
		$liLogout.show();
	}
	else{
		$liLogin.show();
	}
}

function resizeSpacer(e){
	$("body").css("padding-top", $(".navbar-fixed-top").height()+5);
}
function init(){
	window.notices.init();
	window.issues.init();
	window.employees.init();
	window.login.init();
	window.logout.init();
	window.profile.init();

	$(window).on('hashchange',hasChangeHandler);
	$(window).bind('resize.unique', resizeSpacer);
	resizeSpacer();
	hasChangeHandler();
	getInitData();

}

init();