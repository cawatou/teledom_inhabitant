$('document').ready(function () {
	var trigger = $('#hamburger'),
		isClosed = true;

	trigger.click(function () {
		burgerTime();
	});

	function burgerTime() {
		if (isClosed == true) {
			trigger.removeClass('is-open');
			trigger.addClass('is-closed');
			isClosed = false;
			$('.menu,header,body').removeClass('active');
		} else {
			trigger.removeClass('is-closed');
			trigger.addClass('is-open');
			isClosed = true;
			$('.menu,header,body').addClass('active');
		}
	}
	$('#menu1 li').click(function () {
		trigger.removeClass('is-open');
		trigger.addClass('is-closed');
		isClosed = false;
		$('.menu,header,body').removeClass('active');
	});
});

function active(elem) {

	var a = document.getElementsByClassName('item');
	for (i = 0; i < a.length; i++) {
		a[i].classList.remove('active')
	}

	elem.classList.add('active');
}
